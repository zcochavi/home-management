// Pure helpers for the Mashov homework sync (no Firestore, no network), shared by
// mashovIngest in index.js and its tests.
//
// Mashov's GET /api/students/{childGuid}/homework returns one entry per lesson that
// has homework: { lessonId, lessonDate, lesson, homework, groupId, remark,
// subjectName, studentGuid, files?: [{fileId, fileName}] }. A double lesson shows up
// as two entries with the same text, and a teacher can set different homework in
// two lessons of the same subject on one day.
//
// FamilyHub stores synced homework as { subject, text, context, date, classCode }
// (the Webtop shape), keyed in the app by classCode|date|subject. So entries are
// grouped by date + subject, distinct texts joined. classCode is
// "mashov_<childGuid>" — per child, since Mashov is per child, not per class.
'use strict';

const GUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const isMashovGuid = (s) => typeof s === 'string' && GUID_RE.test(s);
const mashovClassCode = (childGuid) => `mashov_${String(childGuid).toLowerCase()}`;

// Items from a client: keep only the expected fields, bounded, grouped by date + subject.
function flattenMashovHomework(raw, childGuid, since = '') {
  const classCode = mashovClassCode(childGuid);
  const groups = new Map();
  for (const h of Array.isArray(raw) ? raw : []) {
    if (!h || typeof h !== 'object') continue;
    if (h.studentGuid && String(h.studentGuid).toLowerCase() !== String(childGuid).toLowerCase()) continue;
    const date = String(h.lessonDate || '').slice(0, 10);
    const text = String(h.homework || '').trim();
    if (!text || !DATE_RE.test(date) || (since && date < since)) continue;
    const subject = String(h.subjectName || '').trim().slice(0, 200);
    const key = `${date}|${subject}`;
    let g = groups.get(key);
    if (!g) groups.set(key, g = { subject, date, texts: [], contexts: [], files: new Set() });
    if (!g.texts.includes(text)) g.texts.push(text);
    const remark = String(h.remark || '').trim();
    if (remark && remark !== subject && !g.contexts.includes(remark)) g.contexts.push(remark);
    for (const f of Array.isArray(h.files) ? h.files : []) if (f?.fileId) g.files.add(String(f.fileId));
  }
  return [...groups.values()].map(g => {
    const item = {
      subject: g.subject,
      text: g.texts.join('\n').slice(0, 5000),
      context: g.contexts.join(' · ').slice(0, 500),
      date: g.date,
      classCode,
    };
    if (g.files.size) item.files = Math.min(g.files.size, 50); // attachments need a Mashov login to open — just the count
    return item;
  });
}

// Mashov returns the current state of every lesson, so within the fetched window
// (date >= since) its answer replaces what we had for this child: edits update and
// homework a teacher deleted disappears. Older items, and other kids' items, stay.
function mergeMashovHomework(existing, incoming, classCode, since) {
  const keep = (Array.isArray(existing) ? existing : [])
    .filter(h => h && !(h.classCode === classCode && (!since || String(h.date || '') >= since)));
  return [...keep, ...incoming];
}

// The child as sent by a client, from Mashov's login response
// (accessToken.children[]), bounded. Returns null if the guid is not valid.
function cleanMashovChild(child) {
  if (!child || typeof child !== 'object' || !isMashovGuid(child.childGuid)) return null;
  const s = (v, n) => String(v ?? '').trim().slice(0, n);
  return {
    childGuid: child.childGuid.toLowerCase(),
    privateName: s(child.privateName, 60),
    familyName: s(child.familyName, 60),
    classCode: s(child.classCode, 10),
    classNum: s(child.classNum, 10),
    schoolName: s(child.schoolName, 120),
  };
}

module.exports = { isMashovGuid, mashovClassCode, flattenMashovHomework, mergeMashovHomework, cleanMashovChild, DATE_RE };
