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
