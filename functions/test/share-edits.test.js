'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const h = require('../share-edit-helpers');

test('cleanEdit accepts the three ops and trims / caps fields', () => {
  assert.deepEqual(h.cleanEdit({ op: 'add', name: '  חלב  ', qty: ' 2 ', by: 'דנה' }), { op: 'add', by: 'דנה', name: 'חלב', qty: '2' });
  assert.deepEqual(h.cleanEdit({ op: 'rename', itemId: 17, name: 'לחם' }), { op: 'rename', by: '', itemId: '17', name: 'לחם' });
  assert.deepEqual(h.cleanEdit({ op: 'delete', itemId: '17', name: 'ignored' }), { op: 'delete', by: '', itemId: '17' });
  assert.equal(h.cleanEdit({ op: 'add', name: 'x'.repeat(500) }).name.length, h.MAX_NAME);
});

test('cleanEdit rejects junk', () => {
  for (const raw of [null, 5, {}, { op: 'drop', itemId: 1 }, { op: 'add', name: '   ' }, { op: 'add' },
    { op: 'rename', name: 'a' }, { op: 'delete' }, { op: 'delete', itemId: '' }, { op: 'add', name: 7 }]) {
    assert.equal(h.cleanEdit(raw), null, JSON.stringify(raw));
  }
});

const items = [{ id: 100, name: 'חלב', done: true, checkedBy: 'רון' }, { id: 200, name: 'לחם', done: false, qty: '1' }];

test('add appends a new unchecked item with a unique numeric id and who added it', () => {
  const out = h.applyEdit(items, { op: 'add', name: 'ביצים', qty: '12', by: 'דנה' }, 150);
  assert.equal(out.length, 3);
  assert.deepEqual(out[2], { id: 201, name: 'ביצים', done: false, qty: '12', addedBy: 'דנה' });
  assert.equal(h.applyEdit(items, { op: 'add', name: 'a' }, 5000)[2].id, 5000);
  assert.equal(items.length, 2, 'input not mutated');
});

test('rename changes the name (and qty when given) and keeps the rest', () => {
  const out = h.applyEdit(items, { op: 'rename', itemId: '100', name: 'חלב סויה' });
  assert.deepEqual(out[0], { id: 100, name: 'חלב סויה', done: true, checkedBy: 'רון' });
  assert.equal(h.applyEdit(items, { op: 'rename', itemId: '200', name: 'לחם', qty: '3' })[1].qty, '3');
  assert.equal(h.applyEdit(items, { op: 'rename', itemId: '200', name: 'לחם' }), null, 'no-op rename');
});

test('delete removes the item; unknown ids change nothing', () => {
  assert.deepEqual(h.applyEdit(items, { op: 'delete', itemId: '100' }).map(i => i.id), [200]);
  assert.equal(h.applyEdit(items, { op: 'delete', itemId: '999' }), null);
  assert.equal(h.applyEdit(items, { op: 'rename', itemId: '999', name: 'x' }), null);
});

test('add refuses a full list', () => {
  const full = Array.from({ length: h.MAX_ITEMS }, (_, i) => ({ id: i + 1, name: 'x' }));
  assert.equal(h.applyEdit(full, { op: 'add', name: 'one more' }), null);
});

test('shareItemsFor keeps joint guests\' checks, strips them on view-only, passes through otherwise', () => {
  const list = [{ id: 1, name: 'a', done: false }, { id: 2, name: 'b-renamed', done: false }, { id: 3, name: 'new' }];
  const shareItems = [{ id: 2, name: 'b', done: true, checkedBy: 'גיא', checkedById: 'g1' }];
  const joint = h.shareItemsFor(list, 'claim', shareItems);
  assert.deepEqual(joint[1], { id: 2, name: 'b-renamed', done: true, checkedBy: 'גיא', checkedById: 'g1' });
  assert.deepEqual(joint[2], { id: 3, name: 'new' });
  assert.deepEqual(h.shareItemsFor([{ id: 1, name: 'a', done: true, checkedBy: 'x' }], 'readonly', []), [{ id: 1, name: 'a' }]);
  assert.deepEqual(h.shareItemsFor(list, 'self', shareItems), list);
});
