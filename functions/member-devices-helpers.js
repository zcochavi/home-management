'use strict';
// Helpers for disconnectMemberDevices: which family member a joined account belongs to,
// and new personal join codes (same alphabet and length as generateFamilyCode in app.js).

const INVITE_DOMAIN = '@fh.familyhub';
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const isInviteEmail = email => typeof email === 'string' && email.toLowerCase().endsWith(INVITE_DOMAIN);

// The member a joined account signs in as.
//  - personal accounts (Google / email) that joined with a member code: uidToFamily.memberName
//  - invite accounts (CODE@fh.familyhub): the code's Auth displayName "familyUid|memberName",
//    falling back to that code's joinCodes doc
// Returns null when the account isn't tied to a member (e.g. joined with the family code).
function memberOfAccount({ mapData, authUser, codeDoc }) {
  if (mapData && typeof mapData.memberName === 'string' && mapData.memberName) return mapData.memberName;
  if (authUser && isInviteEmail(authUser.email)) {
    const dn = authUser.displayName || '';
    const pipe = dn.indexOf('|');
    if (pipe >= 0 && dn.slice(pipe + 1)) return dn.slice(pipe + 1);
    if (codeDoc && typeof codeDoc.memberName === 'string' && codeDoc.memberName) return codeDoc.memberName;
  }
  return null;
}

// The join code behind an invite account's email (CODE@fh.familyhub → "CODE")
const codeOfInviteEmail = email => (isInviteEmail(email) ? email.slice(0, -INVITE_DOMAIN.length).toUpperCase() : null);

function newJoinCode(random = Math.random) {
  let code = '';
  for (let i = 0; i < 6; i++) code += CODE_CHARS[Math.floor(random() * CODE_CHARS.length)];
  return code;
}

module.exports = { INVITE_DOMAIN, isInviteEmail, memberOfAccount, codeOfInviteEmail, newJoinCode };
