'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const h = require('../member-devices-helpers');

test('a personal account is the member recorded on its mapping', () => {
  assert.equal(h.memberOfAccount({ mapData: { familyUid: 'f', memberName: 'ניר' }, authUser: { email: 'nir@gmail.com' } }), 'ניר');
});

test('an invite account is the member in its code account display name, else its code doc', () => {
  const inv = { email: 'tq877s@fh.familyhub', displayName: 'fam|ניר' };
  assert.equal(h.memberOfAccount({ mapData: { familyUid: 'f' }, authUser: inv }), 'ניר');
  assert.equal(h.memberOfAccount({ mapData: { familyUid: 'f' }, authUser: { email: 'c66n3a@fh.familyhub', displayName: '' }, codeDoc: { memberName: 'רוני' } }), 'רוני');
});

test('family-code and unknown accounts belong to no member', () => {
  assert.equal(h.memberOfAccount({ mapData: { familyUid: 'f' }, authUser: { email: 'famv23@fh.familyhub', displayName: 'fam|' } }), null);
  assert.equal(h.memberOfAccount({ mapData: { familyUid: 'f' }, authUser: { email: 'someone@gmail.com', displayName: 'fam|ניר' } }), null, 'only invite accounts carry the member in displayName');
  assert.equal(h.memberOfAccount({ mapData: null, authUser: null }), null);
});

test('invite email ↔ code', () => {
  assert.equal(h.codeOfInviteEmail('tq877s@fh.familyhub'), 'TQ877S');
  assert.equal(h.codeOfInviteEmail('nir@gmail.com'), null);
  assert.equal(h.isInviteEmail('X@FH.FAMILYHUB'), true);
});

test('new codes are 6 characters from the unambiguous alphabet', () => {
  for (let i = 0; i < 200; i++) assert.match(h.newJoinCode(), /^[A-HJ-NP-Z2-9]{6}$/);
  assert.equal(h.newJoinCode(() => 0), 'AAAAAA');
});
