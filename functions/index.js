const functions = require('firebase-functions');
const admin     = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

// ── Helpers ───────────────────────────────────────────────

async function getTokens(familyUid, ownerOnly = false) {
  const col = db.collection('families').doc(familyUid).collection('fcmTokens');
  const snap = ownerOnly
    ? await col.where('isOwner', '==', true).get()
    : await col.get();
  const tokens = snap.docs.map(d => d.data().token).filter(Boolean);
  console.log(`getTokens(${familyUid}, ownerOnly=${ownerOnly}): found ${tokens.length} token(s)`);
  return tokens;
}

async function removeStaleToken(token) {
  const snaps = await db.collectionGroup('fcmTokens')
    .where('token', '==', token).get();
  await Promise.all(snaps.docs.map(d => d.ref.delete()));
}

async function sendToTokens(tokens, title, body, data = {}) {
  if (!tokens.length) { console.log('sendToTokens: no tokens, skipping'); return; }
  console.log(`sendToTokens: sending "${title}" to ${tokens.length} token(s)`);
  const strData = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, String(v)])
  );
  const results = await Promise.allSettled(
    tokens.map(token =>
      admin.messaging().send({
        token,
        notification: { title, body },
        data: strData,
        webpush: {
          notification: { title, body, requireInteraction: false },
          fcmOptions: { link: 'https://zcochavi.github.io/home-management/' },
        },
      })
    )
  );
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      console.log(`token[${i}] sent OK, messageId: ${r.value}`);
    } else {
      console.error(`token[${i}] failed:`, r.reason?.errorInfo?.code || r.reason?.message);
      const code = r.reason?.errorInfo?.code || '';
      if (code.includes('registration-token-not-registered') ||
          code.includes('invalid-registration-token')) {
        removeStaleToken(tokens[i]);
      }
    }
  });
}

async function getClassFamilyUids(classId, genderFilter) {
  const snap = await db.collection('schoolClasses').doc(classId)
    .collection('members').get();
  let docs = snap.docs;
  if (genderFilter && genderFilter !== 'all') {
    const needed = genderFilter === 'boys' ? 'boy' : 'girl';
    docs = docs.filter(d => d.data().gender === needed);
  }
  const uids = [...new Set(docs.map(d => d.data().familyUid).filter(Boolean))];
  console.log(`getClassFamilyUids(${classId}, gender=${genderFilter||'all'}): ${uids.length} family(ies)`);
  return uids;
}

async function getFamilyUidsByPrefix(prefix) {
  const snap = await db.collection('schoolClasses')
    .where(admin.firestore.FieldPath.documentId(), '>=', prefix + '~~')
    .where(admin.firestore.FieldPath.documentId(), '<=', prefix + '~~\uffff')
    .get();
  const memberSnaps = await Promise.all(
    snap.docs.map(d => d.ref.collection('members').get())
  );
  const uids = [...new Set(
    memberSnaps.flatMap(s => s.docs.map(d => d.data().familyUid)).filter(Boolean)
  )];
  console.log(`getFamilyUidsByPrefix(${prefix}): ${uids.length} family(ies)`);
  return uids;
}

async function notifyFamilies(familyUids, posterUid, title, body, data) {
  console.log(`notifyFamilies: ${familyUids.length} total, poster=${posterUid}`);
  const targets = familyUids.filter(uid => uid !== posterUid);
  console.log(`notifyFamilies: ${targets.length} target(s) after excluding poster`);
  if (!targets.length) return;
  const tokenArrays = await Promise.all(targets.map(getTokens));
  await sendToTokens(tokenArrays.flat(), title, body, data);
}

function personFullName(obj) {
  if (!obj) return '';
  const first = obj.firstName || '';
  const last  = obj.familyName || '';
  return (first && last) ? first + ' ' + last : last || first;
}

// Same UID as ADMIN_UID in index.html — paste yours here
const ADMIN_UID = 'TirsqoPeWHfpB3kIULJh4UM3e2r1';

function classLabel(classId) {
  const [city, school, grade, classNum] = classId.split('~~');
  return `${school || city} · כיתה ${grade || ''}${classNum ? "'" + classNum : ''}`;
}

const DEFAULT_CONFIG = {
  committeeApplications: { expiryDays: 5, reminderHoursBeforeExpiry: 24, notifyOnDecision: true },
  pendingEvents:         { expiryDays: 7, reminderHoursBeforeExpiry: 24, notifyOnDecision: true },
};

async function getNotificationConfig() {
  try {
    const snap = await db.collection('appConfig').doc('notifications').get();
    if (!snap.exists) return DEFAULT_CONFIG;
    const data = snap.data();
    return {
      committeeApplications: { ...DEFAULT_CONFIG.committeeApplications, ...(data.committeeApplications || {}) },
      pendingEvents:         { ...DEFAULT_CONFIG.pendingEvents,         ...(data.pendingEvents || {}) },
    };
  } catch(e) {
    console.warn('getNotificationConfig: using defaults, error:', e.message);
    return DEFAULT_CONFIG;
  }
}

// ── Triggers ──────────────────────────────────────────────

exports.onPendingEventCreated = functions.firestore
  .document('schoolClasses/{classId}/pendingEvents/{pendingId}')
  .onCreate(async (snap, ctx) => {
    const ev  = snap.data();
    const cid = ctx.params.classId;
    console.log(`onPendingEventCreated: classId=${cid}, title="${ev.title}", poster=${ev.postedBy?.familyUid}`);

    // Get all class members
    const membersSnap = await db.collection('schoolClasses').doc(cid).collection('members').get();
    const familyUids  = [...new Set(membersSnap.docs.map(d => d.data().familyUid).filter(Boolean))];

    // Fetch family docs to find committee members
    const familyDocs = await Promise.all(
      familyUids.map(uid => db.collection('families').doc(uid).get().catch(() => null))
    );
    const posterUid = ev.postedBy?.familyUid;
    // Committee members for this class + admin, never the poster themselves
    const targetUids = familyDocs
      .filter(d => {
        if (!d?.exists || d.id === posterUid) return false;
        const fd = d.data();
        return (fd.committeeClasses||[]).includes(cid) || fd.role === 'committee';
      })
      .map(d => d.id);
    if (ADMIN_UID && !targetUids.includes(ADMIN_UID) && ADMIN_UID !== posterUid)
      targetUids.push(ADMIN_UID);
    console.log(`onPendingEventCreated: notifying ${targetUids.length} committee/admin user(s)`);
    if (!targetUids.length) return;

    const tokenArrays = await Promise.all(targetUids.map(uid => getTokens(uid, uid === ADMIN_UID)));
    const poster = personFullName(ev.postedBy);
    await sendToTokens(tokenArrays.flat(),
      `⏳ ממתין לאישור: ${ev.title}`,
      `${poster ? poster + ' · ' : ''}${classLabel(cid)}`,
      { type: 'pendingApproval', classId: cid, pendingId: ctx.params.pendingId }
    );

    // Set expiresAt based on config
    const cfg = await getNotificationConfig();
    const expiresAt = new Date(Date.now() + cfg.pendingEvents.expiryDays * 24 * 3600 * 1000);
    await snap.ref.update({ expiresAt: admin.firestore.Timestamp.fromDate(expiresAt) });
  });

exports.onClassEventCreated = functions.firestore
  .document('schoolClasses/{classId}/events/{eventId}')
  .onCreate(async (snap, ctx) => {
    const ev  = snap.data();
    const cid = ctx.params.classId;
    console.log(`onClassEventCreated: classId=${cid}, title="${ev.title}", posterUid=${ev.postedBy?.familyUid}`);
    const uids = await getClassFamilyUids(cid, ev.genderFilter);
    const poster = personFullName(ev.postedBy);
    const body   = poster ? `${poster} · ${classLabel(cid)}` : classLabel(cid);
    await notifyFamilies(uids, ev.postedBy?.familyUid, ev.title, body,
      { type: 'classEvent', classId: cid, eventId: ctx.params.eventId });

    // If this event went through the approval flow, notify the original poster
    if (ev.approvedBy && ev.postedBy?.familyUid) {
      const cfg = await getNotificationConfig();
      if (cfg.pendingEvents.notifyOnDecision) {
        const approverName = personFullName(ev.approvedBy);
        const posterTokens = await getTokens(ev.postedBy.familyUid);
        await sendToTokens(posterTokens,
          `✅ האירוע שלך אושר: ${ev.title}`,
          approverName ? `אושר על ידי ${approverName} · ${classLabel(cid)}` : classLabel(cid),
          { type: 'eventApproved', classId: cid, eventId: ctx.params.eventId }
        );
      }
    }
  });

exports.onGradeEventCreated = functions.firestore
  .document('schoolGrades/{gradeId}/events/{eventId}')
  .onCreate(async (snap, ctx) => {
    const ev  = snap.data();
    const gid = ctx.params.gradeId;
    const [city, school, grade] = gid.split('~~');
    console.log(`onGradeEventCreated: gradeId=${gid}, title="${ev.title}"`);
    const uids = await getFamilyUidsByPrefix(gid);
    const poster = personFullName(ev.postedBy);
    const body   = `${poster ? poster + ' · ' : ''}${school || city} · שכבה ${grade || ''}`;
    await notifyFamilies(uids, ev.postedBy?.familyUid, ev.title, body,
      { type: 'gradeEvent', gradeId: gid, eventId: ctx.params.eventId });
  });

exports.onSchoolEventCreated = functions.firestore
  .document('schools/{schoolId}/events/{eventId}')
  .onCreate(async (snap, ctx) => {
    const ev  = snap.data();
    const sid = ctx.params.schoolId;
    const [city, school] = sid.split('~~');
    console.log(`onSchoolEventCreated: schoolId=${sid}, title="${ev.title}"`);
    const uids = await getFamilyUidsByPrefix(sid);
    const poster = personFullName(ev.postedBy);
    const body   = `${poster ? poster + ' · ' : ''}${school || city}`;
    await notifyFamilies(uids, ev.postedBy?.familyUid, ev.title, body,
      { type: 'schoolEvent', schoolId: sid, eventId: ctx.params.eventId });
  });

exports.onApplicationCreated = functions.firestore
  .document('committeeApplications/{appId}')
  .onCreate(async (snap, ctx) => {
    const app = snap.data();
    const cid = app.classId;
    console.log(`onApplicationCreated: ${app.applicantName} applied for class ${cid}`);

    // Notify admin
    const targets = [];
    if (ADMIN_UID && ADMIN_UID !== app.applicantUid) targets.push(ADMIN_UID);

    // Notify all class members (to vote), excluding applicant
    const memberUids = await getClassFamilyUids(cid);
    memberUids.filter(uid => uid !== app.applicantUid && !targets.includes(uid))
              .forEach(uid => targets.push(uid));

    if (!targets.length) return;
    const tokenArrays = await Promise.all(targets.map(uid => getTokens(uid, uid === ADMIN_UID)));
    await sendToTokens(tokenArrays.flat(),
      `👤 מועמדות חדשה לוועד: ${app.applicantName}`,
      `${classLabel(cid)} · ${app.voteCount||0}/15 תמיכות`,
      { type: 'committeeApplication', appId: ctx.params.appId, classId: cid }
    );

    // Set expiresAt based on config
    const cfg = await getNotificationConfig();
    const expiresAt = new Date(Date.now() + cfg.committeeApplications.expiryDays * 24 * 3600 * 1000);
    await snap.ref.update({ expiresAt: admin.firestore.Timestamp.fromDate(expiresAt) });
  });

exports.onApplicationUpdated = functions.firestore
  .document('committeeApplications/{appId}')
  .onUpdate(async (change, ctx) => {
    const before = change.before.data();
    const after  = change.after.data();
    if (before.status === after.status) return; // no status change
    const applicantUid = after.applicantUid;
    const cfg = await getNotificationConfig();

    if (after.status === 'approved') {
      // Grant committee role for the specific class
      const classId = after.classId;
      await db.collection('families').doc(applicantUid)
        .update({ committeeClasses: admin.firestore.FieldValue.arrayUnion(classId) })
        .catch(e => console.error('grant committeeClasses:', e));

      // Notify applicant
      if (cfg.committeeApplications.notifyOnDecision) {
        const reason = after.decisionReason === 'admin'
          ? 'אושרת על ידי מנהל המערכת'
          : 'אושרת על ידי הצבעת 15 הורים';
        const tokens = await getTokens(applicantUid);
        await sendToTokens(tokens,
          '🎉 המועמדות שלך לוועד ההורים אושרה!',
          reason,
          { type: 'applicationApproved', classId: after.classId }
        );
      }
    } else if (after.status === 'denied') {
      // Notify applicant
      if (cfg.committeeApplications.notifyOnDecision) {
        const reason = after.decisionReason === 'expired'
          ? 'לא הגעת לרוב הנדרש של 15 תמיכות תוך 5 ימים'
          : after.decisionReason === 'admin'
            ? 'נדחתה על ידי מנהל המערכת'
            : 'נדחתה';
        const tokens = await getTokens(applicantUid);
        await sendToTokens(tokens,
          '❌ המועמדות שלך לוועד ההורים נדחתה',
          reason,
          { type: 'applicationDenied', classId: after.classId }
        );
      }
    }
  });

exports.onPendingSchoolCreated = functions.firestore
  .document('pendingSchools/{reqId}')
  .onCreate(async (snap, ctx) => {
    const req = snap.data();
    const label = req.type === 'city'
      ? `עיר חדשה: ${req.city}`
      : `בית ספר חדש: ${req.schoolName} (${req.city})`;
    const requester = personFullName(req.requestedBy);
    console.log(`onPendingSchoolCreated: ${label} by ${requester}`);

    const reqUid = req.requestedBy?.familyUid;
    if (!ADMIN_UID || reqUid === ADMIN_UID) return;

    // Bell notification for admin
    const bellMsg = `${label}${requester ? ` · הוגש על ידי ${requester}` : ''}`;
    await writeNotif(ADMIN_UID, 'school_pending', bellMsg, { recipientUid: ADMIN_UID, requestedByUid: reqUid, reqId: ctx.params.reqId });

    // Push notification for admin
    const tokens = await getTokens(ADMIN_UID, true);
    await sendToTokens(tokens,
      `🏫 בקשה חדשה: ${label}`,
      requester ? `הוגש על ידי ${requester}` : '',
      { type: 'pendingSchool', reqId: ctx.params.reqId }
    );
  });

exports.onPendingSchoolUpdated = functions.firestore
  .document('pendingSchools/{reqId}')
  .onUpdate(async (change, ctx) => {
    const before = change.before.data();
    const after  = change.after.data();
    if (before.status === after.status) return;

    const label = after.type === 'city'
      ? `עיר: ${after.city}`
      : `בית ספר: ${after.schoolName} (${after.city})`;

    for (const pf of (after.pendingFamilies || [])) {
      const tokens = await getTokens(pf.familyUid);
      if (after.status === 'approved') {
        await sendToTokens(tokens,
          `✅ הבקשה שלך אושרה`,
          `${label} · ${pf.kidName} שויך/ה לכיתה`,
          { type: 'schoolApproved', reqId: ctx.params.reqId }
        );
      } else if (after.status === 'denied') {
        await sendToTokens(tokens,
          `❌ הבקשה שלך נדחתה`,
          label,
          { type: 'schoolDenied', reqId: ctx.params.reqId }
        );
      }
    }
  });

exports.dailyNotificationJobs = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    const cfg = await getNotificationConfig();
    const now = admin.firestore.Timestamp.now();

    // ── committeeApplications ──────────────────────────────
    const appReminderCutoff = admin.firestore.Timestamp.fromMillis(
      now.toMillis() + cfg.committeeApplications.reminderHoursBeforeExpiry * 3600 * 1000
    );

    const appsAll = await db.collection('committeeApplications')
      .where('status', '==', 'pending').get();

    for (const doc of appsAll.docs) {
      const app = doc.data();
      if (!app.expiresAt) continue;
      const expiresMs = app.expiresAt.toMillis();

      if (expiresMs <= now.toMillis()) {
        // Expire
        await doc.ref.update({
          status: 'denied',
          decisionReason: 'expired',
          decidedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`dailyNotificationJobs: expired application ${doc.id}`);
      } else if (expiresMs <= appReminderCutoff.toMillis() && !app.reminderSentAt) {
        // Reminder
        const targets = [];
        if (ADMIN_UID && ADMIN_UID !== app.applicantUid) targets.push(ADMIN_UID);
        const memberUids = await getClassFamilyUids(app.classId);
        memberUids.filter(uid => uid !== app.applicantUid && !targets.includes(uid))
                  .forEach(uid => targets.push(uid));
        if (targets.length) {
          const tokenArrays = await Promise.all(targets.map(uid => getTokens(uid, uid === ADMIN_UID)));
          const hoursLeft = Math.round((expiresMs - now.toMillis()) / 3600000);
          await sendToTokens(tokenArrays.flat(),
            `⏰ תזכורת: מועמדות ועד ממתינה`,
            `${app.applicantName} · ${classLabel(app.classId)} · עוד ${hoursLeft} שעות`,
            { type: 'committeeApplicationReminder', appId: doc.id, classId: app.classId }
          );
        }
        await doc.ref.update({ reminderSentAt: admin.firestore.FieldValue.serverTimestamp() });
        console.log(`dailyNotificationJobs: sent reminder for application ${doc.id}`);
      }
    }

    // ── pendingEvents ──────────────────────────────────────
    const evReminderCutoff = admin.firestore.Timestamp.fromMillis(
      now.toMillis() + cfg.pendingEvents.reminderHoursBeforeExpiry * 3600 * 1000
    );

    const eventsAll = await db.collectionGroup('pendingEvents')
      .where('status', '==', 'pending').get();

    for (const doc of eventsAll.docs) {
      const ev = doc.data();
      if (!ev.expiresAt) continue;
      const expiresMs = ev.expiresAt.toMillis();
      const classId = doc.ref.parent.parent.id;

      if (expiresMs <= now.toMillis()) {
        // Expire (auto-reject)
        await doc.ref.update({
          status: 'rejected',
          rejectedReason: 'expired',
          rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // Notify submitter if configured
        if (cfg.pendingEvents.notifyOnDecision && ev.postedBy?.familyUid) {
          const tokens = await getTokens(ev.postedBy.familyUid);
          await sendToTokens(tokens,
            `❌ הבקשה שלך פגה`,
            `"${ev.title}" לא אושרה בזמן · ${classLabel(classId)}`,
            { type: 'pendingEventExpired', classId }
          );
        }
        console.log(`dailyNotificationJobs: expired pendingEvent ${doc.id} in ${classId}`);
      } else if (expiresMs <= evReminderCutoff.toMillis() && !ev.reminderSentAt) {
        // Reminder to committee + admin
        const uids = await getClassFamilyUids(classId);
        const familyDocs = await Promise.all(
          uids.map(uid => db.collection('families').doc(uid).get().catch(() => null))
        );
        const targets = familyDocs
          .filter(d => {
            if (!d?.exists) return false;
            const fd = d.data();
            return (fd.committeeClasses||[]).includes(classId) || fd.role === 'committee';
          })
          .map(d => d.id);
        if (ADMIN_UID && !targets.includes(ADMIN_UID)) targets.push(ADMIN_UID);
        if (targets.length) {
          const tokenArrays = await Promise.all(targets.map(uid => getTokens(uid, uid === ADMIN_UID)));
          const hoursLeft = Math.round((expiresMs - now.toMillis()) / 3600000);
          await sendToTokens(tokenArrays.flat(),
            `⏰ תזכורת: אירוע ממתין לאישור`,
            `${ev.title} · ${classLabel(classId)} · עוד ${hoursLeft} שעות`,
            { type: 'pendingEventReminder', classId, pendingId: doc.id }
          );
        }
        await doc.ref.update({ reminderSentAt: admin.firestore.FieldValue.serverTimestamp() });
        console.log(`dailyNotificationJobs: sent reminder for pendingEvent ${doc.id}`);
      }
    }

    return null;
  });

exports.updatePresence = functions.https.onCall(async (data, context) => {
  if (!context.auth?.uid) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  const { familyUid, memberName, familyName, role, online } = data;
  if (!familyUid || !memberName) throw new functions.https.HttpsError('invalid-argument', 'Missing fields');
  const docId = familyUid + '_' + memberName;
  await db.collection('presence').doc(docId).set({
    familyUid, memberName, familyName: familyName || '', role: role || 'parent',
    online: online !== false,
    lastSeen: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
  // Delete any stale duplicate docs for this member with a different document ID
  const dupes = await db.collection('presence')
    .where('familyUid', '==', familyUid)
    .where('memberName', '==', memberName)
    .get();
  const deletes = dupes.docs.filter(d => d.id !== docId).map(d => d.ref.delete());
  if (deletes.length) await Promise.all(deletes);
  return { ok: true };
});

exports.getPresence = functions.https.onCall(async (data, context) => {
  if (context.auth?.uid !== ADMIN_UID) {
    throw new functions.https.HttpsError('permission-denied', 'Admins only');
  }

  // mode: 'default' — initial load (all presence, returns online + first offline page + stats)
  // mode: 'online'  — fast heartbeat refresh (queries only online=true docs)
  // mode: 'browse'  — paginated offline list
  // mode: 'search'  — paginated search across all members
  const mode      = data?.mode || 'default';
  const searchQ   = (data?.search || '').trim().toLowerCase();
  const page      = Math.max(0, parseInt(data?.page || 0));
  const PAGE_SIZE = 50;
  const ONLINE_THRESHOLD = 8 * 60 * 1000;
  const now = Date.now();

  function buildMember(p) {
    if (!p.familyUid || !p.memberName) return null;
    const lastSeenMs = p.lastSeen?.toMillis?.() || 0;
    return {
      familyUid:  p.familyUid,
      memberName: p.memberName,
      familyName: p.familyName || '',
      role:       p.role || 'parent',
      online:     p.online === true && lastSeenMs > now - ONLINE_THRESHOLD,
      lastSeenMs,
    };
  }

  // Fast path — only online docs (30s heartbeat refresh, ~50 reads instead of ~1K)
  if (mode === 'online') {
    const snap = await db.collection('presence').where('online', '==', true).get();
    const online = snap.docs.map(d => buildMember(d.data())).filter(m => m?.online);
    online.sort((a, b) => b.lastSeenMs - a.lastSeenMs);
    return { online };
  }

  // Full read: presence + families (to include members who never logged in)
  const [presenceSnap, familiesSnap] = await Promise.all([
    db.collection('presence').get(),
    db.collection('families').get(),
  ]);

  // Seed memberMap from families so everyone appears even without a presence doc
  const memberMap = {};
  familiesSnap.docs.forEach(famDoc => {
    const fam = famDoc.data();
    (fam.members || []).forEach(m => {
      const key = famDoc.id + '_' + (m.name || '');
      memberMap[key] = {
        familyUid:  famDoc.id,
        memberName: m.name || '',
        familyName: fam.familyName || '',
        role:       m.role || 'parent',
        online:     false,
        lastSeenMs: 0,
      };
    });
  });

  // Merge presence records (most recent wins)
  presenceSnap.docs.forEach(d => {
    const m = buildMember(d.data());
    if (!m) return;
    const key = m.familyUid + '_' + m.memberName;
    if (!memberMap[key] || m.lastSeenMs >= memberMap[key].lastSeenMs) memberMap[key] = m;
  });

  const allMembers = Object.values(memberMap);
  allMembers.sort((a, b) =>
    (b.online ? 1 : 0) - (a.online ? 1 : 0) || b.lastSeenMs - a.lastSeenMs
  );

  if (mode === 'default') {
    const online  = allMembers.filter(m => m.online);
    const offline = allMembers.filter(m => !m.online);
    return {
      online,
      offlineSlice: offline.slice(0, PAGE_SIZE),
      offlineTotal: offline.length,
      stats: {
        pOnline:  online.filter(m => m.role !== 'kid').length,
        kOnline:  online.filter(m => m.role === 'kid').length,
        pOffline: offline.filter(m => m.role !== 'kid').length,
        kOffline: offline.filter(m => m.role === 'kid').length,
      },
      pageSize: PAGE_SIZE,
    };
  }

  // 'browse' (offline pagination) or 'search'
  const pool = searchQ
    ? allMembers.filter(m =>
        m.memberName.toLowerCase().includes(searchQ) ||
        m.familyName.toLowerCase().includes(searchQ))
    : allMembers.filter(m => !m.online);

  const start = page * PAGE_SIZE;
  return {
    members:  pool.slice(start, start + PAGE_SIZE),
    total:    pool.length,
    page,
    hasMore:  start + PAGE_SIZE < pool.length,
    pageSize: PAGE_SIZE,
  };
});

exports.getAnalytics = functions.https.onCall(async (data, context) => {
  if (context.auth?.uid !== ADMIN_UID) {
    throw new functions.https.HttpsError('permission-denied', 'Admins only');
  }

  // Families & members
  const familiesSnap = await db.collection('families').get();
  const families = familiesSnap.docs.map(d => ({ _id: d.id, ...d.data() }));
  const familyCount = families.length;
  const parentCount = families.reduce((n,f) => n + (f.members||[]).filter(m=>m.role==='parent').length, 0);
  const kidCount    = families.reduce((n,f) => n + (f.members||[]).filter(m=>m.role==='kid').length, 0);

  // Active classes
  const classesSnap = await db.collection('schoolClasses').get();
  const classCount  = classesSnap.size;
  const classNames  = {};
  classesSnap.docs.forEach(d => {
    const c = d.data();
    classNames[d.id] = (c.schoolName || c.city || '') + ' · כיתה ' + (c.grade||'') + (c.classNum ? "'" + c.classNum : '');
  });

  // Admin log — events approved/rejected
  const logSnap    = await db.collection('adminLog').orderBy('actionAt','desc').get();
  const logEntries = logSnap.docs.map(d => ({ id:d.id, ...d.data() }));

  const approvedCount  = logEntries.filter(e=>e.action==='approved').length;
  const rejectedCount  = logEntries.filter(e=>e.action==='rejected').length;

  // Events by month (last 6 months)
  const sixMonthsAgo = Date.now() - 180*24*3600*1000;
  const byMonth = {};
  logEntries.forEach(e => {
    const ms = e.actionAt?.toMillis?.() || 0;
    if (ms < sixMonthsAgo) return;
    const dt  = new Date(ms);
    const key = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`;
    byMonth[key] = (byMonth[key]||0) + 1;
  });
  const eventsByMonth = Object.entries(byMonth).sort();

  // Events by class (top 8)
  const byClass = {};
  logEntries.forEach(e => { if (e.classId) byClass[e.classId] = (byClass[e.classId]||0)+1; });
  const eventsByClass = Object.entries(byClass).sort((a,b)=>b[1]-a[1]).slice(0,8);

  // Recent log (last 10, with class name)
  const recentLog = logEntries.slice(0,10).map(e => ({
    action:     e.action,
    eventTitle: e.eventTitle || '',
    className:  classNames[e.classId] || e.classId || '',
    actionAt:   e.actionAt?.toMillis?.() || null,
  }));

  // Committee applications
  const appsSnap  = await db.collection('committeeApplications').get();
  const apps = appsSnap.docs.map(d=>d.data());
  const appsPending  = apps.filter(a=>a.status==='pending').length;
  const appsApproved = apps.filter(a=>a.status==='approved').length;
  const appsDenied   = apps.filter(a=>a.status==='denied').length;

  // Pending schools
  const schoolsSnap = await db.collection('pendingSchools').get();
  const schools = schoolsSnap.docs.map(d=>d.data());
  const schoolsPending  = schools.filter(s=>s.status==='pending').length;
  const schoolsApproved = schools.filter(s=>s.status==='approved').length;
  const schoolsDenied   = schools.filter(s=>s.status==='denied').length;

  // Leaderboard
  let leaderboardDays = 30, topSchool = null, topCity = null, topUser = null;
  try {
    const lbConfigSnap = await db.collection('appConfig').doc('leaderboard').get();
    if (lbConfigSnap.exists) leaderboardDays = lbConfigSnap.data().days || 30;
    const lbCutoffMs = Date.now() - leaderboardDays * 24 * 3600 * 1000;

    // Top city & school — from family members (kids)
    const schoolToCity = {};
    classesSnap.docs.forEach(d => {
      const c = d.data();
      if (c.schoolName && c.city) schoolToCity[c.schoolName] = c.city;
    });
    const schoolCount = {}, cityCount = {};
    families.forEach((fam, _, arr) => {
      if (fam._id === ADMIN_UID) return; // exclude admin family
      (fam.members||[]).filter(m => m.role === 'kid').forEach(kid => {
        const school = (kid.school?.name || '').trim();
        const city   = (kid.school?.city || '').trim();
        if (school) schoolCount[school] = (schoolCount[school]||0) + 1;
        if (city)   cityCount[city]     = (cityCount[city]||0)   + 1;
      });
    });
    topSchool = Object.entries(schoolCount).sort((a,b)=>b[1]-a[1])[0] || null;
    topCity   = Object.entries(cityCount).sort((a,b)=>b[1]-a[1])[0]   || null;

    // Top user by session duration — fetch all, filter in-memory (no index needed)
    const sessionsSnap = await db.collection('sessions').get();
    const userDuration = {};
    sessionsSnap.docs.forEach(d => {
      const s = d.data();
      if (!s.durationMs) return;
      if (s.familyUid === ADMIN_UID) return; // exclude admin
      const startMs = s.startTime?.toMillis?.() || 0;
      if (startMs < lbCutoffMs) return;
      const key = (s.familyUid||'') + '_' + (s.memberName||'');
      if (!userDuration[key]) userDuration[key] = { memberName: s.memberName||'', familyName: s.familyName||'', durationMs: 0 };
      userDuration[key].durationMs += s.durationMs;
    });
    topUser = Object.values(userDuration).sort((a,b)=>b.durationMs-a.durationMs)[0] || null;
  } catch(e) {
    console.error('[getAnalytics] leaderboard error:', e);
  }

  return {
    familyCount, parentCount, kidCount, classCount,
    approvedCount, rejectedCount,
    eventsByMonth, eventsByClass,
    recentLog,
    appsPending, appsApproved, appsDenied,
    schoolsPending, schoolsApproved, schoolsDenied,
    leaderboardDays, topSchool, topCity, topUser,
  };
});

exports.migrateCommitteeRoles = functions.https.onCall(async (data, context) => {
  if (context.auth?.uid !== ADMIN_UID) {
    throw new functions.https.HttpsError('permission-denied', 'Admins only');
  }

  const familiesSnap = await db.collection('families').where('role', '==', 'committee').get();
  let migrated = 0, skipped = 0, errors = 0;

  for (const famDoc of familiesSnap.docs) {
    const famData = famDoc.data();
    if ((famData.committeeClasses || []).length > 0) { skipped++; continue; }

    const n = s => (s||'').trim().replace(/\s+/g,' ').replace(/\//g,'-').replace(/~/g,'');
    const members = famData.members || [];
    const classIds = [...new Set(
      members
        .filter(m => m.role === 'kid' && m.school?.city && m.school?.grade)
        .map(m => [n(m.school.city), n(m.school.name||''), m.school.grade, n(m.school.classNum||'')].join('~~'))
    )];

    if (!classIds.length) { skipped++; continue; }

    try {
      await db.collection('families').doc(famDoc.id).update({
        committeeClasses: classIds,
        role: admin.firestore.FieldValue.delete(),
      });
      migrated++;
    } catch(e) {
      console.error(`migrateCommitteeRoles: ${famDoc.id}:`, e);
      errors++;
    }
  }

  return { migrated, skipped, errors };
});

function classIdFor(school) {
  if (!school?.city?.trim() || !school?.grade) return null;
  const n = s => (s||'').trim().replace(/\s+/g,' ').replace(/\//g,'-').replace(/~/g,'');
  return [n(school.city), n(school.name||''), school.grade, n(school.classNum||'')].join('~~');
}
function classMemberDocId(familyUid, kidName) {
  return familyUid + '__' + kidName.replace(/[^a-z0-9א-תA-Z\u0590-\u05FF]/gi,'_');
}
async function registerKidInClass(pf, school, familyName, gender, dob) {
  const classId = classIdFor(school);
  if (!classId || !pf.familyUid) return;
  await db.collection('schoolClasses').doc(classId).set(
    { city: school.city, schoolName: school.name||'', grade: school.grade, classNum: school.classNum||'' },
    { merge: true }
  );
  const memberDoc = {
    kidName: pf.kidName,
    familyUid: pf.familyUid,
    familyName: familyName || '',
    addedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  if (gender) memberDoc.gender = gender;
  if (dob)    memberDoc.dob    = dob;
  await db.collection('schoolClasses').doc(classId)
    .collection('members').doc(classMemberDocId(pf.familyUid, pf.kidName)).set(memberDoc);
}

async function writeNotif(familyUid, type, message, extra = {}) {
  await db.collection('families').doc(familyUid)
    .collection('notifications').add({
      type,
      message,
      dismissed: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      ...extra,
    });
}

// Resolve one part ('city' or 'school') of a type:'city' pending request
exports.resolveSchoolPart = functions.https.onCall(async (data, context) => {
  if (context.auth?.uid !== ADMIN_UID)
    throw new functions.https.HttpsError('permission-denied', 'Admins only');
  const { id, part, action } = data; // part: 'city'|'school', action: 'approved'|'denied'

  const ref     = db.collection('pendingSchools').doc(id);
  const docSnap = await ref.get();
  if (!docSnap.exists) throw new functions.https.HttpsError('not-found', 'Request not found');
  const req = docSnap.data();

  // Record this part's decision
  const update = { [`${part}Status`]: action };
  await ref.update(update);

  // Re-read to get full current state
  const updated       = (await ref.get()).data();
  const cityStatus    = updated.cityStatus   || 'pending';
  const schoolStatus  = updated.schoolStatus || 'pending';
  const bothResolved  = cityStatus !== 'pending' && schoolStatus !== 'pending';
  const bothApproved  = cityStatus === 'approved' && schoolStatus === 'approved';
  // City denied => whole request is denied immediately (school can't exist without a city)
  const anyDenied     = cityStatus === 'denied'   || schoolStatus === 'denied';

  // Still waiting: city approved but school not yet decided
  if (!bothResolved && !anyDenied) return { ok: true, state: 'partial' };

  // Both parts decided — finalise
  if (bothApproved) {
    // Add school to index
    await db.collection('schoolIndex').doc('cities_list')
      .set({ cities: admin.firestore.FieldValue.arrayUnion(req.city) }, { merge: true });
    await db.collection('schoolIndex').doc('schools__' + (req.city||'').trim().toLowerCase().replace(/\s+/g,'_').replace(/[^\w\u0590-\u05FF]/g,''))
      .set({ schools: admin.firestore.FieldValue.arrayUnion(req.schoolName) }, { merge: true });

    // Register families & notify
    for (const pf of (req.pendingFamilies || [])) {
      try {
        const famSnap = await db.collection('families').doc(pf.familyUid).get();
        if (!famSnap.exists) continue;
        const famData = famSnap.data();
        const kidMember = (famData.members||[]).find(m => m.name === pf.kidName);
        const members = famData.members.map(m =>
          m.name === pf.kidName ? (({ schoolPending, ...rest }) => rest)(m) : m
        );
        await db.collection('families').doc(pf.familyUid).update({ members });
        await registerKidInClass(pf, pf.school || { city: req.city, name: req.schoolName, grade: kidMember?.school?.grade, classNum: kidMember?.school?.classNum }, famData.familyName, kidMember?.gender, kidMember?.dob);
        const msg = `בקשת הצטרפות של ${pf.kidName} לבית הספר ${req.schoolName} אושרה`;
        const tokens = await getTokens(pf.familyUid);
        await sendToTokens(tokens, '✅ בית הספר אושר', msg);
        await writeNotif(pf.familyUid, 'school_approved', msg);
      } catch(e) { console.error('resolveSchoolPart approve family:', e); }
    }
    await ref.update({ status: 'approved' });
  } else if (anyDenied) {
    // Build a clear message about exactly what was approved/denied
    let msg;
    if (cityStatus === 'denied') {
      msg = `בקשת העיר "${req.city}" עבור ${'{KID}'} נדחתה — יש לבחור עיר ובית ספר מחדש בניהול המשפחה`;
    } else {
      // city approved, school denied
      msg = `העיר "${req.city}" אושרה, אך בית הספר "${req.schoolName}" עבור ${'{KID}'} נדחה — יש לבחור בית ספר אחר בניהול המשפחה`;
    }
    for (const pf of (req.pendingFamilies || [])) {
      try {
        const famSnap = await db.collection('families').doc(pf.familyUid).get();
        if (!famSnap.exists) continue;
        const members = famSnap.data().members.map(m => {
          if (m.name !== pf.kidName) return m;
          const u = { ...m };
          delete u.schoolPending;
          // If city was approved, keep city on the member; only clear school name/pending
          if (cityStatus === 'approved') {
            u.school = { city: req.city, name: '', grade: m.school?.grade || '', classNum: m.school?.classNum || '' };
          } else {
            delete u.school;
          }
          return u;
        });
        await db.collection('families').doc(pf.familyUid).update({ members });
        const finalMsg = msg.replace('{KID}', pf.kidName);
        const tokens = await getTokens(pf.familyUid);
        await sendToTokens(tokens, '⚠️ עדכון בקשת בית הספר', finalMsg);
        await writeNotif(pf.familyUid, 'school_denied', finalMsg);
      } catch(e) { console.error('resolveSchoolPart deny family:', e); }
    }
    await ref.update({ status: 'denied' });
  }

  return { ok: true, state: bothApproved ? 'approved' : 'denied' };
});

exports.approveSchoolRequest = functions.https.onCall(async (data, context) => {
  if (context.auth?.uid !== ADMIN_UID)
    throw new functions.https.HttpsError('permission-denied', 'Admins only');
  const { id, adminName } = data;
  const docSnap = await db.collection('pendingSchools').doc(id).get();
  if (!docSnap.exists) throw new functions.https.HttpsError('not-found', 'Request not found');
  const req = docSnap.data();

  if (req.type === 'city' && (req.cityStatus || 'pending') === 'pending')
    throw new functions.https.HttpsError('failed-precondition', 'City must be approved before the school');

  // Register each waiting family's kid in class & clear pending flag
  for (const pf of (req.pendingFamilies || [])) {
    try {
      const famSnap = await db.collection('families').doc(pf.familyUid).get();
      if (!famSnap.exists) continue;
      const famData = famSnap.data();
      const kidMember = (famData.members||[]).find(m => m.name === pf.kidName);
      const members = famData.members.map(m =>
        m.name === pf.kidName ? (({ schoolPending, ...rest }) => rest)(m) : m
      );
      await db.collection('families').doc(pf.familyUid).update({ members });
      const school = pf.school || { city: req.city, name: req.schoolName, grade: kidMember?.school?.grade, classNum: kidMember?.school?.classNum };
      await registerKidInClass(pf, school, famData.familyName, kidMember?.gender, kidMember?.dob);
      const schoolLabel = req.schoolName || req.city || '';
      const msg = `בקשת הצטרפות של ${pf.kidName} לבית הספר ${schoolLabel} אושרה`;
      const tokens = await getTokens(pf.familyUid);
      await sendToTokens(tokens, '✅ בית הספר אושר', msg);
      await writeNotif(pf.familyUid, 'school_approved', msg);
    } catch(e) { console.error('approveSchoolRequest family:', e); }
  }

  await db.collection('pendingSchools').doc(id).update({
    status: 'approved',
    approvedBy: adminName || 'admin',
    approvedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { ok: true };
});

exports.denySchoolRequest = functions.https.onCall(async (data, context) => {
  if (context.auth?.uid !== ADMIN_UID)
    throw new functions.https.HttpsError('permission-denied', 'Admins only');
  const { id, adminName } = data;
  const docSnap = await db.collection('pendingSchools').doc(id).get();
  if (!docSnap.exists) throw new functions.https.HttpsError('not-found', 'Request not found');
  const req = docSnap.data();

  // Clear school data & notify each affected family
  for (const pf of (req.pendingFamilies || [])) {
    try {
      const famSnap = await db.collection('families').doc(pf.familyUid).get();
      if (!famSnap.exists) continue;
      const members = famSnap.data().members.map(m => {
        if (m.name !== pf.kidName) return m;
        const u = { ...m };
        delete u.school;
        delete u.schoolPending;
        return u;
      });
      await db.collection('families').doc(pf.familyUid).update({ members });

      // Notify the family
      const schoolLabel = req.schoolName || req.city || '';
      const msg = `בקשת הצטרפות של ${pf.kidName} לבית הספר ${schoolLabel} נדחתה — יש לעדכן את פרטי בית הספר בניהול המשפחה`;
      const tokens = await getTokens(pf.familyUid);
      await sendToTokens(tokens, '❌ בקשת בית הספר נדחתה', msg);
      await writeNotif(pf.familyUid, 'school_denied', msg);
    } catch(e) { console.error('denySchoolRequest family:', e); }
  }

  await db.collection('pendingSchools').doc(id).update({
    status: 'denied',
    deniedBy: adminName || 'admin',
    deniedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { ok: true };
});

exports.migrateKidCodes = functions.https.onCall(async (data, context) => {
  if (context.auth?.uid !== ADMIN_UID) {
    throw new functions.https.HttpsError('permission-denied', 'Admins only');
  }

  const JOIN_DOMAIN = 'fh.familyhub';
  function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }

  const familiesSnap = await db.collection('families').get();
  let generated = 0, skipped = 0, errors = 0;

  for (const famDoc of familiesSnap.docs) {
    const data = famDoc.data();
    const members = data.members || [];
    const kidsNeedingCode = members.filter(m => m.role === 'kid' && !m.joinCode);
    if (!kidsNeedingCode.length) { skipped++; continue; }

    const updatedMembers = [...members];
    let changed = false;

    for (let i = 0; i < updatedMembers.length; i++) {
      const m = updatedMembers[i];
      if (m.role !== 'kid' || m.joinCode) continue;
      try {
        // Generate a unique code
        let code, attempts = 0;
        do {
          code = generateCode();
          attempts++;
          const existing = await db.collection('joinCodes').doc(code).get();
          if (!existing.exists) break;
        } while (attempts < 10);

        const inviteEmail = code + '@' + JOIN_DOMAIN;
        await admin.auth().createUser({ email: inviteEmail, password: code });
        await db.collection('joinCodes').doc(code).set({ ownerUid: famDoc.id, memberName: m.name });
        updatedMembers[i] = { ...m, joinCode: code };
        generated++;
        changed = true;
      } catch(e) {
        console.error(`migrateKidCodes: ${famDoc.id} / ${m.name}:`, e);
        errors++;
      }
    }

    if (changed) {
      await db.collection('families').doc(famDoc.id).update({ members: updatedMembers });
    }
  }

  return { generated, skipped, errors };
});

exports.nudgePending = functions.https.onCall(async (data, context) => {
  if (context.auth?.uid !== ADMIN_UID) {
    throw new functions.https.HttpsError('permission-denied', 'Admins only');
  }
  const type = data.type;
  let sent = 0;

  if (type === 'committeeApplications') {
    const snap = await db.collection('committeeApplications')
      .where('status', '==', 'pending').get();
    for (const doc of snap.docs) {
      const app = doc.data();
      const targets = [];
      if (ADMIN_UID && ADMIN_UID !== app.applicantUid) targets.push(ADMIN_UID);
      const memberUids = await getClassFamilyUids(app.classId);
      memberUids.filter(uid => uid !== app.applicantUid && !targets.includes(uid))
                .forEach(uid => targets.push(uid));
      if (targets.length) {
        const tokenArrays = await Promise.all(targets.map(uid => getTokens(uid, uid === ADMIN_UID)));
        await sendToTokens(tokenArrays.flat(),
          `🔔 מועמדות ועד ממתינה להצבעה`,
          `${app.applicantName} · ${classLabel(app.classId)}`,
          { type: 'committeeApplicationNudge', appId: doc.id, classId: app.classId }
        );
        sent++;
      }
    }

  } else if (type === 'pendingEvents') {
    const snap = await db.collectionGroup('pendingEvents')
      .where('status', '==', 'pending').get();
    for (const doc of snap.docs) {
      const ev = doc.data();
      const classId = doc.ref.parent.parent.id;
      const uids = await getClassFamilyUids(classId);
      const familyDocs = await Promise.all(
        uids.map(uid => db.collection('families').doc(uid).get().catch(() => null))
      );
      const targets = familyDocs
        .filter(d => {
          if (!d?.exists) return false;
          const fd = d.data();
          return (fd.committeeClasses||[]).includes(classId) || fd.role === 'committee';
        })
        .map(d => d.id);
      if (ADMIN_UID && !targets.includes(ADMIN_UID)) targets.push(ADMIN_UID);
      if (targets.length) {
        const tokenArrays = await Promise.all(targets.map(uid => getTokens(uid, uid === ADMIN_UID)));
        await sendToTokens(tokenArrays.flat(),
          `🔔 אירוע ממתין לאישור`,
          `${ev.title} · ${classLabel(classId)}`,
          { type: 'pendingEventNudge', classId, pendingId: doc.id }
        );
        sent++;
      }
    }

  } else {
    throw new functions.https.HttpsError('invalid-argument', 'Unknown type: ' + type);
  }

  return { sent };
});

// ── Admin-guarded callable functions ──────────────────────

exports.approveEvent = functions.https.onCall(async (data, context) => {
  if (context.auth?.uid !== ADMIN_UID) {
    throw new functions.https.HttpsError('permission-denied', 'Admins only');
  }
  const { cid, pendingId } = data;
  if (!cid || !pendingId) throw new functions.https.HttpsError('invalid-argument', 'Missing cid or pendingId');

  const ref = db.collection('schoolClasses').doc(cid).collection('pendingEvents').doc(pendingId);
  const doc = await ref.get();
  if (!doc.exists) throw new functions.https.HttpsError('not-found', 'Pending event not found');

  const evData = { ...doc.data() };
  delete evData.status;
  const approver = { familyUid: ADMIN_UID };
  evData.approvedBy = approver;
  evData.approvedAt = admin.firestore.FieldValue.serverTimestamp();

  await db.collection('schoolClasses').doc(cid).collection('events').add(evData);
  await db.collection('adminLog').add({
    action: 'approved', classId: cid,
    eventTitle: evData.title || '', eventDate: evData.date || '',
    submittedBy: evData.postedBy || {},
    actionBy: approver,
    actionAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  await ref.delete();
  return { ok: true };
});

exports.rejectEvent = functions.https.onCall(async (data, context) => {
  if (context.auth?.uid !== ADMIN_UID) {
    throw new functions.https.HttpsError('permission-denied', 'Admins only');
  }
  const { cid, pendingId } = data;
  if (!cid || !pendingId) throw new functions.https.HttpsError('invalid-argument', 'Missing cid or pendingId');

  const ref = db.collection('schoolClasses').doc(cid).collection('pendingEvents').doc(pendingId);
  const doc = await ref.get();
  const evData = doc.exists ? doc.data() : {};

  await db.collection('adminLog').add({
    action: 'rejected', classId: cid,
    eventTitle: evData.title || '', eventDate: evData.date || '',
    submittedBy: evData.postedBy || {},
    actionBy: { familyUid: ADMIN_UID },
    actionAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  await ref.delete();
  return { ok: true };
});

exports.adminApproveApplication = functions.https.onCall(async (data, context) => {
  if (context.auth?.uid !== ADMIN_UID) {
    throw new functions.https.HttpsError('permission-denied', 'Admins only');
  }
  const { appId } = data;
  if (!appId) throw new functions.https.HttpsError('invalid-argument', 'Missing appId');

  await db.collection('committeeApplications').doc(appId).update({
    status: 'approved',
    decisionReason: 'admin',
    decidedBy: ADMIN_UID,
    decidedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { ok: true };
});

exports.adminDenyApplication = functions.https.onCall(async (data, context) => {
  if (context.auth?.uid !== ADMIN_UID) {
    throw new functions.https.HttpsError('permission-denied', 'Admins only');
  }
  const { appId } = data;
  if (!appId) throw new functions.https.HttpsError('invalid-argument', 'Missing appId');

  await db.collection('committeeApplications').doc(appId).update({
    status: 'denied',
    decisionReason: 'admin',
    decidedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { ok: true };
});

exports.getClassParents = functions.https.onCall(async (data, context) => {
  if (context.auth?.uid !== ADMIN_UID) {
    throw new functions.https.HttpsError('permission-denied', 'Admins only');
  }
  const { classId } = data;
  if (!classId) throw new functions.https.HttpsError('invalid-argument', 'Missing classId');

  const membersSnap = await db.collection('schoolClasses').doc(classId).collection('members').get();
  const familyUids = [...new Set(membersSnap.docs.map(d => d.data().familyUid).filter(Boolean))];

  const familyDocs = await Promise.all(
    familyUids.map(uid => db.collection('families').doc(uid).get().catch(() => null))
  );

  const result = {};
  familyDocs.forEach(d => {
    if (!d?.exists) return;
    const fd = d.data();
    const legacyComm = fd.committeeClasses || (fd.role === 'committee' ? ['*'] : []);
    result[d.id] = {
      parents: (fd.members || [])
        .filter(m => m.role !== 'kid')
        .map(m => ({
          name: m.name,
          emoji: m.emoji || '👤',
          committeeClasses: m.committeeClasses,  // undefined = no per-member data yet
        })),
      legacyComm,
    };
  });
  return result;
});

// ── Shared helpers for city/school deletion ───────────────
function normCityId(city) {
  return (city||'').trim().toLowerCase().replace(/\s+/g,'_').replace(/[^\w\u0590-\u05FF]/g,'');
}

// Delete all schoolClasses whose IDs start with `prefix~~`,
// unlink kids in affected families, remove committeeClasses entries.
// Does NOT delete families or kids.
async function deleteClassesWithPrefix(prefix) {
  const classesSnap = await db.collection('schoolClasses').get();
  const affected = classesSnap.docs.filter(d => d.id.startsWith(prefix + '~~'));
  const affectedIds = new Set(affected.map(d => d.id));
  let classesDeleted = 0, kidsUnlinked = 0;

  for (const classDoc of affected) {
    const cid = classDoc.id;

    // Delete subcollections: members, events, pendingEvents
    for (const sub of ['members', 'events', 'pendingEvents']) {
      const subSnap = await classDoc.ref.collection(sub).get();
      await Promise.all(subSnap.docs.map(d => d.ref.delete()));
    }
    await classDoc.ref.delete();
    classesDeleted++;
  }

  // Unlink kids in all families that had school in an affected class
  const familiesSnap = await db.collection('families').get();
  for (const famDoc of familiesSnap.docs) {
    const fam = famDoc.data();
    const members = fam.members || [];
    let changed = false;

    const updatedMembers = members.map(m => {
      if (m.role !== 'kid') return m;
      const cid = classIdFor(m.school);
      if (!cid || !affectedIds.has(cid)) return m;
      const u = { ...m };
      delete u.school;
      delete u.schoolPending;
      changed = true;
      kidsUnlinked++;
      return u;
    });

    // Also strip affected classIds from committeeClasses (family-level and per-member)
    const famComm = (fam.committeeClasses || []).filter(c => !affectedIds.has(c));
    const updatedMembersComm = updatedMembers.map(m => {
      if (!m.committeeClasses) return m;
      const filtered = m.committeeClasses.filter(c => !affectedIds.has(c));
      return filtered.length !== m.committeeClasses.length ? { ...m, committeeClasses: filtered } : m;
    });
    const commChanged = famComm.length !== (fam.committeeClasses||[]).length ||
      updatedMembersComm.some((m,i) => m !== updatedMembers[i]);

    if (changed || commChanged) {
      const update = { members: updatedMembersComm };
      if (commChanged) update.committeeClasses = famComm;
      await famDoc.ref.update(update).catch(e => console.error('unlinkKids:', famDoc.id, e));
    }
  }

  // Delete committeeApplications for affected classes
  for (const cid of affectedIds) {
    const appsSnap = await db.collection('committeeApplications')
      .where('classId', '==', cid).get();
    await Promise.all(appsSnap.docs.map(d => d.ref.delete()));
  }

  return { classesDeleted, kidsUnlinked };
}

exports.adminDeleteCity = functions.https.onCall(async (data, context) => {
  if (context.auth?.uid !== ADMIN_UID)
    throw new functions.https.HttpsError('permission-denied', 'Admins only');
  const { city } = data;
  if (!city?.trim()) throw new functions.https.HttpsError('invalid-argument', 'Missing city');

  const n = s => (s||'').trim().replace(/\s+/g,' ').replace(/\//g,'-').replace(/~/g,'');
  const cityNorm = n(city);

  const result = await deleteClassesWithPrefix(cityNorm);

  // Remove from school index
  await db.collection('schoolIndex').doc('cities_list')
    .update({ cities: admin.firestore.FieldValue.arrayRemove(city) }).catch(() => {});
  await db.collection('schoolIndex').doc('schools__' + normCityId(city)).delete().catch(() => {});

  // Delete grade-level and school-level event collections for this city
  const gradePrefix = cityNorm + '~~';
  const gradesSnap = await db.collection('schoolGrades').get();
  for (const doc of gradesSnap.docs.filter(d => d.id.startsWith(gradePrefix))) {
    const subSnap = await doc.ref.collection('events').get();
    await Promise.all(subSnap.docs.map(d => d.ref.delete()));
    await doc.ref.delete();
  }
  const schoolsSnap = await db.collection('schools').get();
  for (const doc of schoolsSnap.docs.filter(d => d.id.startsWith(gradePrefix))) {
    const subSnap = await doc.ref.collection('events').get();
    await Promise.all(subSnap.docs.map(d => d.ref.delete()));
    await doc.ref.delete();
  }

  console.log(`adminDeleteCity: deleted city "${city}": ${JSON.stringify(result)}`);
  return { ok: true, ...result };
});

exports.adminDeleteSchool = functions.https.onCall(async (data, context) => {
  if (context.auth?.uid !== ADMIN_UID)
    throw new functions.https.HttpsError('permission-denied', 'Admins only');
  const { city, schoolName } = data;
  if (!city?.trim() || !schoolName?.trim())
    throw new functions.https.HttpsError('invalid-argument', 'Missing city or schoolName');

  const n = s => (s||'').trim().replace(/\s+/g,' ').replace(/\//g,'-').replace(/~/g,'');
  const prefix = n(city) + '~~' + n(schoolName);

  const result = await deleteClassesWithPrefix(prefix);

  // Remove school from index
  await db.collection('schoolIndex').doc('schools__' + normCityId(city))
    .update({ schools: admin.firestore.FieldValue.arrayRemove(schoolName) }).catch(() => {});

  // Delete school-level event collection
  const schoolDocId = n(city) + '~~' + n(schoolName);
  const schoolDoc = db.collection('schools').doc(schoolDocId);
  const evSnap = await schoolDoc.collection('events').get();
  await Promise.all(evSnap.docs.map(d => d.ref.delete()));
  await schoolDoc.delete().catch(() => {});

  console.log(`adminDeleteSchool: deleted school "${schoolName}" in "${city}": ${JSON.stringify(result)}`);
  return { ok: true, ...result };
});

exports.getAdminMessages = functions.https.onCall(async (data, context) => {
  if (context.auth?.uid !== ADMIN_UID)
    throw new functions.https.HttpsError('permission-denied', 'Admins only');
  const snap = await db.collection('adminMessages')
    .orderBy('createdAt', 'desc').limit(50).get();
  return snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toMillis?.() || null,
  }));
});

exports.markAdminMessageRead = functions.https.onCall(async (data, context) => {
  if (context.auth?.uid !== ADMIN_UID)
    throw new functions.https.HttpsError('permission-denied', 'Admins only');
  const { msgId } = data;
  if (!msgId) throw new functions.https.HttpsError('invalid-argument', 'Missing msgId');
  await db.collection('adminMessages').doc(msgId).update({ read: true });
  return { ok: true };
});

exports.adminReplyToFeedback = functions.https.onCall(async (data, context) => {
  if (context.auth?.uid !== ADMIN_UID)
    throw new functions.https.HttpsError('permission-denied', 'Admins only');
  const { msgId, replyText } = data;
  if (!msgId)          throw new functions.https.HttpsError('invalid-argument', 'Missing msgId');
  if (!replyText?.trim()) throw new functions.https.HttpsError('invalid-argument', 'Missing reply text');

  const msgDoc = await db.collection('adminMessages').doc(msgId).get();
  if (!msgDoc.exists) throw new functions.https.HttpsError('not-found', 'Message not found');
  const msg = msgDoc.data();

  const recipientUid = msg.familyUid;
  if (!recipientUid) throw new functions.https.HttpsError('failed-precondition', 'No sender UID in message');

  const trimmed    = replyText.trim();
  const topicLabel = msg.topicLabel || msg.topic || 'פנייה';
  const notifText  = `💬 תגובה על "${topicLabel}": ${trimmed}`;

  await writeNotif(recipientUid, 'admin_reply', notifText, { recipientUid, msgId, replyText: trimmed, topicLabel });

  const tokens = await getTokens(recipientUid, true);
  if (tokens.length) {
    await sendToTokens(tokens, `💬 תגובה על "${topicLabel}"`, trimmed, {});
  }

  await db.collection('adminMessages').doc(msgId).update({
    replied: true,
    replyText: trimmed,
    repliedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { ok: true };
});

exports.getUserFeedbacks = functions.https.onCall(async (data, context) => {
  if (!context.auth?.uid) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  const snap = await db.collection('adminMessages')
    .where('familyUid', '==', context.auth.uid)
    .limit(20)
    .get();
  const msgs = snap.docs.map(d => {
    const m = d.data();
    return {
      id:         d.id,
      topic:      m.topic      || '',
      topicLabel: m.topicLabel || '',
      text:       m.text       || '',
      createdAt:  m.createdAt?.toMillis?.() || null,
      replied:    m.replied    || false,
      replyText:  m.replyText  || '',
      repliedAt:  m.repliedAt?.toMillis?.() || null,
    };
  }).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return { msgs };
});

exports.submitFeedback = functions.https.onCall(async (data, context) => {
  if (!context.auth?.uid) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  const { topic, topicLabel, text, senderName, familyName } = data;
  if (!text?.trim()) throw new functions.https.HttpsError('invalid-argument', 'Missing text');

  await db.collection('adminMessages').add({
    topic:      topic      || 'other',
    topicLabel: topicLabel || '',
    text:       text.trim(),
    familyUid:  context.auth.uid,
    senderName: senderName || '',
    familyName: familyName || '',
    createdAt:  admin.firestore.FieldValue.serverTimestamp(),
    read: false,
  });
  return { ok: true };
});

exports.onAdminMessageCreated = functions.firestore
  .document('adminMessages/{msgId}')
  .onCreate(async (snap, ctx) => {
    const msg = snap.data();
    console.log(`onAdminMessageCreated: from ${msg.senderName} (${msg.familyUid}), topic=${msg.topic}`);
    if (!ADMIN_UID) return;
    const topicLabel = msg.topicLabel || msg.topic || '';
    const senderLabel = [msg.senderName, msg.familyName].filter(Boolean).join(' · ');
    const notifText = `💬 פנייה חדשה: ${topicLabel}${senderLabel ? ' · ' + senderLabel : ''}`;

    // In-app notification (shows as banner + bell badge)
    await writeNotif(ADMIN_UID, 'admin_message', notifText, {
      recipientUid: ADMIN_UID,
      msgId: ctx.params.msgId,
    });

    // Push notification
    const tokens = await getTokens(ADMIN_UID, true);
    if (tokens.length) {
      await sendToTokens(tokens,
        `💬 פנייה חדשה: ${topicLabel}`,
        senderLabel || 'משתמש',
        { type: 'adminMessage', msgId: ctx.params.msgId }
      );
    }
  });

exports.adminDeleteFamily = functions.https.onCall(async (data, context) => {
  if (context.auth?.uid !== ADMIN_UID)
    throw new functions.https.HttpsError('permission-denied', 'Admins only');
  const { familyUid } = data;
  if (!familyUid) throw new functions.https.HttpsError('invalid-argument', 'Missing familyUid');
  if (familyUid === ADMIN_UID) throw new functions.https.HttpsError('invalid-argument', 'Cannot delete admin family');

  const famRef  = db.collection('families').doc(familyUid);
  const famSnap = await famRef.get();
  if (!famSnap.exists) throw new functions.https.HttpsError('not-found', 'Family not found');
  const famData = famSnap.data();
  const familyName = famData.familyName || familyUid;
  const members = famData.members || [];

  // 1. Delete subcollections (fcmTokens, notifications)
  for (const subCol of ['fcmTokens', 'notifications']) {
    const snap = await famRef.collection(subCol).get();
    await Promise.all(snap.docs.map(d => d.ref.delete()));
  }

  // 2. Remove kid class memberships using direct paths (avoids collectionGroup index)
  const kids = members.filter(m => m.role === 'kid' && m.school?.city && m.school?.grade);
  await Promise.all(kids.map(async kid => {
    const classId = classIdFor(kid.school);
    if (!classId) return;
    const memberDocId = classMemberDocId(familyUid, kid.name);
    await db.collection('schoolClasses').doc(classId)
      .collection('members').doc(memberDocId).delete().catch(() => {});
  }));

  // 3. Delete presence docs (keyed as familyUid_memberName)
  await Promise.all(members.map(m =>
    db.collection('presence').doc(familyUid + '_' + m.name).delete().catch(() => {})
  ));

  // 4. Delete family invite joinCode
  if (famData.familyCode) {
    await db.collection('joinCodes').doc(famData.familyCode).delete().catch(() => {});
  }

  // 5. Delete kid joinCodes + their Auth accounts
  const kidCodes = members.filter(m => m.role === 'kid' && m.joinCode).map(m => m.joinCode);
  await Promise.all(kidCodes.map(async code => {
    await db.collection('joinCodes').doc(code).delete().catch(() => {});
    try {
      const kidUser = await admin.auth().getUserByEmail(code + '@fh.familyhub').catch(() => null);
      if (kidUser) await admin.auth().deleteUser(kidUser.uid);
    } catch(e) { console.warn('deleteKidAuth:', code, e.message); }
  }));

  // 6. Delete family Firestore doc
  await famRef.delete();

  // 7. Delete family owner Auth account
  await admin.auth().deleteUser(familyUid).catch(e =>
    console.warn('deleteOwnerAuth:', familyUid, e.message)
  );

  console.log(`adminDeleteFamily: deleted ${familyUid} (${familyName})`);
  return { ok: true, familyName };
});

exports.adminResetFamily = functions.https.onCall(async (data, context) => {
  if (context.auth?.uid !== ADMIN_UID)
    throw new functions.https.HttpsError('permission-denied', 'Admins only');
  const { familyUid } = data;
  if (!familyUid) throw new functions.https.HttpsError('invalid-argument', 'Missing familyUid');

  const famDoc = await db.collection('families').doc(familyUid).get();
  if (!famDoc.exists) throw new functions.https.HttpsError('not-found', 'Family not found');
  const familyName = famDoc.data().familyName || familyUid;

  await db.collection('families').doc(familyUid).update({
    chores: [], grocery: [], homework: [], events: [], stars: {},
    groceryPool: [], shoppingList: [], inCart: [], shoppingHistory: [],
  });
  return { ok: true, familyName };
});

exports.getFamilyDetails = functions.https.onCall(async (data, context) => {
  if (context.auth?.uid !== ADMIN_UID) {
    throw new functions.https.HttpsError('permission-denied', 'Admins only');
  }
  const { familyUid } = data;
  if (!familyUid) throw new functions.https.HttpsError('invalid-argument', 'Missing familyUid');

  const famDoc = await db.collection('families').doc(familyUid).get();
  if (!famDoc.exists) throw new functions.https.HttpsError('not-found', 'Family not found');

  const fd = famDoc.data();
  const legacyComm = fd.committeeClasses || (fd.role === 'committee' ? ['*'] : []);

  const members = (fd.members || []).map(m => {
    const base = { name: m.name, emoji: m.emoji || '👤', role: m.role || 'parent' };
    if (m.role === 'kid') {
      base.school = m.school || null;  // { city, name, grade, classNum }
      base.schoolPending = m.schoolPending || null;
    } else {
      // For parents, include per-member committeeClasses (with legacy fallback)
      const perMember = m.committeeClasses;
      base.committeeClasses = perMember !== undefined ? perMember : legacyComm;
    }
    return base;
  });

  return { familyName: fd.familyName || '', members };
});

// ═══════════════════════════════════════════════════════════════════════════════
// WEBTOP INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════

const fetch = require('node-fetch');
const WEBTOP_API = 'https://webtopserver.smartschool.co.il/server/api/PupilCard/GetPupilLessonsAndHomework';

// ─── webtopLink — validate a FamilyHub family UID and return its name ─────────
exports.webtopLink = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') { res.set('Access-Control-Allow-Headers', 'Content-Type'); return res.status(204).send(''); }
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { familyId } = req.body || {};
  if (!familyId || typeof familyId !== 'string') return res.status(400).json({ error: 'missing familyId' });

  try {
    const doc = await db.collection('families').doc(familyId).get();
    if (!doc.exists) return res.status(404).json({ error: 'family not found' });
    const familyName = doc.data()?.familyName || '';
    return res.json({ ok: true, familyName });
  } catch (err) {
    console.error('webtopLink error', err);
    return res.status(500).json({ error: 'server error' });
  }
});

// ─── webtopSetup — store token + params, immediately fetch homework ───────────
exports.webtopSetup = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') { res.set('Access-Control-Allow-Headers', 'Content-Type'); return res.status(204).send(''); }
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { webtopSession, syncParams, familyId } = req.body || {};
  const token = webtopSession?.token;
  const fullCookie = webtopSession?.fullCookie || null;
  if (!token || !syncParams || !familyId) {
    return res.status(400).json({ error: 'missing fields' });
  }

  // Verify the family exists
  const familyDoc = await db.collection('families').doc(familyId).get();
  if (!familyDoc.exists) return res.status(404).json({ error: 'family not found' });

  try {
    const classCode = String(syncParams.classCode || syncParams.studentID || '');
    const safeKey = classCode.replace(/[^a-zA-Z0-9_-]/g, '_');
    const existingStudents = familyDoc.data()?.webtopStudents || {};
    const isFirstSync = !existingStudents[safeKey]?.initialSyncDone;

    // First sync: pull 4 weeks back (~1 month). Delta syncs: current week only.
    const weekOffsets = isFirstSync ? [0, -1, -2, -3] : [0];
    let newHomework = [];
    try {
      for (const offset of weekOffsets) {
        const hw = await _fetchWebtopHomework(token, syncParams, fullCookie, offset);
        newHomework = newHomework.concat(hw);
      }
    } catch (fetchErr) {
      console.error('webtopSetup _fetchWebtopHomework failed:', fetchErr.message);
      return res.status(500).json({ error: fetchErr.message });
    }
    console.log(`webtopSetup: ${isFirstSync ? 'initial' : 'delta'} sync, ${newHomework.length} items fetched`);

    // Merge: deduplicate by classCode|date|subject — preserves history, updates edits
    const existing = familyDoc.data()?.webtopHomework || [];
    const hwKey = h => `${h.classCode}|${h.date}|${h.subject}`;
    const mergedMap = new Map(existing.map(h => [hwKey(h), h]));
    for (const h of newHomework) mergedMap.set(hwKey(h), h);
    const merged = [...mergedMap.values()];

    const updatePayload = {
      webtopHomework: merged,
      webtopUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      webtopSyncError: admin.firestore.FieldValue.delete(),
      webtopSyncErrorAt: admin.firestore.FieldValue.delete(),
      [`webtopStudents.${safeKey}`]: {
        token,
        fullCookie: fullCookie || null,
        syncParams,
        classCode,
        studentName: syncParams.studentName || '',
        initialSyncDone: true,
      },
    };
    // Delete stale entries with same studentID but different key
    for (const [key, entry] of Object.entries(existingStudents)) {
      if (key !== safeKey && entry.syncParams?.studentID === syncParams.studentID) {
        updatePayload[`webtopStudents.${key}`] = admin.firestore.FieldValue.delete();
      }
    }
    await db.collection('families').doc(familyId).update(updatePayload);

    return res.json({ ok: true, homeworkCount: newHomework.length, total: merged.length, isFirstSync });
  } catch (err) {
    console.error('webtopSetup error', err);
    return res.status(500).json({ error: 'server error' });
  }
});

// ─── webtopSync — runs hourly, respects per-family webtopSyncIntervalHours ────
exports.webtopSync = functions.pubsub.schedule('every 30 minutes').onRun(async () => {
  const snapshot = await db.collection('families')
    .where('webtopStudents', '!=', null)
    .get();
  const now = Date.now();
  let synced = 0;
  const promises = snapshot.docs.map(async doc => {
    const { webtopStudents, webtopUpdatedAt, webtopSyncIntervalHours } = doc.data();
    if (!webtopStudents || typeof webtopStudents !== 'object') return;
    const entries = Object.entries(webtopStudents);
    if (!entries.length) return;
    // Check if enough time has passed since last sync
    const intervalMs = (webtopSyncIntervalHours || 1) * 3600 * 1000;
    const lastSync = webtopUpdatedAt?.toMillis?.() || 0;
    if (now - lastSync < intervalMs) return;
    try {
      const existingHomework = doc.data().webtopHomework || [];
      const hwKey = h => `${h.classCode}|${h.date}|${h.subject}`;
      const mergedMap = new Map(existingHomework.map(h => [hwKey(h), h]));

      for (const [safeKey, { token, syncParams, fullCookie, initialSyncDone }] of entries) {
        if (!token || !syncParams) continue;
        const weekOffsets = initialSyncDone ? [0] : [0, -1, -2, -3];
        for (const offset of weekOffsets) {
          const hw = await _fetchWebtopHomework(token, syncParams, fullCookie || null, offset);
          for (const h of hw) mergedMap.set(hwKey(h), h);
        }
        if (!initialSyncDone) {
          await doc.ref.update({ [`webtopStudents.${safeKey}.initialSyncDone`]: true });
        }
      }
      await doc.ref.update({
        webtopHomework: [...mergedMap.values()],
        webtopUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        webtopSyncError: admin.firestore.FieldValue.delete(),
        webtopSyncErrorAt: admin.firestore.FieldValue.delete(),
      });
      synced++;
    } catch (err) {
      console.error(`webtopSync failed for family ${doc.id}`, err);
      const isExpired = err.message === 'session_expired';
      doc.ref.update({
        webtopSyncError: isExpired ? 'session_expired' : 'sync_failed',
        webtopSyncErrorAt: admin.firestore.FieldValue.serverTimestamp(),
      }).catch(() => {});
    }
  });
  await Promise.all(promises);
  console.log(`webtopSync: synced ${synced}/${snapshot.docs.length} families`);
  return null;
});

// ─── Helper: fetch and flatten homework from Webtop API ──────────────────────
async function _fetchWebtopHomework(token, syncParams, fullCookie, weekOffset = 0) {
  let cookieStr;
  if (fullCookie) {
    // Use exact Cookie header captured from the browser — most reliable
    cookieStr = fullCookie;
    console.log('Using fullCookie, keys:', fullCookie.split(';').map(p=>p.trim().split('=')[0]).join(', '));
  } else {
    let decodedToken;
    try { decodedToken = decodeURIComponent(token); } catch { decodedToken = token; }
    cookieStr = `webToken=${decodedToken}`;
    console.log('Using single webToken (no fullCookie)');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  let res;
  try {
    res = await fetch(WEBTOP_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieStr,
        'Origin': 'https://webtop.smartschool.co.il',
        'Referer': 'https://webtop.smartschool.co.il/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      body: JSON.stringify({ ...syncParams, weekIndex: weekOffset }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    if (res.status === 403 || res.status === 401) {
      throw new Error(`session_expired`);
    }
    const errBody = await res.text().catch(() => '');
    throw new Error(`Webtop API ${res.status}: ${errBody.slice(0, 200)}`);
  }
  const json = await res.json();

  // Flatten: collect all non-null homeWork strings across days and hours
  const homework = [];
  const dayData = json?.data;
  if (!dayData) return homework;

  for (const day of Object.values(dayData)) {
    const hours = day?.hoursData;
    if (!hours) continue;
    for (const hour of Object.values(hours)) {
      const schedules = hour?.scheduale;
      if (!Array.isArray(schedules)) continue;
      for (const s of schedules) {
        if (s?.homeWork) {
          homework.push({
            subject: s.subject_name || '',
            text: s.homeWork,
            context: s.descClass || '',
            date: (day.date || '').slice(0, 10),
            classCode: String(syncParams.classCode || syncParams.studentID || ''),
          });
        }
      }
    }
  }
  return homework;
}
