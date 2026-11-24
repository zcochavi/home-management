'use strict';
const test = require('node:test');
const assert = require('node:assert');
const dir = require('../school-directory');

test('lookup: a school by its Ministry code', () => {
  const any = Object.entries(require('../data/israel-schools.json').schools)[0];
  const s = dir.lookup(any[0]);
  assert.deepStrictEqual(s, { semel: any[0], name: any[1][0], city: any[1][1] });
  assert.deepStrictEqual(dir.lookup(Number(any[0])), s, 'numbers work too');
  assert.deepStrictEqual(dir.lookup('0' + any[0]), s, 'leading zeros are ignored');
});

test('lookup: unknown or empty codes', () => {
  assert.strictEqual(dir.lookup('999999999'), null);
  assert.strictEqual(dir.lookup(''), null);
  assert.strictEqual(dir.lookup(null), null);
  assert.strictEqual(dir.lookup('abc'), null);
});

test('cityKey matches normCityId in app.js', () => {
  const normCityId = city => (city||'').trim().toLowerCase().replace(/\s+/g,'_').replace(/[^\w֐-׿]/g,'');
  for (const c of ['תל אביב - יפו', ' חיפה ', 'מודיעין-מכבים-רעות', "קריית ביאליק"]) assert.strictEqual(dir.cityKey(c), normCityId(c));
});

test('indexEntries: every school under its city, no duplicates', () => {
  const { cities, schools } = dir.indexEntries();
  const all = require('../data/israel-schools.json').schools;
  assert.ok(cities.length > 500, 'hundreds of cities');
  assert.strictEqual(new Set(cities).size, cities.length);
  const total = Object.values(schools).reduce((n, v) => n + v.names.length, 0);
  assert.ok(total > 5000 && total <= Object.keys(all).length);
  const [name, city] = Object.values(all)[0];
  assert.ok(schools[dir.cityKey(city)].names.includes(name));
  for (const v of Object.values(schools)) assert.strictEqual(new Set(v.names).size, v.names.length);
});

test('nameKey: quote marks, dashes and spaces don\'t count', () => {
  assert.strictEqual(dir.nameKey('שש שנתי ע״ש יצחק שמיר'), dir.nameKey('שש שנתי ע"ש יצחק  שמיר '));
  assert.strictEqual(dir.nameKey("ביה״ס ג׳"), dir.nameKey("ביה\"ס ג'"));
  assert.strictEqual(dir.nameKey('תל אביב - יפו'), dir.nameKey('תל אביב-יפו'));
  assert.notStrictEqual(dir.nameKey('אורט'), dir.nameKey('אורט חיפה'));
});

test('mergeNames: one spelling per name, the existing one first', () => {
  assert.deepStrictEqual(
    dir.mergeNames(['שש שנתי ע״ש יצחק שמיר', 'בית ספר', 'בית  ספר'], ['שש שנתי ע"ש יצחק שמיר', 'אורט']),
    ['שש שנתי ע״ש יצחק שמיר', 'בית ספר', 'אורט']);
  assert.deepStrictEqual(dir.mergeNames(null, ['א', '', 'א']), ['א']);
  assert.strictEqual(dir.findName(['ע״ש'], 'ע"ש'), 'ע״ש');
  assert.strictEqual(dir.findName(['א'], 'ב'), null);
});

test('filterRecords: schools only, by Ministry code', () => {
  const rec = (semel, name, city, kind, stage) => ({ SEMEL_MOSAD: semel, SHEM_MOSAD: name, ISV_SHEM_ISHUV: city, TEUR_TAT_SUG_MISGERET: kind, TEUR_SHLAV_HINUH: stage });
  assert.deepStrictEqual(dir.filterRecords([
    rec(310123, ' אורט  חיפה ', 'חיפה', 'בית ספר', 'עליונה בלבד'),
    rec(1, 'גן דוריס', 'כפר סבא', 'גן ילדים', 'גן ילדים בלבד'),
    rec(2, 'מתי"א', 'חיפה', 'מתי"א', 'יסודי בלבד'),
    rec(3, 'בלי עיר', '', 'בית ספר', 'יסודי בלבד'),
    rec(4, 'ישיבה', 'בני ברק', 'ישיבה קטנה', 'חט"ב + עליונה'),
  ]), { '310123': ['אורט חיפה', 'חיפה'], '4': ['ישיבה', 'בני ברק'] });
});

test('download: pages through data.gov.il; refuses a too-short answer', async () => {
  const many = n => Array.from({ length: n }, (_, i) => ({ SEMEL_MOSAD: 100000 + i, SHEM_MOSAD: 'בי"ס ' + i, ISV_SHEM_ISHUV: 'עיר ' + (i % 50), TEUR_TAT_SUG_MISGERET: 'בית ספר', TEUR_SHLAV_HINUH: 'יסודי בלבד' }));
  const all = many(12000), urls = [];
  const fake = async url => {
    urls.push(url);
    const off = Number(/offset=(\d+)/.exec(url)[1]);
    return { ok: true, json: async () => ({ success: true, result: { records: all.slice(off, off + 10000) } }) };
  };
  const got = await dir.download(fake);
  assert.strictEqual(Object.keys(got).length, 12000);
  assert.strictEqual(urls.length, 2);
  assert.ok(urls[0].includes(dir.SOURCE_RESOURCE));
  await assert.rejects(dir.download(async () => ({ ok: true, json: async () => ({ success: true, result: { records: many(10) } }) })), /only 10 schools/);
  await assert.rejects(dir.download(async () => ({ ok: false, status: 503 })), /503/);
});

test('lookup / indexEntries on a given list', () => {
  const list = { '5': ['אורט', 'חיפה'] };
  assert.deepStrictEqual(dir.lookup('5', list), { semel: '5', name: 'אורט', city: 'חיפה' });
  assert.deepStrictEqual(dir.indexEntries(list).cities, ['חיפה']);
});
