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

async function getClassFamilyUids(classId) {
  const snap = await db.collection('schoolClasses').doc(classId)
    .collection('members').get();
  const uids = [...new Set(snap.docs.map(d => d.data().familyUid).filter(Boolean))];
  console.log(`getClassFamilyUids(${classId}): ${uids.length} family(ies): ${uids.join(', ')}`);
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
    const targetUids = familyDocs
      .filter(d => d?.exists && d.data().role === 'committee')
      .map(d => d.id);

    // Always include admin
    if (ADMIN_UID && !targetUids.includes(ADMIN_UID)) targetUids.push(ADMIN_UID);
    console.log(`onPendingEventCreated: notifying ${targetUids.length} committee/admin user(s)`);
    if (!targetUids.length) return;

    const tokenArrays = await Promise.all(targetUids.map(getTokens));
    const poster = ev.postedBy?.familyName || '';
    await sendToTokens(tokenArrays.flat(),
      `⏳ ממתין לאישור: ${ev.title}`,
      `${poster ? poster + ' · ' : ''}${classLabel(cid)}`,
      { type: 'pendingApproval', classId: cid, pendingId: ctx.params.pendingId }
    );
  });

exports.onClassEventCreated = functions.firestore
  .document('schoolClasses/{classId}/events/{eventId}')
  .onCreate(async (snap, ctx) => {
    const ev  = snap.data();
    const cid = ctx.params.classId;
    console.log(`onClassEventCreated: classId=${cid}, title="${ev.title}", posterUid=${ev.postedBy?.familyUid}`);
    const uids = await getClassFamilyUids(cid);
    const poster = ev.postedBy?.familyName || '';
    const body   = poster ? `${poster} · ${classLabel(cid)}` : classLabel(cid);
    await notifyFamilies(uids, ev.postedBy?.familyUid, ev.title, body,
      { type: 'classEvent', classId: cid, eventId: ctx.params.eventId });
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
