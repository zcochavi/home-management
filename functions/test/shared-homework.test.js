'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const h = require('../shared-homework-helpers');

const classIdFor = s => s?.city && s?.grade ? [s.city, s.name || '', s.grade, s.classNum || ''].join('~~') : null;
const NOW = Date.parse('2026-11-21T12:00:00Z');
const fam = {
  members: [
    { name: 'זוהר', role: 'parent' },
    { name: 'רוני', role: 'kid', webtopClassCode: 'C7', school: { city: 'פתח תקווה', name: 'שש שנתי', grade: 'ז', classNum: '1' } },
    { name: 'שירה', role: 'kid', mashovChildId: 'g-1', school: { city: 'פתח תקווה', name: 'אריק', grade: 'ה', classNum: '2' } },
    { name: 'נויה', role: 'kid' }, // no school → nothing shared
  ],
  webtopHomework: [
    { classCode: 'C7', date: '2026-11-19T00:00:00', subject: 'אנגלית', text: '  workbook   42 ' },
    { classCode: 'OTHER', date: '2026-11-19', subject: 'x', text: 'unmapped class' },
    { classCode: 'C7', date: '2026-01-01', subject: 'old', text: 'too old' },
  ],
  mashovHomework: [{ classCode: 'mashov_g-1', date: '2026-11-18', subject: 'מתמטיקה', text: 'עמוד 110', context: 'שברים', files: 1 }],
};

test('syncId depends only on subject, day and (whitespace-normalised) text', () => {
  const a = h.syncId({ subject: 'אנגלית', date: '2026-11-19T00:00:00', text: 'workbook 42', classCode: 'C7' });
  const b = h.syncId({ subject: ' אנגלית', date: '2026-11-19', text: 'workbook   42 ', classCode: 'mashov_zzz' });
  assert.equal(a, b);
  assert.match(a, /^[0-9a-f]{16}$/);
  assert.notEqual(a, h.syncId({ subject: 'אנגלית', date: '2026-11-20', text: 'workbook 42' }));
});

test('items go to the mapped kid\'s class; unmapped, schoolless and old items are not shared', () => {
  const out = Object.values(h.sharedItems(fam, classIdFor, NOW));
  assert.equal(out.length, 2);
  const eng = out.find(x => x.data.subject === 'אנגלית');
  assert.equal(eng.cid, 'פתח תקווה~~שש שנתי~~ז~~1');
  assert.deepEqual(eng.data, { subject: 'אנגלית', text: 'workbook 42', date: '2026-11-19', source: 'webtop' });
  const math = out.find(x => x.data.source === 'mashov');
  assert.equal(math.cid, 'פתח תקווה~~אריק~~ה~~2');
  assert.deepEqual(math.data, { subject: 'מתמטיקה', text: 'עמוד 110', date: '2026-11-18', source: 'mashov', context: 'שברים', files: 1 });
});

test('changedItems returns only new or changed items', () => {
  assert.equal(h.changedItems({}, fam, classIdFor, NOW).length, 2);
  assert.equal(h.changedItems(fam, fam, classIdFor, NOW).length, 0);
  const more = { ...fam, webtopHomework: [...fam.webtopHomework, { classCode: 'C7', date: '2026-11-20', subject: 'לשון', text: 'חיבור' }] };
  assert.deepEqual(h.changedItems(fam, more, classIdFor, NOW).map(x => x.data.subject), ['לשון']);
  // mapping a kid to its class later shares that kid's items
  const unmapped = { ...fam, members: fam.members.map(m => m.name === 'רוני' ? { ...m, webtopClassCode: undefined } : m) };
  assert.deepEqual(h.changedItems(unmapped, fam, classIdFor, NOW).map(x => x.data.subject), ['אנגלית']);
});

test('connectedClasses: kids mapped to a system the family is linked to', () => {
  const s = { city: 'פת', name: 'א', grade: 'ה', classNum: '2' }, s2 = { city: 'פת', name: 'ב', grade: 'ז', classNum: '1' };
  const base = { members: [
    { name: 'a', role: 'kid', webtopClassCode: 'C7', school: s2 },
    { name: 'b', role: 'kid', mashovChildId: 'g1', school: s },
    { name: 'c', role: 'kid', school: { city: 'x', grade: 'א' } },
    { name: 'p', role: 'parent', webtopClassCode: 'C7', school: s },
  ] };
  assert.deepEqual([...h.connectedClasses(base, classIdFor)], [], 'not linked anywhere');
  assert.deepEqual([...h.connectedClasses({ ...base, webtopLinkedAt: 1 }, classIdFor)], ['פת~~ב~~ז~~1']);
  assert.deepEqual([...h.connectedClasses({ ...base, mashovStudents: { g1: {} } }, classIdFor)], ['פת~~א~~ה~~2']);
  assert.deepEqual([...h.connectedClasses({ ...base, mashovStudents: { other: {} } }, classIdFor)], []);
});
