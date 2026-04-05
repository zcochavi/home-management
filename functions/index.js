const functions = require('firebase-functions');
const admin     = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

// ── Helpers ───────────────────────────────────────────────

async function getTokens(familyUid) {
  const snap = await db.collection('families').doc(familyUid)
    .collection('fcmTokens').get();
  const tokens = snap.docs.map(d => d.data().token).filter(Boolean);
  console.log(`getTokens(${familyUid}): found ${tokens.length} token(s)`);
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
    // Committee members + admin, never the poster themselves
    const targetUids = familyDocs
      .filter(d => d?.exists && d.data().role === 'committee' && d.id !== posterUid)
      .map(d => d.id);
    if (ADMIN_UID && !targetUids.includes(ADMIN_UID) && ADMIN_UID !== posterUid)
      targetUids.push(ADMIN_UID);
    console.log(`onPendingEventCreated: notifying ${targetUids.length} committee/admin user(s)`);
    if (!targetUids.length) return;

    const tokenArrays = await Promise.all(targetUids.map(getTokens));
    const poster = ev.postedBy?.familyName || '';
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
    const poster = ev.postedBy?.familyName || '';
    const body   = poster ? `${poster} · ${classLabel(cid)}` : classLabel(cid);
    await notifyFamilies(uids, ev.postedBy?.familyUid, ev.title, body,
      { type: 'classEvent', classId: cid, eventId: ctx.params.eventId });

    // If this event went through the approval flow, notify the original poster
    if (ev.approvedBy && ev.postedBy?.familyUid) {
      const cfg = await getNotificationConfig();
      if (cfg.pendingEvents.notifyOnDecision) {
        const approverName = ev.approvedBy.familyName || '';
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
    const poster = ev.postedBy?.familyName || '';
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
    const poster = ev.postedBy?.familyName || '';
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
    const tokenArrays = await Promise.all(targets.map(getTokens));
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
      // Grant committee role (unconditional)
      await db.collection('families').doc(applicantUid)
        .update({ role: 'committee' }).catch(e => console.error('grant role:', e));

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
    const requester = req.requestedBy?.familyName || '';
    console.log(`onPendingSchoolCreated: ${label} by ${requester}`);

    const targets = ADMIN_UID ? [ADMIN_UID] : [];
    if (!targets.length) return;

    const tokenArrays = await Promise.all(targets.map(getTokens));
    await sendToTokens(tokenArrays.flat(),
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
          const tokenArrays = await Promise.all(targets.map(getTokens));
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
          .filter(d => d?.exists && d.data().role === 'committee')
          .map(d => d.id);
        if (ADMIN_UID && !targets.includes(ADMIN_UID)) targets.push(ADMIN_UID);
        if (targets.length) {
          const tokenArrays = await Promise.all(targets.map(getTokens));
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
        const tokenArrays = await Promise.all(targets.map(getTokens));
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
        .filter(d => d?.exists && d.data().role === 'committee')
        .map(d => d.id);
      if (ADMIN_UID && !targets.includes(ADMIN_UID)) targets.push(ADMIN_UID);
      if (targets.length) {
        const tokenArrays = await Promise.all(targets.map(getTokens));
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
