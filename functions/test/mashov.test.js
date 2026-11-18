'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const m = require('../mashov-helpers');

const KID = '11111111-2222-4333-8444-555555555555';
const OTHER = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const CC = `mashov_${KID}`;

// Shaped like Mashov's GET /api/students/{guid}/homework response.
const raw = [
  { lessonId: 1, lessonDate: '2026-11-08T00:00:00', lesson: 5, homework: 'workbook 42-50', groupId: 7, remark: 'Mediation', studentGuid: KID, subjectName: 'אנגלית' },
  { lessonId: 2, lessonDate: '2026-11-08T00:00:00', lesson: 6, homework: 'workbook 42-50', groupId: 7, remark: 'Mediation', studentGuid: KID, subjectName: 'אנגלית' },
  { lessonId: 3, lessonDate: '2026-11-13T00:00:00', lesson: 3, homework: 'עמוד 110', groupId: 8, remark: 'מספרים מכוונים', studentGuid: KID, subjectName: 'מתמטיקה',
    files: [{ fileId: 'f1', fileName: 'a.pdf' }] },
  { lessonId: 4, lessonDate: '2026-11-13T00:00:00', lesson: 4, homework: 'עמוד 111', groupId: 8, remark: 'מספרים מכוונים', studentGuid: KID, subjectName: 'מתמטיקה' },
  { lessonId: 5, lessonDate: '2026-09-18T00:00:00', lesson: 4, homework: 'old', groupId: 8, studentGuid: KID, subjectName: 'מתמטיקה' },
  { lessonId: 6, lessonDate: '2026-11-14T00:00:00', lesson: 1, homework: '   ', groupId: 9, studentGuid: KID, subjectName: 'היסטוריה' },
  { lessonId: 7, lessonDate: '2026-11-14T00:00:00', lesson: 1, homework: 'not mine', groupId: 9, studentGuid: OTHER, subjectName: 'היסטוריה' },
  { lessonId: 8, lessonDate: '2026-10-04T00:00:00', lesson: 5, homework: 'p.8', groupId: 10, remark: 'חינוך', studentGuid: KID, subjectName: 'חינוך' },
];

test('flatten groups by date + subject, merges double lessons, drops empty / other kid / before since', () => {
  const out = m.flattenMashovHomework(raw, KID, '2026-10-01');
  assert.equal(out.length, 3);
  const eng = out.find(h => h.subject === 'אנגלית');
  assert.deepEqual(eng, { subject: 'אנגלית', text: 'workbook 42-50', context: 'Mediation', date: '2026-11-08', classCode: CC });
  const math = out.find(h => h.subject === 'מתמטיקה');
  assert.equal(math.text, 'עמוד 110\nעמוד 111');
  assert.equal(math.context, 'מספרים מכוונים');
  assert.equal(math.files, 1);
  // A remark equal to the subject adds nothing.
  assert.equal(out.find(h => h.subject === 'חינוך').context, '');
});

test('flatten ignores junk input', () => {
  assert.deepEqual(m.flattenMashovHomework(null, KID), []);
  assert.deepEqual(m.flattenMashovHomework([null, 5, { lessonDate: 'x', homework: 'a' }], KID), []);
});

test('merge replaces only this kid\'s items inside the window', () => {
  const existing = [
    { classCode: CC, date: '2026-09-01', subject: 'a', text: 'old, outside window' },
    { classCode: CC, date: '2026-11-10', subject: 'b', text: 'deleted by teacher' },
    { classCode: 'mashov_other', date: '2026-11-10', subject: 'c', text: 'sibling' },
    { classCode: '7', date: '2026-11-10', subject: 'd', text: 'webtop-shaped' },
  ];
  const incoming = [{ classCode: CC, date: '2026-11-12', subject: 'e', text: 'new' }];
  const out = m.mergeMashovHomework(existing, incoming, CC, '2026-11-01');
  assert.deepEqual(out.map(h => h.subject), ['a', 'c', 'd', 'e']);
});

test('cleanMashovChild validates the guid and bounds fields', () => {
  assert.equal(m.cleanMashovChild({ childGuid: 'nope' }), null);
  assert.equal(m.cleanMashovChild(null), null);
  const c = m.cleanMashovChild({ childGuid: KID.toUpperCase(), privateName: 'רוני', classCode: 'ז', classNum: 1, groups: [1, 2] });
  assert.deepEqual(c, { childGuid: KID, privateName: 'רוני', familyName: '', classCode: 'ז', classNum: '1', schoolName: '' });
});
