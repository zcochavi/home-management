const functions = require('firebase-functions');
const admin     = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
const notify = require('./notify-helpers');

// ── Helpers ───────────────────────────────────────────────

async function getTokens(familyUid, ownerOnly = false, memberName = null) {
  const col = db.collection('families').doc(familyUid).collection('fcmTokens');
  let query = col;
  if (ownerOnly) query = query.where('isOwner', '==', true);
  if (memberName) query = query.where('memberName', '==', memberName);
  const snap = await query.get();
  const tokens = snap.docs.map(d => d.data().token).filter(Boolean);
  console.log(`getTokens(${familyUid}, ownerOnly=${ownerOnly}, memberName=${memberName}): found ${tokens.length} token(s)`);
  return tokens;
}

async function getTokenDocs(familyUid) {
  const snap = await db.collection('families').doc(familyUid).collection('fcmTokens').get();
  return snap.docs.map(d => ({ token: d.data().token, memberName: d.data().memberName || '' }));
}

async function removeStaleToken(token) {
  const snaps = await db.collectionGroup('fcmTokens')
    .where('token', '==', token).get();
  await Promise.all(snaps.docs.map(d => d.ref.delete()));
}

// One push message, as every FamilyHub notification is sent (web push + Android app).
function buildPushMessage(token, title, body, strData = {}) {
  return {
    token,
    notification: { title, body },
    data: strData,
    webpush: {
      // Shown by Firebase in the browser (the service worker doesn't show a second copy);
      // `tag` makes a newer notification about the same thing replace the older one
      notification: { title, body, requireInteraction: false, ...(strData.tag ? { tag: strData.tag } : {}) },
      fcmOptions: { link: 'https://zcochavi.github.io/home-management/' },
    },
    // Android app: its notification channel, icon and accent color; `tag` makes a
    // newer notification about the same thing replace the older one, as on the web.
    android: {
      priority: 'high',
      notification: {
        channelId: 'familyhub',
        icon: 'ic_stat_familyhub',
        color: '#6C80E8',
        ...(strData.tag ? { tag: strData.tag } : {}),
      },
    },
  };
}

async function sendToTokens(tokens, title, body, data = {}) {
  if (!tokens.length) { console.log('sendToTokens: no tokens, skipping'); return; }
  console.log(`sendToTokens: sending "${title}" to ${tokens.length} token(s)`);
  const strData = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, String(v)])
  );
  const results = await Promise.allSettled(
    tokens.map(token => admin.messaging().send(buildPushMessage(token, title, body, strData)))
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

// Guest edits on a shared list link that allows them (add / rename / delete an item).
// The guest queues a request under publicShares/{token}/edits; this applies it to the owner's
// list and pushes the result to every link of that list. See share-edit-helpers.js.
const shareEdits = require('./share-edit-helpers');
exports.onShareEdit = functions.firestore
  .document('publicShares/{token}/edits/{editId}')
  .onCreate(async (snap, ctx) => {
    const token = ctx.params.token;
    try {
      const edit = shareEdits.cleanEdit(snap.data());
      if (!edit) return;
      const shareSnap = await db.collection('publicShares').doc(token).get();
      const share = shareSnap.exists ? shareSnap.data() : null;
      if (!share || share.allowEdits !== true || !['self', 'edit', 'claim'].includes(share.mode)) return;
      if (!share.familyUid || !share.listId) return;
      const listRef = db.collection('families').doc(share.familyUid).collection('lists').doc(share.listId);
      const list = await db.runTransaction(async tx => {
        const ls = await tx.get(listRef);
        if (!ls.exists) return null;
        const data = ls.data();
        // Only a link the list still lists may change it (a revoked link's doc is deleted anyway)
        if (!(data.publicShares || []).some(s => s.token === token && s.allowEdits === true)) return null;
        const items = shareEdits.applyEdit(data.items || [], edit, Date.now());
        if (!items) return null;
        tx.update(listRef, { items, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        return { ...data, items };
      });
      if (!list) return;
      await Promise.all((list.publicShares || []).map(s => {
        const ref = db.collection('publicShares').doc(s.token);
        return db.runTransaction(async tx => {
          const ss = await tx.get(ref);
          if (!ss.exists) return;
          const d = ss.data();
          tx.update(ref, {
            items: shareEdits.shareItemsFor(list.items, d.mode, d.items || []),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }).catch(e => console.warn(`onShareEdit: push to share ${s.token} failed:`, e.message));
      }));
    } catch (e) {
      console.error(`onShareEdit (${token}):`, e);
    } finally {
      await snap.ref.delete().catch(() => {});
    }
  });

// "Disconnect devices" for one family member (Settings → family members, by a parent).
// Every account signed in as that member loses access at once: its uidToFamily mapping is
// deleted (the rules need it for every family read) and its refresh tokens are revoked;
// accounts made for a join code are deleted. All of the member's codes are revoked too —
// otherwise a device that joined with a code would just re-map on its next start — and a
// new code is issued so the parent can let the person back in. Notification tokens
// registered for that member are removed.
const memberDevices = require('./member-devices-helpers');
exports.disconnectMemberDevices = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (!uid) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  const memberName = typeof data?.memberName === 'string' ? data.memberName : '';
  if (!memberName) throw new functions.https.HttpsError('invalid-argument', 'memberName required');

  // Caller's family and member
  let familyUid = null, callerMap = null;
  if ((await db.collection('families').doc(uid).get()).exists) familyUid = uid;
  else {
    callerMap = (await db.collection('uidToFamily').doc(uid).get()).data() || null;
    familyUid = callerMap?.familyUid || null;
  }
  if (!familyUid) throw new functions.https.HttpsError('permission-denied', 'Not a member of a family');
  const famRef = db.collection('families').doc(familyUid);
  const members = (await famRef.get()).data()?.members || [];
  const target = members.find(m => m.name === memberName);
  if (!target) throw new functions.https.HttpsError('not-found', 'No such member');
  if (uid !== familyUid) {
    const callerUser = await admin.auth().getUser(uid).catch(() => null);
    const callerName = memberDevices.memberOfAccount({ mapData: callerMap, authUser: callerUser });
    const callerMember = members.find(m => m.name === callerName);
    if (!callerMember || callerMember.role !== 'parent') throw new functions.https.HttpsError('permission-denied', 'Parents only');
    if (callerName === memberName) throw new functions.https.HttpsError('failed-precondition', "Can't disconnect yourself");
  }

  // 1. Accounts signed in as the member
  let disconnected = 0;
  const maps = await db.collection('uidToFamily').where('familyUid', '==', familyUid).get();
  for (const d of maps.docs) {
    if (d.id === uid || d.id === familyUid) continue;
    const authUser = await admin.auth().getUser(d.id).catch(() => null);
    let codeDoc = null;
    const code = memberDevices.codeOfInviteEmail(authUser?.email);
    if (code && !d.data().memberName) codeDoc = (await db.collection('joinCodes').doc(code).get()).data() || null;
    if (memberDevices.memberOfAccount({ mapData: d.data(), authUser, codeDoc }) !== memberName) continue;
    await d.ref.delete();
    if (authUser) {
      if (memberDevices.isInviteEmail(authUser.email)) await admin.auth().deleteUser(d.id).catch(() => {});
      else await admin.auth().revokeRefreshTokens(d.id).catch(() => {});
    }
    disconnected++;
  }

  // 2. Revoke all of the member's codes (current one + any older ones still on record)
  const codes = new Set([target.joinCode].filter(Boolean));
  (await db.collection('joinCodes').where('ownerUid', '==', familyUid).where('memberName', '==', memberName).get())
    .docs.forEach(d => codes.add(d.id));
  for (const code of codes) {
    await db.collection('joinCodes').doc(code).delete().catch(() => {});
    const inv = await admin.auth().getUserByEmail((code + memberDevices.INVITE_DOMAIN).toLowerCase()).catch(() => null);
    if (inv) {
      await db.collection('uidToFamily').doc(inv.uid).delete().catch(() => {});
      await admin.auth().deleteUser(inv.uid).catch(() => {});
    }
  }

  // 3. A new code, set up the way createMemberCode in app.js does it
  let newCode = null;
  for (let i = 0; i < 8 && !newCode; i++) {
    const c = memberDevices.newJoinCode();
    if ((await db.collection('joinCodes').doc(c).get()).exists) continue;
    try {
      await admin.auth().createUser({ email: (c + memberDevices.INVITE_DOMAIN).toLowerCase(), password: c, displayName: familyUid + '|' + memberName });
      newCode = c;
    } catch (e) { if (e?.code !== 'auth/email-already-exists') throw e; }
  }
  if (!newCode) throw new functions.https.HttpsError('internal', 'Could not create a new code');
  await db.collection('joinCodes').doc(newCode).set({ ownerUid: familyUid, memberName });
  await db.runTransaction(async tx => {
    const snap = await tx.get(famRef);
    const list = (snap.data()?.members || []).map(m => (m.name === memberName ? { ...m, joinCode: newCode } : m));
    tx.update(famRef, { members: list });
  });

  // 4. Stop notifications to the member's devices (never the owner account's own device)
  const toks = await famRef.collection('fcmTokens').where('memberName', '==', memberName).get();
  await Promise.all(toks.docs.filter(t => t.data().isOwner !== true).map(t => t.ref.delete().catch(() => {})));

  console.log(`disconnectMemberDevices: family=${familyUid} member=${memberName} accounts=${disconnected} codes=${codes.size}`);
  return { disconnected, code: newCode };
});

// Class-wide synced homework: when a family's Webtop / Mashov homework (or its kids' class
// mapping) changes, copy new or changed items to each kid's class so the whole class sees
// one parent's import. Items are keyed by content (same id from any family), so several
// families syncing the same class don't duplicate them. See shared-homework-helpers.js.
const sharedHw = require('./shared-homework-helpers');
exports.onFamilySyncedHomework = functions.firestore
  .document('families/{familyUid}')
  .onWrite(async (change, ctx) => {
    if (!change.after.exists) return;
    const before = change.before.exists ? change.before.data() : {};
    const after = change.after.data();
    // A sync ran (Webtop / Mashov): stamp the family's connected classes, new homework or not.
    // Every parent in a class sees when it was last synced — whoever notices it stopped can
    // reconnect (the homework tab's banner), so a class doesn't depend on one family.
    const ms = t => (t && typeof t.toMillis === 'function') ? t.toMillis() : 0;
    const synced = ms(after.webtopUpdatedAt) > ms(before.webtopUpdatedAt) || ms(after.mashovUpdatedAt) > ms(before.mashovUpdatedAt);
    if (synced) {
      await Promise.all([...sharedHw.connectedClasses(after, classIdFor)].map(cid => db.collection('schoolClasses').doc(cid)
        .set({ lastSyncAt: admin.firestore.FieldValue.serverTimestamp(), lastSyncBy: ctx.params.familyUid }, { merge: true })
        .catch(e => console.warn(`onFamilySyncedHomework: stamp ${cid} failed:`, e.message))));
    }
    // Most family writes (chores, lists, ...) don't touch synced homework or the kids' mapping
    const sig = d => JSON.stringify([d.sharedHwVersion || 0, d.webtopHomework || [], d.mashovHomework || [],
      !!d.webtopLinkedAt, Object.keys(d.webtopStudents || {}).sort(), Object.keys(d.mashovStudents || {}).sort(),
      (d.members || []).map(m => [m.name, m.role, m.webtopClassCode || '', m.mashovChildId || '', m.school || null])]);
    if (sig(before) === sig(after)) return;
    // sharedHwVersion bumped (the app does it once per family): share everything, so homework
    // synced before class sharing existed reaches the class too
    const full = (before.sharedHwVersion || 0) !== (after.sharedHwVersion || 0);
    // Mark classes this family newly connected (the app stops showing them the connect wizard)
    const wasConnected = full ? new Set() : sharedHw.connectedClasses(before, classIdFor);
    const newlyConnected = [...sharedHw.connectedClasses(after, classIdFor)].filter(c => !wasConnected.has(c));
    await Promise.all(newlyConnected.map(cid => db.collection('schoolClasses').doc(cid)
      .set({ syncConnectedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true })
      .catch(e => console.warn(`onFamilySyncedHomework: mark ${cid} connected failed:`, e.message))));
    const items = full ? Object.values(sharedHw.sharedItems(after, classIdFor)) : sharedHw.changedItems(before, after, classIdFor);
    if (!items.length) return;
    for (let i = 0; i < items.length; i += 400) {
      const batch = db.batch();
      items.slice(i, i + 400).forEach(({ cid, id, data }) => {
        batch.set(db.collection('schoolClasses').doc(cid).collection('syncedHomework').doc(id), {
          ...data,
          importedBy: ctx.params.familyUid,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      });
      await batch.commit();
    }
    console.log(`onFamilySyncedHomework: family=${ctx.params.familyUid} shared ${items.length} item(s)`);
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

// Grants committee status for `classId` on the specific member named `memberName`
// (mirroring the client's setCommitteeRole), falling back to a family-level-only
// grant when the applicant's member name isn't known (e.g. older applications).
async function grantCommitteeClass(familyUid, memberName, classId) {
  const famRef = db.collection('families').doc(familyUid);
  const famDoc = await famRef.get();
  if (!famDoc.exists) return;
  const fd = famDoc.data();
  const members = fd.members || [];
  const updatedMembers = memberName
    ? members.map(m => {
        if (m.name !== memberName || m.role !== 'parent') return m;
        const current = m.committeeClasses ?? (fd.role === 'committee' ? ['*'] : (fd.committeeClasses || []));
        return { ...m, committeeClasses: [...new Set([...current, classId])] };
      })
    : members;
  const familyCommitteeClasses = [...new Set([
    ...(fd.committeeClasses || []), classId,
    ...updatedMembers.flatMap(m => m.committeeClasses || []),
  ])];
  await famRef.update({ members: updatedMembers, committeeClasses: familyCommitteeClasses });
}

// Admin: make a parent of another family committee for one of their kids' classes, or remove
// them (the family details panel). Done here because a family's doc is writable only by that
// family. Mirrors setCommitteeRole in app.js: per-member committeeClasses, plus the family-level
// union the other functions read.
exports.adminSetCommittee = functions.https.onCall(async (data, context) => {
  if (context.auth?.uid !== ADMIN_UID)
    throw new functions.https.HttpsError('permission-denied', 'Admins only');
  const familyUid = String(data?.familyUid || ''), memberName = String(data?.memberName || ''), cid = String(data?.cid || '');
  const grant = !!data?.grant;
  if (!familyUid || !memberName || !cid) throw new functions.https.HttpsError('invalid-argument', 'Missing fields');
  const famRef = db.collection('families').doc(familyUid);
  const fd = (await famRef.get()).data();
  if (!fd) throw new functions.https.HttpsError('not-found', 'No such family');
  let found = false;
  const members = (fd.members || []).map(m => {
    if (m.name !== memberName || m.role === 'kid') return m;
    found = true;
    const current = m.committeeClasses ?? (fd.role === 'committee' ? ['*'] : (fd.committeeClasses || []));
    const next = grant ? [...new Set([...current, cid])] : current.filter(c => c !== cid);
    return { ...m, committeeClasses: next };
  });
  if (!found) throw new functions.https.HttpsError('not-found', 'No such parent in the family');
  const committeeClasses = [...new Set(members.flatMap(m => m.committeeClasses || []))];
  await famRef.update({ members, committeeClasses });
  return { ok: true, committeeClasses: members.find(m => m.name === memberName)?.committeeClasses || [] };
});

exports.onApplicationUpdated = functions.firestore
  .document('committeeApplications/{appId}')
  .onUpdate(async (change, ctx) => {
    const before = change.before.data();
    const after  = change.after.data();
    if (before.status === after.status) return; // no status change
    const applicantUid = after.applicantUid;
    const memberName = after.applicantMemberName || null;
    const cfg = await getNotificationConfig();

    const logEntry = (action) => db.collection('adminLog').add({
      type: 'application', action, decisionReason: after.decisionReason || '',
      classId: after.classId || '', applicantName: after.applicantName || '',
      actionBy: after.decisionReason === 'admin' ? { familyUid: ADMIN_UID } : null,
      actionAt: admin.firestore.FieldValue.serverTimestamp(),
    }).catch(e => console.error('adminLog write (' + action + '):', e));

    if (after.status === 'approved') {
      // Grant committee role for the specific class, to the specific applicant
      await grantCommitteeClass(applicantUid, memberName, after.classId)
        .catch(e => console.error('grant committeeClasses:', e));
      await logEntry('approved');

      // Notify applicant only — scoped to their own device(s) when known
      if (cfg.committeeApplications.notifyOnDecision) {
        const reason = after.decisionReason === 'admin'
          ? 'אושרת על ידי מנהל המערכת'
          : 'אושרת על ידי הצבעת 15 הורים';
        const tokens = await getTokens(applicantUid, false, memberName);
        await sendToTokens(tokens,
          '🎉 המועמדות שלך לוועד ההורים אושרה!',
          reason,
          { type: 'applicationApproved', classId: after.classId }
        );
      }
    } else if (after.status === 'denied') {
      await logEntry('denied');

      // Notify applicant only — scoped to their own device(s) when known
      if (cfg.committeeApplications.notifyOnDecision) {
        const reason = after.decisionReason === 'expired'
          ? 'לא הגעת לרוב הנדרש של 15 תמיכות תוך 5 ימים'
          : after.decisionReason === 'admin'
            ? 'נדחתה על ידי מנהל המערכת'
            : 'נדחתה';
        const tokens = await getTokens(applicantUid, false, memberName);
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

// "Send me a test notification" (Settings in the Android app). Sends one real push,
// built exactly like real notifications, to the calling device only — and only if
// that device's token is registered under a family the caller belongs to. Waits a
// few seconds first so the user can leave the app and see a system notification.
// Returns the outcome instead of throwing, so the app can show what happened.
exports.sendTestNotification = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (!uid) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  const { familyUid, token } = data || {};
  if (!familyUid || !token || typeof token !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Missing fields');
  }
  if (uid !== familyUid) {
    const map = await db.collection('uidToFamily').doc(uid).get();
    if (map.data()?.familyUid !== familyUid) throw new functions.https.HttpsError('permission-denied', 'Not a member of this family');
  }
  const tokenDoc = await db.collection('families').doc(familyUid).collection('fcmTokens').doc(token.slice(0, 20)).get();
  if (!tokenDoc.exists || tokenDoc.data()?.token !== token) return { ok: false, reason: 'not_registered' };

  const delaySec = Math.min(Math.max(Number(data.delaySec) || 0, 0), 10);
  if (delaySec) await new Promise(r => setTimeout(r, delaySec * 1000));
  try {
    const messageId = await admin.messaging().send(buildPushMessage(token,
      'בדיקת התראות ✓', 'אם את/ה רואה את זה — התראות FamilyHub עובדות במכשיר הזה.', { type: 'test', tag: 'fh-test' }));
    return { ok: true, messageId };
  } catch (err) {
    const code = err?.errorInfo?.code || err?.code || 'unknown';
    console.error('sendTestNotification failed', code, err?.message);
    if (String(code).includes('registration-token-not-registered') || String(code).includes('invalid-registration-token')) {
      removeStaleToken(token);
    }
    return { ok: false, reason: 'send_failed', code: String(code), message: String(err?.message || '').slice(0, 200) };
  }
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

  // Every read runs in parallel and fetches only the fields used here. (It used to read the
  // whole families collection — homework, shopping history, photos — plus every session and
  // admin-log entry ever, one after another, which made the dashboard slow and slower over time.)
  const sixMonthsAgo = Date.now() - 180*24*3600*1000;
  const lbConfigP = db.collection('appConfig').doc('leaderboard').get().catch(() => null);
  const lbDaysP = lbConfigP.then(snap => (snap?.exists && snap.data().days) || 30);
  // Sessions of the leaderboard period only — chained to the config read, so it runs alongside the rest
  const sessionsP = lbDaysP.then(days => db.collection('sessions')
    .where('startTime', '>=', admin.firestore.Timestamp.fromMillis(Date.now() - days * 24 * 3600 * 1000))
    .select('durationMs', 'familyUid', 'memberName', 'familyName', 'startTime').get())
    .catch(e => { console.error('[getAnalytics] sessions error:', e); return null; });
  const [familiesSnap, classesSnap, logSnap, recentSnap, appsSnap, schoolsSnap, lbDays] = await Promise.all([
    db.collection('families').select('members').get(),
    db.collection('schoolClasses').select('schoolName', 'city', 'grade', 'classNum').get(),
    db.collection('adminLog').select('action', 'actionAt', 'classId').get(),
    db.collection('adminLog').orderBy('actionAt', 'desc').limit(10).get(),
    db.collection('committeeApplications').select('status').get(),
    db.collection('pendingSchools').select('status').get(),
    lbDaysP,
  ]);
  const leaderboardDays = lbDays;
  let topSchool = null, topCity = null, topUser = null;

  // Families & members
  const families = familiesSnap.docs.map(d => ({ _id: d.id, ...d.data() }));
  const familyCount = families.length;
  const parentCount = families.reduce((n,f) => n + (f.members||[]).filter(m=>m.role==='parent').length, 0);
  const kidCount    = families.reduce((n,f) => n + (f.members||[]).filter(m=>m.role==='kid').length, 0);

  // Active classes
  const classCount  = classesSnap.size;
  const classNames  = {};
  classesSnap.docs.forEach(d => {
    const c = d.data();
    classNames[d.id] = (c.schoolName || c.city || '') + ' · כיתה ' + (c.grade||'') + (c.classNum ? "'" + c.classNum : '');
  });

  // Admin log — events approved/rejected
  const logEntries = logSnap.docs.map(d => d.data());
  const approvedCount  = logEntries.filter(e=>e.action==='approved').length;
  const rejectedCount  = logEntries.filter(e=>e.action==='rejected').length;

  // Events by month (last 6 months)
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
  const recentLog = recentSnap.docs.map(d => d.data()).map(e => ({
    action:     e.action,
    eventTitle: e.eventTitle || '',
    className:  classNames[e.classId] || e.classId || '',
    actionAt:   e.actionAt?.toMillis?.() || null,
  }));

  // Committee applications
  const apps = appsSnap.docs.map(d=>d.data());
  const appsPending  = apps.filter(a=>a.status==='pending').length;
  const appsApproved = apps.filter(a=>a.status==='approved').length;
  const appsDenied   = apps.filter(a=>a.status==='denied').length;

  // Pending schools
  const schools = schoolsSnap.docs.map(d=>d.data());
  const schoolsPending  = schools.filter(s=>s.status==='pending').length;
  const schoolsApproved = schools.filter(s=>s.status==='approved').length;
  const schoolsDenied   = schools.filter(s=>s.status==='denied').length;

  // Leaderboard
  try {
    // Top city & school — from family members (kids)
    const schoolCount = {}, cityCount = {};
    families.forEach(fam => {
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

    // Top user by session duration in the period
    const sessionsSnap = await sessionsP;
    const userDuration = {};
    (sessionsSnap?.docs || []).forEach(d => {
      const s = d.data();
      if (!s.durationMs) return;
      if (s.familyUid === ADMIN_UID) return; // exclude admin
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

  await finishSchoolApproval(id, req, { approvedBy: adminName || 'admin' });
  return { ok: true };
});

// Approves a pending city / school request: registers each waiting family's kid in the class,
// clears their pending flag, notifies them and marks the request approved.
async function finishSchoolApproval(id, req, extra) {
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
    ...extra,
    approvedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

// ── Official school list (Ministry of Education) ──
const schoolDir = require('./school-directory');
const schoolsDocId = city => 'schools__' + schoolDir.cityKey(city);

// The official list: downloaded from data.gov.il and kept at schoolIndex/official_list (as one
// JSON string), so code lookups use the latest copy; the copy bundled in the code is the fallback.
let _officialCache = null; // {schools, at}
async function officialSchools() {
  if (_officialCache && Date.now() - _officialCache.at < 3600e3) return _officialCache.schools;
  let schools = null;
  try {
    const json = (await db.collection('schoolIndex').doc('official_list').get()).data()?.json;
    if (json) schools = JSON.parse(json);
  } catch (e) { console.warn('officialSchools:', e.message); }
  schools ||= schoolDir.bundled();
  _officialCache = { schools, at: Date.now() };
  return schools;
}

// Admin decisions about official names, kept at schoolIndex/overrides so a refresh doesn't undo
// them: schools["<cityKey>|<nameKey>"] = the name to use instead ("" = deleted, don't add);
// cities["<nameKey of city>"] = "" for a deleted city.
async function schoolOverrides() {
  const d = (await db.collection('schoolIndex').doc('overrides').get()).data() || {};
  return { schools: d.schools || {}, cities: d.cities || {} };
}
const overrideKey = (city, name) => schoolDir.cityKey(city) + '|' + schoolDir.nameKey(name);
async function setSchoolOverride(kind, key, value) {
  const ref = db.collection('schoolIndex').doc('overrides');
  await db.runTransaction(async tx => {
    const d = (await tx.get(ref)).data() || {};
    tx.set(ref, { ...d, [kind]: { ...(d[kind] || {}), [key]: value } });
  });
}
// An official school after admin decisions: {city, name} with the name to use, or null if deleted
function applyOverride(ov, city, name) {
  if (ov.cities[schoolDir.nameKey(city)] === '') return null;
  const o = ov.schools[overrideKey(city, name)];
  if (o === '') return null;
  return { city, name: o || name };
}

// Downloads a fresh list (falling back to the saved / bundled one), then adds every school and
// city to the city / school pickers (schoolIndex) and merges second spellings of the same name
// (ע״ש / ע"ש) in every city's list, including names typed by families. Of two spellings the one
// already there stays, since kids' class ids are built from it. Nothing is removed: a school that
// closed stays, so no family's class disappears. Safe to run again.
async function refreshSchoolIndex(by) {
  const idx = db.collection('schoolIndex');
  let list, source = 'live', fetchError = null;
  try {
    list = await schoolDir.download();
    await idx.doc('official_list').set({
      json: JSON.stringify(list), count: Object.keys(list).length, by,
      source: 'data.gov.il resource ' + schoolDir.SOURCE_RESOURCE,
      downloadedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    _officialCache = { schools: list, at: Date.now() };
  } catch (e) {
    fetchError = String(e.message || e);
    console.warn('refreshSchoolIndex: download failed, using the saved list:', fetchError);
    _officialCache = null;
    list = await officialSchools();
    source = 'saved';
  }

  // Admin decisions first: merged-away names map to the kept one, deleted ones are left out
  const ov = await schoolOverrides();
  const effective = {};
  for (const [semel, [name, city]] of Object.entries(list)) {
    const e = applyOverride(ov, city, name);
    if (e) effective[semel] = [e.name, e.city];
  }
  const { cities, schools } = schoolDir.indexEntries(effective);
  const docs = {};
  (await idx.get()).docs.forEach(d => { docs[d.id] = d.data(); });
  const cityBefore = docs.cities_list?.cities || [];
  const cityList = schoolDir.mergeNames(cityBefore, cities);
  const writes = [[idx.doc('cities_list'), { cities: cityList }]];
  // An official city spelled differently in the list goes under that spelling's key
  const official = {};
  for (const { city, names } of Object.values(schools)) {
    const id = schoolsDocId(schoolDir.findName(cityList, city) || city);
    official[id] = (official[id] || []).concat(names);
  }
  const ids = new Set([...Object.keys(official), ...Object.keys(docs).filter(id => id.startsWith('schools__'))]);
  let total = 0, added = 0, merged = 0;
  for (const id of ids) {
    const before = docs[id]?.schools || [];
    const uniq = schoolDir.mergeNames(before);
    const list2 = schoolDir.mergeNames(before, official[id] || []);
    total += list2.length; added += list2.length - uniq.length; merged += before.length - uniq.length;
    if (list2.length !== before.length || list2.some((x, i) => x !== before[i])) writes.push([idx.doc(id), { schools: list2 }]);
  }
  for (let i = 0; i < writes.length; i += 400) {
    const batch = db.batch();
    writes.slice(i, i + 400).forEach(([ref, val]) => batch.set(ref, val, { merge: true }));
    await batch.commit();
  }
  const result = {
    source, fetchError, official: Object.keys(list).length,
    cities: cityList.length, citiesAdded: cityList.length - schoolDir.mergeNames(cityBefore).length,
    schools: total, added, merged,
  };
  await idx.doc('official').set({ ...result, by, loadedAt: admin.firestore.FieldValue.serverTimestamp() });
  return result;
}

// Admin button: download and merge now
exports.seedSchoolIndex = functions.runWith({ timeoutSeconds: 300, memory: '512MB' }).https.onCall(async (data, context) => {
  if (context.auth?.uid !== ADMIN_UID)
    throw new functions.https.HttpsError('permission-denied', 'Admins only');
  return { ok: true, ...(await refreshSchoolIndex('admin')) };
});

// The same, by itself: the 1st of every month, 04:17 Israel time. Also retires any general
// family codes made since (by older Android app versions) — see retireGeneralFamilyCodes.
exports.refreshSchoolIndexMonthly = functions.runWith({ timeoutSeconds: 300, memory: '512MB' })
  .pubsub.schedule('17 4 1 * *').timeZone('Asia/Jerusalem').onRun(async () => {
    try {
      console.log('refreshSchoolIndexMonthly:', JSON.stringify(await refreshSchoolIndex('monthly')));
    } catch (e) { console.error('refreshSchoolIndexMonthly schools:', e); }
    try {
      console.log('refreshSchoolIndexMonthly family codes:', JSON.stringify(await retireGeneralFamilyCodes(false)));
    } catch (e) { console.error('refreshSchoolIndexMonthly family codes:', e); }
    return null;
  });

// A school code (סמל מוסד) from a parent's Webtop / Mashov sync → the school's official name
// and city. Being official, the school and city go straight into the pickers with no approval,
// and requests waiting for exactly that school are approved. With dropPendingId, this family's
// kid leaves an older hand-typed request (the parent took the synced school instead).
exports.resolveSchoolCode = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (!uid) throw new functions.https.HttpsError('unauthenticated', 'Login required');
  const off = schoolDir.lookup(data?.semel, await officialSchools());
  const eff = off && applyOverride(await schoolOverrides(), off.city, off.name);
  if (!eff) return { found: false };
  const s = { ...off, ...eff };

  // Use the spelling already in the pickers when there is one (e.g. ע״ש for the official ע"ש):
  // families' class ids are built from it, so a synced kid joins the same class.
  const idx = db.collection('schoolIndex');
  const cityList = (await idx.doc('cities_list').get()).data()?.cities || [];
  const city = schoolDir.findName(cityList, s.city) || s.city;
  const schoolList = (await idx.doc(schoolsDocId(city)).get()).data()?.schools || [];
  const name = schoolDir.findName(schoolList, s.name) || s.name;
  if (city === s.city && !cityList.includes(city)) await idx.doc('cities_list').set({ cities: admin.firestore.FieldValue.arrayUnion(city) }, { merge: true });
  if (!schoolList.includes(name)) await idx.doc(schoolsDocId(city)).set({ schools: admin.firestore.FieldValue.arrayUnion(name) }, { merge: true });

  const waiting = (await db.collection('pendingSchools').where('status', '==', 'pending').get()).docs
    .filter(d => schoolDir.nameKey(d.data().city) === schoolDir.nameKey(city) && schoolDir.nameKey(d.data().schoolName) === schoolDir.nameKey(name));
  for (const doc of waiting) {
    try {
      await doc.ref.update({ cityStatus: 'approved', schoolStatus: 'approved' });
      await finishSchoolApproval(doc.id, doc.data(), { approvedBy: 'auto (Ministry code ' + s.semel + ')' });
    } catch (e) { console.error('resolveSchoolCode approve:', e); }
  }

  const dropId = typeof data?.dropPendingId === 'string' ? data.dropPendingId : '';
  if (dropId) {
    let familyUid = null;
    if ((await db.collection('families').doc(uid).get()).exists) familyUid = uid;
    else familyUid = (await db.collection('uidToFamily').doc(uid).get()).data()?.familyUid || null;
    const ref = db.collection('pendingSchools').doc(dropId);
    const req = familyUid ? (await ref.get()).data() : null;
    if (req && req.status === 'pending') {
      const kid = String(data?.kidName || '');
      const rest = (req.pendingFamilies || []).filter(pf => !(pf.familyUid === familyUid && pf.kidName === kid));
      if (rest.length !== (req.pendingFamilies || []).length) {
        await ref.update(rest.length ? { pendingFamilies: rest } : { pendingFamilies: rest, status: 'superseded' });
      }
    }
  }
  return { found: true, semel: s.semel, name, city };
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

  // Remove from school index, and remember the deletion (see adminDeleteSchool)
  await db.collection('schoolIndex').doc('cities_list')
    .update({ cities: admin.firestore.FieldValue.arrayRemove(city) }).catch(() => {});
  await db.collection('schoolIndex').doc('schools__' + normCityId(city)).delete().catch(() => {});
  await setSchoolOverride('cities', schoolDir.nameKey(city), '');

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

  // Remove school from index (any spelling of the name), and remember the deletion so the
  // monthly refresh of the official list doesn't add it back
  const idxRef = db.collection('schoolIndex').doc('schools__' + normCityId(city));
  const listNow = (await idxRef.get()).data()?.schools || [];
  const kept = listNow.filter(x => schoolDir.nameKey(x) !== schoolDir.nameKey(schoolName));
  if (kept.length !== listNow.length) await idxRef.set({ schools: kept }, { merge: true });
  await setSchoolOverride('schools', overrideKey(city, schoolName), '');

  // Delete school-level event collection
  const schoolDocId = n(city) + '~~' + n(schoolName);
  const schoolDoc = db.collection('schools').doc(schoolDocId);
  const evSnap = await schoolDoc.collection('events').get();
  await Promise.all(evSnap.docs.map(d => d.ref.delete()));
  await schoolDoc.delete().catch(() => {});

  console.log(`adminDeleteSchool: deleted school "${schoolName}" in "${city}": ${JSON.stringify(result)}`);
  return { ok: true, ...result };
});

// Admin: two names for one school (e.g. אריק אינשטיין / אריק איינשטיין) → keep one. The other
// leaves the picker, is remembered (the official list and synced school codes then use the kept
// name), and kids registered under it move to the kept name's classes.
exports.adminMergeSchools = functions.runWith({ timeoutSeconds: 300 }).https.onCall(async (data, context) => {
  if (context.auth?.uid !== ADMIN_UID)
    throw new functions.https.HttpsError('permission-denied', 'Admins only');
  const city = String(data?.city || '').trim(), keep = String(data?.keep || '').trim(), merge = String(data?.merge || '').trim();
  if (!city || !keep || !merge) throw new functions.https.HttpsError('invalid-argument', 'Missing city or names');
  if (schoolDir.nameKey(keep) === schoolDir.nameKey(merge)) throw new functions.https.HttpsError('invalid-argument', 'Same school');

  const idxRef = db.collection('schoolIndex').doc('schools__' + normCityId(city));
  const list = (await idxRef.get()).data()?.schools || [];
  const keepName = schoolDir.findName(list, keep) || keep;
  const next = schoolDir.mergeNames(list.filter(x => schoolDir.nameKey(x) !== schoolDir.nameKey(merge)), [keepName]);
  await idxRef.set({ schools: next }, { merge: true });
  await setSchoolOverride('schools', overrideKey(city, merge), keepName);

  // Kids registered under the merged name: same grade / class under the kept name
  const sameCity = c => schoolDir.nameKey(c) === schoolDir.nameKey(city);
  const isMerged = sc => sc && sameCity(sc.city) && schoolDir.nameKey(sc.name) === schoolDir.nameKey(merge);
  let kidsMoved = 0;
  const fams = await db.collection('families').get();
  for (const fam of fams.docs) {
    const members = fam.data().members || [];
    if (!members.some(m => m.role === 'kid' && isMerged(m.school))) continue;
    const moved = [];
    const updated = members.map(m => {
      if (m.role !== 'kid' || !isMerged(m.school)) return m;
      moved.push(m);
      return { ...m, school: { ...m.school, name: keepName } };
    });
    await fam.ref.update({ members: updated });
    for (const m of moved) {
      try {
        await registerKidInClass({ familyUid: fam.id, kidName: m.name }, { ...m.school, name: keepName }, fam.data().familyName, m.gender, m.dob);
        kidsMoved++;
      } catch (e) { console.error('adminMergeSchools register:', e); }
    }
  }
  // The merged name's classes lose their member list (the kids were just registered under the
  // kept name); anything else in them (events, schedule) is left in place, not deleted.
  const n = x => (x||'').trim().replace(/\s+/g,' ').replace(/\//g,'-').replace(/~/g,'');
  const classes = await db.collection('schoolClasses').get();
  let classesEmptied = 0;
  for (const c of classes.docs.filter(d => d.id.startsWith(n(city) + '~~' + n(merge) + '~~'))) {
    const ss = await c.ref.collection('members').get();
    await Promise.all(ss.docs.map(d => d.ref.delete()));
    classesEmptied++;
  }
  console.log(`adminMergeSchools: "${merge}" → "${keepName}" in "${city}": ${kidsMoved} kids moved, ${classesEmptied} classes emptied`);
  return { ok: true, keep: keepName, kidsMoved, classesEmptied };
});

// Admin: retire the general family code (one code per family, not tied to a member). Its join
// code and hidden login account are deleted, and devices / accounts that joined with it lose
// their link to the family — they join again with a member's personal code. The family owner and
// everyone tied to a member are untouched. dryRun: only count.
// Runs every month with the school list refresh (refreshSchoolIndexMonthly): older Android app
// versions still create / join with general family codes until they update.
exports.retireFamilyCodes = functions.runWith({ timeoutSeconds: 300 }).https.onCall(async (data, context) => {
  if (context.auth?.uid !== ADMIN_UID)
    throw new functions.https.HttpsError('permission-denied', 'Admins only');
  return retireGeneralFamilyCodes(!!data?.dryRun);
});
async function retireGeneralFamilyCodes(dryRun) {
  const codes = (await db.collection('joinCodes').get()).docs.filter(d => !d.data().memberName);
  const maps = (await db.collection('uidToFamily').get()).docs
    .filter(d => !d.data().memberName && d.data().familyUid && d.data().familyUid !== d.id);
  const families = new Set([...codes.map(d => d.data().ownerUid), ...maps.map(d => d.data().familyUid)].filter(Boolean));
  const summary = { codes: codes.length, devices: maps.length, families: families.size };
  if (dryRun) return { ok: true, dryRun: true, ...summary };

  for (const d of codes) {
    const email = (d.id + memberDevices.INVITE_DOMAIN).toLowerCase();
    const u = await admin.auth().getUserByEmail(email).catch(() => null);
    if (u) await admin.auth().deleteUser(u.uid).catch(e => console.warn('retireFamilyCodes user:', e.message));
    await d.ref.delete();
    const owner = d.data().ownerUid;
    if (owner) await db.collection('families').doc(owner)
      .update({ familyCode: admin.firestore.FieldValue.delete() }).catch(() => {});
  }
  for (const d of maps) {
    await d.ref.delete();
    // A hidden code account (CODE@fh.familyhub) with no member goes too; personal accounts stay
    const u = await admin.auth().getUser(d.id).catch(() => null);
    if (u && memberDevices.isInviteEmail(u.email) && !memberDevices.memberOfAccount({ authUser: u })) {
      await admin.auth().deleteUser(u.uid).catch(() => {});
    }
  }
  console.log('retireFamilyCodes:', JSON.stringify(summary));
  return { ok: true, ...summary };
}

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

// Deletes a family and everything that hangs off it. Shared by adminDeleteFamily and
// deleteOwnFamily. Returns the family name, or null when the family doesn't exist.
async function deleteFamilyData(familyUid, { deleteOwnerAuth }) {
  const famRef  = db.collection('families').doc(familyUid);
  const famSnap = await famRef.get();
  if (!famSnap.exists) return null;
  const famData = famSnap.data();
  const familyName = famData.familyName || familyUid;
  const members = famData.members || [];

  // 1. Remove kid class memberships using direct paths (avoids collectionGroup index)
  const kids = members.filter(m => m.role === 'kid' && m.school?.city && m.school?.grade);
  await Promise.all(kids.map(async kid => {
    const classId = classIdFor(kid.school);
    if (!classId) return;
    const memberDocId = classMemberDocId(familyUid, kid.name);
    await db.collection('schoolClasses').doc(classId)
      .collection('members').doc(memberDocId).delete().catch(() => {});
  }));

  // 2. Delete presence docs (keyed as familyUid_memberName)
  await Promise.all(members.map(m =>
    db.collection('presence').doc(familyUid + '_' + m.name).delete().catch(() => {})
  ));

  // 3. Delete join codes (family code + members' personal codes) and their invite Auth accounts
  const codes = [famData.familyCode, ...members.map(m => m.joinCode)].filter(Boolean);
  await Promise.all(codes.map(async code => {
    await db.collection('joinCodes').doc(code).delete().catch(() => {});
    try {
      const inviteUser = await admin.auth().getUserByEmail((code + '@fh.familyhub').toLowerCase()).catch(() => null);
      if (inviteUser) {
        await db.collection('uidToFamily').doc(inviteUser.uid).delete().catch(() => {});
        await admin.auth().deleteUser(inviteUser.uid);
      }
    } catch(e) { console.warn('deleteInviteAuth:', code, e.message); }
  }));

  // 4. Unmap every account that joined this family, and drop its public list shares
  for (const col of ['uidToFamily', 'publicShares']) {
    const snap = await db.collection(col).where('familyUid', '==', familyUid).get();
    await Promise.all(snap.docs.map(d => d.ref.delete().catch(() => {})));
  }

  // 5. Delete the family doc and all its subcollections (lists, fcmTokens, notifications, ...)
  await db.recursiveDelete(famRef);

  // 6. Delete family owner Auth account
  if (deleteOwnerAuth) {
    await admin.auth().deleteUser(familyUid).catch(e =>
      console.warn('deleteOwnerAuth:', familyUid, e.message)
    );
  }
  return familyName;
}

exports.adminDeleteFamily = functions.https.onCall(async (data, context) => {
  if (context.auth?.uid !== ADMIN_UID)
    throw new functions.https.HttpsError('permission-denied', 'Admins only');
  const { familyUid } = data;
  if (!familyUid) throw new functions.https.HttpsError('invalid-argument', 'Missing familyUid');
  if (familyUid === ADMIN_UID) throw new functions.https.HttpsError('invalid-argument', 'Cannot delete admin family');

  const familyName = await deleteFamilyData(familyUid, { deleteOwnerAuth: true });
  if (familyName === null) throw new functions.https.HttpsError('not-found', 'Family not found');

  console.log(`adminDeleteFamily: deleted ${familyUid} (${familyName})`);
  return { ok: true, familyName };
});

// A family owner deletes their own family so their account can join another family instead
// (an account either owns a family or is a member of one, never both). The owner's Auth
// account is kept — they go on signing in with it as a member of the family they join.
exports.deleteOwnFamily = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (!uid) throw new functions.https.HttpsError('unauthenticated', 'Sign in first');
  if (uid === ADMIN_UID) throw new functions.https.HttpsError('invalid-argument', 'Cannot delete admin family');

  const familyName = await deleteFamilyData(uid, { deleteOwnerAuth: false });
  if (familyName !== null) console.log(`deleteOwnFamily: deleted ${uid} (${familyName})`);
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
    // No saved role: shown with the parents but flagged (roleUnset), so the admin can tell
    // real parents from members whose role is missing
    const base = { name: m.name, emoji: m.emoji || '👤', role: m.role || 'parent', ...(m.role ? {} : { roleUnset: true }) };
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
const crypto = require('crypto');
const WEBTOP_API = 'https://webtopserver.smartschool.co.il/server/api/PupilCard/GetPupilLessonsAndHomework';
const WEBTOP_SEND_OTP  = 'https://webtopserver.smartschool.co.il/server/api/user/SendOneTimePassword';
const WEBTOP_LOGIN_OTP = 'https://webtopserver.smartschool.co.il/server/api/user/LoginByOneTimePassword';
const WEBTOP_HDRS = {
  'Content-Type': 'application/json',
  'Origin': 'https://webtop.smartschool.co.il',
  'Referer': 'https://webtop.smartschool.co.il/',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
};

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
    // Record that a link step actually happened for this family, so webtopSetup below can
    // require it — without this, a bare webtopSetup call with a leaked/guessed family UID
    // (no link step at all) would be accepted.
    await db.collection('families').doc(familyId).update({
      webtopLinkedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
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

  // Verify the family exists and was actually linked first (webtopLink), or has already
  // synced before this check existed (grandfathered — avoids breaking existing connections).
  const familyDoc = await db.collection('families').doc(familyId).get();
  if (!familyDoc.exists) return res.status(404).json({ error: 'family not found' });
  const famDataForAuth = familyDoc.data() || {};
  if (!famDataForAuth.webtopLinkedAt && !famDataForAuth.webtopHomework && !famDataForAuth.webtopStudents) {
    return res.status(403).json({ error: 'not linked — call webtopLink first' });
  }

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

// ─── Helper: POST JSON to Webtop with a timeout; parse body defensively ──────
async function _webtopPost(url, cookie, bodyObj) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { ...WEBTOP_HDRS, Cookie: cookie },
      body: JSON.stringify(bodyObj),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch (_) {}
  return { status: res.status, ok: res.ok, json, text };
}

// Retry transient network failures (connection reset/timeout) a couple of times.
async function _webtopPostRetry(url, cookie, bodyObj, tries = 3) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      return await _webtopPost(url, cookie, bodyObj);
    } catch (err) {
      lastErr = err;
      if (i < tries - 1) await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw lastErr;
}

// ─── webtopIngest — store homework the browser extension fetched itself ───────
// Webtop's CDN now blocks cloud-server IPs (any region), so the server can no
// longer call Webtop. The extension fetches homework from the parent's own
// browser and posts the already-flattened items here; this endpoint only
// validates, merges and stores them — it never contacts Webtop.
exports.webtopIngest = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') { res.set('Access-Control-Allow-Headers', 'Content-Type'); return res.status(204).send(''); }
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { familyId, syncParams, homework } = req.body || {};
  if (!familyId || typeof familyId !== 'string' || !syncParams || typeof syncParams !== 'object' || !Array.isArray(homework)) {
    return res.status(400).json({ error: 'missing fields' });
  }
  if (homework.length > 2000) return res.status(400).json({ error: 'too many items' });

  // Same gate as webtopSetup: the family must exist and have gone through webtopLink
  // (or already have Webtop data from before that check existed).
  const famRef = db.collection('families').doc(familyId);
  const familyDoc = await famRef.get();
  if (!familyDoc.exists) return res.status(404).json({ error: 'family not found' });
  const fam = familyDoc.data() || {};
  if (!fam.webtopLinkedAt && !fam.webtopHomework && !fam.webtopStudents) {
    return res.status(403).json({ error: 'not linked — call webtopLink first' });
  }

  try {
    const classCode = String(syncParams.classCode || syncParams.studentID || '');
    if (!classCode) return res.status(400).json({ error: 'missing classCode' });
    const safeKey = classCode.replace(/[^a-zA-Z0-9_-]/g, '_');
    const existingStudents = fam.webtopStudents || {};
    const isFirstSync = !existingStudents[safeKey]?.initialSyncDone;

    // Items come from a client, so keep only the expected fields, bounded.
    const clean = homework
      .map(h => ({
        subject: String(h?.subject || '').slice(0, 200),
        text: String(h?.text || '').slice(0, 5000),
        context: String(h?.context || '').slice(0, 500),
        date: String(h?.date || '').slice(0, 10),
        classCode,
      }))
      .filter(h => h.text && /^\d{4}-\d{2}-\d{2}$/.test(h.date));

    const hwKey = h => `${h.classCode}|${h.date}|${h.subject}`;
    const mergedMap = new Map((fam.webtopHomework || []).map(h => [hwKey(h), h]));
    for (const h of clean) mergedMap.set(hwKey(h), h);
    const merged = [...mergedMap.values()];

    const updatePayload = {
      webtopHomework: merged,
      webtopUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      webtopSyncError: admin.firestore.FieldValue.delete(),
      webtopSyncErrorAt: admin.firestore.FieldValue.delete(),
      // No token stored: the server can't use it anymore, and webtopSync skips
      // token-less entries so it stops flagging "session expired".
      [`webtopStudents.${safeKey}`]: {
        syncParams,
        classCode,
        studentName: String(syncParams.studentName || ''),
        initialSyncDone: true,
        source: 'extension',
      },
    };
    // Drop this kid's older entries. Match by name as well as studentID: Webtop's
    // studentID is encrypted per login session, so after a re-login it no longer
    // matches and the old entry (often still holding a dead server token, which
    // made webtopSync raise false "session expired" warnings) would linger.
    const name = String(syncParams.studentName || '');
    for (const [key, entry] of Object.entries(existingStudents)) {
      if (key === safeKey) continue;
      const sameKid = entry?.syncParams?.studentID === syncParams.studentID
        || (name && (entry?.studentName === name || entry?.syncParams?.studentName === name));
      if (sameKid) updatePayload[`webtopStudents.${key}`] = admin.firestore.FieldValue.delete();
    }
    await famRef.update(updatePayload);

    return res.json({ ok: true, homeworkCount: clean.length, total: merged.length, isFirstSync });
  } catch (err) {
    console.error('webtopIngest error', err);
    return res.status(500).json({ error: 'server error' });
  }
});

// ─── webtopRequestOtp — email-OTP login, step 1: ask Webtop to email a code ──
// The parent supplies their Webtop identity (ID number + email). We call Webtop's
// SendOneTimePassword, which emails them a 6-digit code, and stash the login nonce
// (guid + uniqueId) server-side keyed by a short-lived pendingId returned to the app.
// No password is involved or stored on this path.
const _handleWebtopRequestOtp = async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') { res.set('Access-Control-Allow-Headers', 'Content-Type'); return res.status(204).send(''); }
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { familyId, memberId, email } = req.body || {};
  if (!familyId || !memberId || !email) return res.status(400).json({ error: 'missing fields' });

  // Family must exist — familyId is the (Firebase-generated, hard-to-guess) family doc id.
  const famRef = db.collection('families').doc(familyId);
  const famDoc = await famRef.get();
  if (!famDoc.exists) return res.status(404).json({ error: 'family not found' });

  // Light abuse guard: at most one OTP email per family per 30s (this call sends mail).
  const lastSent = famDoc.data()?.webtopOtpLastSentAt?.toMillis?.() || 0;
  const sinceLast = Date.now() - lastSent;
  if (sinceLast < 30 * 1000) return res.status(429).json({ error: 'too_soon', retryAfterMs: 30 * 1000 - sinceLast });

  // uniqueId is a client-chosen device nonce that Webtop echoes between the two
  // calls (sent as a cookie here, and again in the login body). We generate one
  // and reuse it for this login pair. (setInput {id:0} just sets input=0, which
  // we send directly in the cookie, so no separate setInput round-trip is needed.)
  const uniqueId = crypto.randomBytes(20).toString('hex');
  const cookie = `uniqueId=${uniqueId}; rememberMeMoe=; input=0`;

  let result;
  try {
    result = await _webtopPostRetry(WEBTOP_SEND_OTP, cookie, {
      Input: String(email),
      MemberId: String(memberId),
      UserName: '',
      RecoveryType: 1, // 1 = email channel
      PasswordType: 1, // 1 = one-time code
      LoginCounter: 0,
    });
  } catch (err) {
    console.error('webtopRequestOtp fetch failed', err);
    return res.status(502).json({ error: 'webtop_unreachable', detail: `${err?.name}: ${err?.message}`.slice(0, 200) });
  }

  const json = result.json;
  if (!json || json.status !== true) {
    return res.status(400).json({
      error: 'otp_request_failed',
      httpStatus: result.status,
      detail: json?.errorDescription || (json ? null : result.text?.slice(0, 300)) || null,
    });
  }

  // The Guid is the data[] entry whose id isn't the "MessageSend" marker.
  const guid = (Array.isArray(json.data) ? json.data : [])
    .map(d => d && d.id).find(id => id && id !== 'MessageSend');
  if (!guid) return res.status(502).json({ error: 'no_guid' });

  const pendingId = crypto.randomBytes(16).toString('hex');
  await db.collection('webtopPendingLogins').doc(pendingId).set({
    familyId,
    email: String(email),
    memberId: String(memberId),
    guid,
    uniqueId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  });
  await famRef.update({ webtopOtpLastSentAt: admin.firestore.FieldValue.serverTimestamp() });

  return res.json({ ok: true, pendingId });
};
// Catch anything a handler throws and answer with the real reason, instead of a
// bare "Internal Server Error" that hides it.
const _safeWebtop = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (err) {
    console.error('webtop handler crashed', err);
    if (!res.headersSent) {
      res.set('Access-Control-Allow-Origin', '*');
      res.status(500).json({ error: 'internal', detail: `${err?.code || err?.name || 'Error'}: ${err?.message || err}`.slice(0, 300) });
    }
  }
};
exports.webtopRequestOtp = functions.https.onRequest(_safeWebtop(_handleWebtopRequestOtp));

// ─── webtopVerifyOtp — email-OTP login, step 2: submit the code, get a token ──
// The app sends back the code the parent received by email. We complete Webtop's
// LoginByOneTimePassword and store the returned session token at family level.
// Stage 2 (student enumeration) will use this token to populate webtopStudents so
// the existing webtopSync can fetch each child's homework.
const _handleWebtopVerifyOtp = async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') { res.set('Access-Control-Allow-Headers', 'Content-Type'); return res.status(204).send(''); }
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { familyId, pendingId, code } = req.body || {};
  if (!familyId || !pendingId || !code) return res.status(400).json({ error: 'missing fields' });

  const pendRef = db.collection('webtopPendingLogins').doc(pendingId);
  const pend = await pendRef.get();
  if (!pend.exists) return res.status(404).json({ error: 'no_pending_login' });
  const p = pend.data();
  if (p.familyId !== familyId) return res.status(403).json({ error: 'family_mismatch' });
  if (Date.now() > (p.expiresAt || 0)) { await pendRef.delete().catch(() => {}); return res.status(410).json({ error: 'code_expired' }); }

  const cookie = `uniqueId=${p.uniqueId}; rememberMeMoe=; input=0`;
  const deviceDataJson = JSON.stringify({
    isMobile: false, isTablet: false, isDesktop: true,
    getDeviceType: 'Desktop', os: 'Windows', osVersion: '10',
  });

  let result;
  try {
    result = await _webtopPostRetry(WEBTOP_LOGIN_OTP, cookie, {
      Code: Number(code),
      Guid: p.guid,
      UniqueId: p.uniqueId,
      deviceDataJson,
      rememberMe: true,
    });
  } catch (err) {
    console.error('webtopVerifyOtp fetch failed', err);
    return res.status(502).json({ error: 'webtop_unreachable', detail: `${err?.name}: ${err?.message}`.slice(0, 200) });
  }

  const user = result.json && result.json.data && result.json.data.data;
  const token = user && user.token;
  if (result.json?.status !== true || !token) {
    return res.status(400).json({
      error: 'login_failed',
      httpStatus: result.status,
      detail: result.json?.errorDescription || (result.json ? null : result.text?.slice(0, 300)) || null,
    });
  }

  await pendRef.delete().catch(() => {});

  await db.collection('families').doc(familyId).update({
    webtopAuth: {
      token,
      fullCookie: `webToken=${token}`,
      userId: user.userId || null,
      institutionCode: user.institutionCode || null,
      schoolId: user.schoolId || null,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    webtopSyncError: admin.firestore.FieldValue.delete(),
    webtopSyncErrorAt: admin.firestore.FieldValue.delete(),
  });

  return res.json({
    ok: true,
    user: {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      schoolName: user.schoolName || '',
      mustChangePassword: !!user.mustChangePassword,
    },
  });
};
exports.webtopVerifyOtp = functions.https.onRequest(_safeWebtop(_handleWebtopVerifyOtp));

// Tel Aviv (me-west1) twins — 2nd gen, since me-west1 doesn't run 1st-gen functions.
// Webtop's CloudFront blocks our us-central1 egress IP; these test whether an
// Israeli-region IP gets through. Same handlers as the us-central1 versions.
// Run as the App Engine default service account — the identity the 1st-gen
// functions use, which has Firestore access. 2nd gen otherwise defaults to the
// Compute default account, which may not.
const { onRequest: onRequestV2 } = require('firebase-functions/v2/https');
const TLV_OPTS = { region: 'me-west1', serviceAccount: 'familyhub-7fdd5@appspot.gserviceaccount.com' };
exports.webtopRequestOtpTlv = onRequestV2(TLV_OPTS, _safeWebtop(_handleWebtopRequestOtp));
exports.webtopVerifyOtpTlv  = onRequestV2(TLV_OPTS, _safeWebtop(_handleWebtopVerifyOtp));

// ─── chainPricesTlv — supermarket prices trial (Hatzi Hinam), from Tel Aviv ────────────────────
// Israel's price-transparency law makes chains publish every branch's prices; Hatzi Hinam's portal
// answers Israeli addresses only, so this runs in me-west1. Public data only (no family data):
//   GET ?store=<words of the branch>  → the branch, when its prices were fetched, how many products
//       &q=<words>                    → products whose name contains them (up to 30)
//       &all=1                        → every product
//       &refresh=1                    → fetch again now (at most every 30 minutes)
// Prices are kept in Firestore (chainPrices/…) and fetched again after 6 hours. Nothing in the app
// uses this yet.
const chainPrices = require('./chain-prices-helpers');
const CP_FRESH_MS = 6 * 3600e3, CP_MIN_REFRESH_MS = 30 * 60e3, CP_CHUNK = 2500;
const cpGet = async (url, binary) => {
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (FamilyHub price trial)', 'Accept-Language': 'he-IL,he;q=0.9' } });
  if (!r.ok) throw Object.assign(new Error(`GET ${url.split('?')[0]} → HTTP ${r.status}`), { status: r.status });
  return binary ? Buffer.from(await r.arrayBuffer()) : r.text();
};
// Files of one type (t: 1 prices, 2 promos, 3 stores), newest first, up to `pages` listing pages
async function cpListFiles(t, wanted, pages = 40) {
  const H = chainPrices.HATZI_HINAM, found = [], seen = new Set();
  for (let p = 1; p <= pages; p++) {
    const links = chainPrices.listingLinks(await cpGet(`${H.base}/Prices?t=${t}&p=${p}`));
    const fresh = links.filter(l => !seen.has(l.name));
    if (!fresh.length) break;
    fresh.forEach(l => { seen.add(l.name); const f = { ...l, ...chainPrices.parseFilename(l.name) }; if (wanted(f)) found.push(f); });
    if (found.length && t === 3) break;
  }
  return found.sort((a, b) => (b.ts || 0) - (a.ts || 0));
}
async function cpStores() {
  const ref = db.collection('chainPrices').doc('hatzi-hinam__stores');
  const d = (await ref.get()).data();
  const readable = (d?.stores || []).some(st => /[\u0590-\u05FF]/.test([st.name, st.city, st.address].join('')));
  if (d?.stores && readable && Date.now() - d.fetchedAt < 24 * 3600e3) return d.stores;
  const [file] = await cpListFiles(3, f => f.type === 'Stores', 5);
  if (!file) throw new Error('no Stores file on the portal');
  const stores = chainPrices.parseStores(chainPrices.toText(await cpGet(file.url, true)));
  await ref.set({ stores, fetchedAt: Date.now(), file: file.name });
  return stores;
}
async function cpLoadPrices(store, refresh) {
  const ref = db.collection('chainPrices').doc('hatzi-hinam__' + store.storeId);
  const meta = (await ref.get()).data();
  const age = meta ? Date.now() - meta.fetchedAt : Infinity;
  if (meta && (age < (refresh ? CP_MIN_REFRESH_MS : CP_FRESH_MS))) {
    const chunks = await ref.collection('chunks').orderBy('i').get();
    return { meta, items: chunks.docs.flatMap(c => JSON.parse(c.data().json)) };
  }
  const [file] = await cpListFiles(1, f => f.type === 'PriceFull' && chainPrices.sameStore(f.storeId, store.storeId));
  if (!file) throw new Error(`no PriceFull file for branch ${store.storeId}`);
  const parsed = chainPrices.parsePrices(chainPrices.toText(await cpGet(file.url, true)));
  const items = parsed.map(i => [i.code, i.name, i.maker, i.price, i.unitPrice, i.unit, i.qty, i.unitQty, i.weighted ? 1 : 0]);
  const old = await ref.collection('chunks').get();
  await Promise.all(old.docs.map(d => d.ref.delete()));
  for (let i = 0, n = 0; i < items.length; i += CP_CHUNK, n++) {
    await ref.collection('chunks').doc(String(n)).set({ i: n, json: JSON.stringify(items.slice(i, i + CP_CHUNK)) });
  }
  const m = { chain: 'hatzi-hinam', store, file: file.name, fileTime: file.ts || null, fetchedAt: Date.now(), count: items.length };
  await ref.set(m);
  return { meta: m, items };
}
exports.chainPricesTlv = onRequestV2({ ...TLV_OPTS, timeoutSeconds: 300, memory: '1GiB' }, async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    const query = String(req.query.store || 'אם המושבות פתח תקווה');
    if (req.query.stores === '1') { // the branch list (public), to find a branch's name
      const ref = db.collection('chainPrices').doc('hatzi-hinam__stores');
      if (req.query.refresh === '1') await ref.delete();
      const stores = await cpStores();
      return res.json({ count: stores.length, file: (await ref.get()).data()?.file, stores });
    }
    const stores = await cpStores();
    const matches = chainPrices.findStore(stores, query);
    if (matches.length !== 1) {
      const words = chainPrices.norm(query).split(' ').filter(w => w.length > 1);
      return res.status(matches.length ? 300 : 404).json({
        error: matches.length ? 'several branches match' : 'no branch matches',
        // branches in a city the query names
        matches: matches.length ? matches : stores.filter(s => { const c = chainPrices.norm(s.city); return c && words.some(w => c.includes(w)); }),
        branches: stores.length,
      });
    }
    const { meta, items } = await cpLoadPrices(matches[0], req.query.refresh === '1');
    const toObj = a => ({ code: a[0], name: a[1], maker: a[2], price: a[3], unitPrice: a[4], unit: a[5], qty: a[6], unitQty: a[7], weighted: !!a[8] });
    const out = { store: meta.store, file: meta.file, fileTime: meta.fileTime, fetchedAt: meta.fetchedAt, count: meta.count };
    if (req.query.q) out.results = chainPrices.searchProducts(items.map(toObj), String(req.query.q), 30);
    else if (req.query.all === '1') out.items = items.map(toObj);
    else out.sample = items.slice(0, 10).map(toObj);
    res.json(out);
  } catch (e) {
    console.error('chainPricesTlv:', e);
    res.status(502).json({ error: String(e.message || e) });
  }
});

// ─── webtopSync — runs every 20 min; syncs each family at the admin's Webtop interval ────
// (appConfig/featureFlags.webtopSyncIntervalHours, set in the admin settings; default 6h)
exports.webtopSync = functions.pubsub.schedule('*/20 * * * *').onRun(async () => {
  const cfg = (await db.collection('appConfig').doc('featureFlags').get()).data() || {};
  const intervalMs = Math.max(20 * 60 * 1000, (Number(cfg.webtopSyncIntervalHours) || 6) * 3600 * 1000 - 60 * 1000);
  const snapshot = await db.collection('families')
    .where('webtopStudents', '!=', null)
    .get();
  const now = Date.now();
  let synced = 0;
  const promises = snapshot.docs.map(async doc => {
    const { webtopStudents, webtopUpdatedAt } = doc.data();
    if (!webtopStudents || typeof webtopStudents !== 'object') return;
    // Only entries that still carry a server-usable token. Entries written by
    // webtopIngest (the extension fetches in-browser) have none — skip those, so
    // this job doesn't overwrite their status with a failed server-side fetch.
    const entries = Object.entries(webtopStudents).filter(([, e]) => e && e.token && e.syncParams);
    if (!entries.length) return;
    // Check if enough time has passed since last sync
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

// ═══════════════════════════════════════════════════════════════════════════════
// MASHOV INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════
// Some schools use Mashov instead of Webtop. It works like the Webtop connection
// does now: the parent logs into Mashov in their own browser (Chrome extension) or
// in the Android app, which fetches each kid's homework from there and posts it to
// mashovIngest. The server never logs into Mashov and never sees a password.
// Stored on the family doc:
//   mashovHomework  — [{subject, text, context, date, classCode: "mashov_<childGuid>", files?}]
//   mashovStudents  — { <childGuid>: {childGuid, studentName, className, schoolName, ...} }
// The app maps a kid to a Mashov child via members[].mashovChildId.

const mashov = require('./mashov-helpers');

// ─── mashovLink — validate a family code before the first ingest ──────────────
exports.mashovLink = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') { res.set('Access-Control-Allow-Headers', 'Content-Type'); return res.status(204).send(''); }
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { familyId } = req.body || {};
  if (!familyId || typeof familyId !== 'string') return res.status(400).json({ error: 'missing familyId' });
  try {
    const ref = db.collection('families').doc(familyId);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'family not found' });
    // Same reason as webtopLink: mashovIngest requires that a link step happened.
    await ref.update({ mashovLinkedAt: admin.firestore.FieldValue.serverTimestamp() });
    return res.json({ ok: true, familyName: doc.data()?.familyName || '' });
  } catch (err) {
    console.error('mashovLink error', err);
    return res.status(500).json({ error: 'server error' });
  }
});

// ─── mashovIngest — store one kid's homework, fetched by the extension / app ───
// Body: { familyId, child: {childGuid, privateName, familyName, classCode, classNum, schoolName},
//         since: 'YYYY-MM-DD', homework: [raw Mashov homework entries] }
exports.mashovIngest = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') { res.set('Access-Control-Allow-Headers', 'Content-Type'); return res.status(204).send(''); }
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { familyId, homework } = req.body || {};
  const child = mashov.cleanMashovChild(req.body?.child);
  if (!familyId || typeof familyId !== 'string' || !child || !Array.isArray(homework)) {
    return res.status(400).json({ error: 'missing fields' });
  }
  if (homework.length > 3000) return res.status(400).json({ error: 'too many items' });
  // Window the client fetched; default ~5 weeks back. Never more than a year.
  const minSince = new Date(Date.now() - 366 * 864e5).toISOString().slice(0, 10);
  let since = mashov.DATE_RE.test(String(req.body.since || '')) ? String(req.body.since) : new Date(Date.now() - 35 * 864e5).toISOString().slice(0, 10);
  if (since < minSince) since = minSince;

  const famRef = db.collection('families').doc(familyId);
  const familyDoc = await famRef.get();
  if (!familyDoc.exists) return res.status(404).json({ error: 'family not found' });
  const fam = familyDoc.data() || {};
  // Linked through mashovLink, or through webtopLink (the same extension links both).
  if (!fam.mashovLinkedAt && !fam.mashovStudents && !fam.webtopLinkedAt) {
    return res.status(403).json({ error: 'not linked — call mashovLink first' });
  }

  try {
    const classCode = mashov.mashovClassCode(child.childGuid);
    const clean = mashov.flattenMashovHomework(homework, child.childGuid, since);
    const merged = mashov.mergeMashovHomework(fam.mashovHomework, clean, classCode, since);
    const isFirstSync = !fam.mashovStudents?.[child.childGuid]?.initialSyncDone;
    await famRef.update({
      mashovHomework: merged,
      mashovUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      [`mashovStudents.${child.childGuid}`]: {
        childGuid: child.childGuid,
        classCode,
        studentName: child.privateName,
        familyName: child.familyName,
        className: `${child.classCode}${child.classNum}`,
        schoolName: child.schoolName,
        initialSyncDone: true,
        source: String(req.body.source || '').slice(0, 20) || 'extension',
      },
    });
    return res.json({ ok: true, homeworkCount: clean.length, total: merged.filter(h => h.classCode === classCode).length, isFirstSync });
  } catch (err) {
    console.error('mashovIngest error', err);
    return res.status(500).json({ error: 'server error' });
  }
});


// ── Family notifications ──────────────────────────────────

// A new list was shared with you
exports.onListCreated = functions.firestore
  .document('families/{familyUid}/lists/{listId}')
  .onCreate(async (snap, ctx) => {
    const list = snap.data();
    const { familyUid, listId } = ctx.params;
    const target = notify.listShareTarget(list);
    if (!target) return; // private list — nobody else to tell
    const tokens = notify.pickTokens(await getTokenDocs(familyUid), target);
    const { title, body } = notify.listSharedMessage(list);
    await sendToTokens(tokens, title, body, { type: 'list', listId, tag: `list-${listId}` });
  });

// Every evening at 18:00 (Israel): remind people of tomorrow's calendar events,
// only those the event is visible to (this includes calendar events created from dated lists)
exports.dailyEventReminders = functions.pubsub
  .schedule('0 18 * * *')
  .timeZone('Asia/Jerusalem')
  .onRun(async () => {
    const date = notify.tomorrowIn('Asia/Jerusalem');
    const families = await db.collection('families').select('events').get();
    for (const fam of families.docs) {
      const due = notify.eventsDueOn(fam.data().events, date);
      if (!due.length) continue;
      const tokenDocs = await getTokenDocs(fam.id);
      for (const ev of due) {
        const tokens = notify.pickTokens(tokenDocs, notify.eventTarget(ev));
        const { title, body } = notify.reminderMessage(ev);
        await sendToTokens(tokens, title, body, { type: 'eventReminder', date, tag: `ev-${ev.id || ev.title}-${date}` });
      }
    }
    console.log(`dailyEventReminders: done for ${date}`);
  });

// A parent shared homework with the whole class
exports.onClassHomeworkCreated = functions.firestore
  .document('schoolClasses/{classId}/homework/{hwId}')
  .onCreate(async (snap, ctx) => {
    const hw  = snap.data();
    const cid = ctx.params.classId;
    const uids = await getClassFamilyUids(cid);
    const { title, body } = notify.homeworkMessage(hw, classLabel(cid));
    await notifyFamilies(uids, hw.createdBy?.familyUid, title, body,
      { type: 'classHomework', classId: cid, hwId: ctx.params.hwId, tag: `hw-${ctx.params.hwId}` });
  });

// ── Google Calendar: persistent connection (OAuth authorization-code flow) ──────────
// The browser gets a one-time auth code from Google, we exchange it here for a refresh
// token (needs the OAuth client secret) and keep it server-side in `gcalTokens`, which
// no client can read. The browser then asks for short-lived access tokens whenever it
// needs one, so the user stays connected without re-consenting.
//
// One-time setup:  firebase functions:secrets:set GOOGLE_OAUTH_CLIENT_SECRET
const GCAL_CLIENT_ID = '34982320669-4sg8h4qmppd7v9jdtflqmoqretjsnffa.apps.googleusercontent.com';
const gcalCallable = functions.runWith({ secrets: ['GOOGLE_OAUTH_CLIENT_SECRET'] }).https.onCall;

function gcalDocRef(context, member) {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Sign in first');
  const m = String(member || '').trim();
  if (!m || m.length > 100) throw new functions.https.HttpsError('invalid-argument', 'Missing member');
  return db.collection('gcalTokens').doc(`${context.auth.uid}__${encodeURIComponent(m)}`);
}

async function googleTokenRequest(params) {
  // Secrets are bound at deploy time: after rotating GOOGLE_OAUTH_CLIENT_SECRET in
  // Secret Manager, redeploy the functions. A missing value is logged loudly here;
  // a wrong one comes back from Google as invalid_client ("client secret is invalid").
  if (!(process.env.GOOGLE_OAUTH_CLIENT_SECRET || '').trim()) {
    console.error('googleTokenRequest: GOOGLE_OAUTH_CLIENT_SECRET is empty — set it in Secret Manager and redeploy');
  }
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GCAL_CLIENT_ID,
      // trim: a secret set through a pipe often carries a trailing newline → invalid_client
      client_secret: (process.env.GOOGLE_OAUTH_CLIENT_SECRET || '').trim(),
      ...params,
    }).toString(),
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, json };
}

exports.gcalExchangeCode = gcalCallable(async (data, context) => {
  const ref = gcalDocRef(context, data?.member);
  if (!data?.code || typeof data.code !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Missing code');
  }
  const { ok, json } = await googleTokenRequest({
    code: data.code, grant_type: 'authorization_code', redirect_uri: 'postmessage',
  });
  if (!ok || !json.access_token) {
    console.error('gcalExchangeCode failed:', json.error, json.error_description);
    throw new functions.https.HttpsError('failed-precondition', 'Google rejected the code', { googleError: String(json.error || 'unknown') });
  }
  // Google only returns a refresh token on the first grant; keep the old one otherwise.
  if (json.refresh_token) {
    await ref.set({ refreshToken: json.refresh_token, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    return { accessToken: json.access_token, expiresIn: json.expires_in || 3600, persistent: true };
  }
  if ((await ref.get()).exists) {
    return { accessToken: json.access_token, expiresIn: json.expires_in || 3600, persistent: true };
  }
  // Legacy grant: Google issued no refresh token. Revoke it so the next Connect shows a fresh
  // consent screen, which does return one.
  console.warn('gcalExchangeCode: no refresh token issued; revoking grant to force re-consent');
  try {
    await fetch('https://oauth2.googleapis.com/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ token: json.access_token }).toString(),
    });
  } catch (e) { console.warn('revoke failed:', e.message); }
  throw new functions.https.HttpsError('failed-precondition', 'reconsent');
});

exports.gcalRefreshToken = gcalCallable(async (data, context) => {
  const ref = gcalDocRef(context, data?.member);
  const snap = await ref.get();
  if (!snap.exists) throw new functions.https.HttpsError('failed-precondition', 'not-connected', { googleError: 'no_saved_token' });
  const { ok, json } = await googleTokenRequest({
    refresh_token: snap.data().refreshToken, grant_type: 'refresh_token',
  });
  if (!ok || !json.access_token) {
    console.error('gcalRefreshToken failed:', json.error, json.error_description);
    if (json.error === 'invalid_grant') await ref.delete(); // revoked / expired — user must reconnect
    throw new functions.https.HttpsError('failed-precondition', 'not-connected', { googleError: String(json.error || 'unknown') });
  }
  return { accessToken: json.access_token, expiresIn: json.expires_in || 3600 };
});

exports.gcalDisconnect = gcalCallable(async (data, context) => {
  const ref = gcalDocRef(context, data?.member);
  const snap = await ref.get();
  if (snap.exists) {
    try {
      await fetch('https://oauth2.googleapis.com/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ token: snap.data().refreshToken }).toString(),
      });
    } catch (e) { console.warn('gcalDisconnect revoke failed:', e.message); }
    await ref.delete();
  }
  return { ok: true };
});

// ── Google Calendar from the Android app: consent in the browser ───────────────
// Google blocks its consent popup inside apps, and the app's identity (package +
// signing key) can't also be registered in the calendar client's project (it's
// taken by the Firebase project for Google sign-in). So the app opens Google's
// normal consent page in the phone's browser for the SAME web client, with this
// function as the redirect URI. It exchanges the code and saves the refresh token
// in the same gcalTokens doc the website's connect uses, so the connection is
// shared. The `state` is a one-time server nonce bound to the caller's login and
// member, so nobody can attach a grant to someone else's account.
//
// One-time setup: add GCAL_REDIRECT_URI to the web client's Authorized redirect URIs.
const GCAL_REDIRECT_URI = 'https://us-central1-familyhub-7fdd5.cloudfunctions.net/gcalOAuthCallback';

exports.gcalStartAuth = gcalCallable(async (data, context) => {
  const ref = gcalDocRef(context, data?.member); // checks sign-in + member
  const state = crypto.randomBytes(24).toString('hex');
  await db.collection('gcalAuthStates').doc(state).set({
    tokenDocId: ref.id,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    expiresAt: Date.now() + 10 * 60 * 1000,
  });
  const url = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
    client_id: GCAL_CLIENT_ID,
    redirect_uri: GCAL_REDIRECT_URI,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar.events',
    access_type: 'offline',
    prompt: 'consent', // always returns a refresh token
    include_granted_scopes: 'true',
    state,
  }).toString();
  return { url };
});

function gcalCallbackPage(res, status, ok, message) {
  const back = 'intent://gcal-connected#Intent;scheme=familyhub;package=com.familyhub.app;end';
  res.status(status).set('Content-Type', 'text/html; charset=utf-8').send(`<!doctype html>
<html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>FamilyHub · Google Calendar</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px 16px;background:#f3f5fd;color:#1a1a2e;font-family:system-ui,Arial,sans-serif;text-align:center}
@media (prefers-color-scheme: dark){body{background:#121320;color:#eceefb}}
.box{max-width:380px}.icon{font-size:56px}h1{font-size:22px;margin:12px 0 8px}p{font-size:15px;line-height:1.6;opacity:.8}
a{display:inline-block;margin-top:18px;background:#6C80E8;color:#fff;text-decoration:none;font-weight:700;padding:14px 26px;border-radius:14px}</style></head>
<body><div class="box"><div class="icon">${ok ? '✅' : '⚠️'}</div><h1>${ok ? 'Google Calendar מחובר' : 'החיבור לא הושלם'}</h1>
<p>${message}</p><a href="${back}">חזרה ל-FamilyHub</a></div></body></html>`);
}

exports.gcalOAuthCallback = functions.runWith({ secrets: ['GOOGLE_OAUTH_CLIENT_SECRET'] }).https.onRequest(async (req, res) => {
  const { code, state, error } = req.query || {};
  if (!state || typeof state !== 'string') return gcalCallbackPage(res, 400, false, 'קישור לא תקין. נסו להתחבר שוב מהאפליקציה.');
  const stateRef = db.collection('gcalAuthStates').doc(state);
  const st = await stateRef.get();
  if (!st.exists) return gcalCallbackPage(res, 400, false, 'הקישור כבר שומש או פג תוקפו. נסו להתחבר שוב מהאפליקציה.');
  const { tokenDocId, expiresAt } = st.data();
  await stateRef.delete(); // one-time
  if (Date.now() > (expiresAt || 0)) return gcalCallbackPage(res, 400, false, 'הקישור פג תוקף. נסו להתחבר שוב מהאפליקציה.');
  if (error || !code || typeof code !== 'string') return gcalCallbackPage(res, 200, false, 'האישור בוטל. אפשר לנסות שוב מהאפליקציה.');

  const { ok, json } = await googleTokenRequest({ code, grant_type: 'authorization_code', redirect_uri: GCAL_REDIRECT_URI });
  if (!ok || !json.access_token) {
    console.error('gcalOAuthCallback exchange failed:', json.error, json.error_description);
    return gcalCallbackPage(res, 502, false, `Google דחה את הבקשה (${String(json.error || 'unknown')}). נסו שוב מהאפליקציה.`);
  }
  const tokenRef = db.collection('gcalTokens').doc(tokenDocId);
  if (json.refresh_token) {
    await tokenRef.set({ refreshToken: json.refresh_token, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
  } else if (!(await tokenRef.get()).exists) {
    console.warn('gcalOAuthCallback: no refresh token issued');
    return gcalCallbackPage(res, 502, false, 'Google לא החזיר חיבור קבוע. נסו להתחבר שוב מהאפליקציה.');
  }
  return gcalCallbackPage(res, 200, true, 'אפשר לחזור לאפליקציה — האירועים שלכם יופיעו בלוח השנה.');
});

// ── Claude connector (MCP server + its OAuth sign-in) ─────
// Reached through the Hosting rewrites in firebase.json; see functions/mcp.js.
exports.mcp = functions.https.onRequest(require('./mcp').createHandler({
  db,
  auth: admin.auth(),
  FieldValue: admin.firestore.FieldValue,
  adminUid: ADMIN_UID,
}));
