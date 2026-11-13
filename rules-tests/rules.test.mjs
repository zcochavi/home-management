// Firestore rules tests (family membership, join codes, connector state). Run: npm install && npm test
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { doc, getDoc, setDoc, deleteDoc, getDocs, collection, updateDoc, addDoc } from 'firebase/firestore';
const env = await initializeTestEnvironment({ projectId: 'demo-fh', firestore: { host: '127.0.0.1', port: 8089, rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8') } });
let pass = 0, fail = 0;
const check = async (name, p) => { try { await p; pass++; console.log('ok   ', name); } catch (e) { fail++; console.log('FAIL ', name, '-', String(e.message).slice(0, 140)); } };
const seed = async () => { await env.clearFirestore(); await env.withSecurityRulesDisabled(async c => { const d = c.firestore();
  await setDoc(doc(d, 'families/victim'), { familyName: 'V', members: [] });
  await setDoc(doc(d, 'families/victim/lists/l1'), { name: 'secret' });
  await setDoc(doc(d, 'families/other'), { familyName: 'O' });
  await setDoc(doc(d, 'joinCodes/FAMV23'), { ownerUid: 'victim' });
  await setDoc(doc(d, 'joinCodes/KIDV23'), { ownerUid: 'victim', memberName: 'kid' });
  await setDoc(doc(d, 'joinCodes/OTHER2'), { ownerUid: 'other' });
  await setDoc(doc(d, 'uidToFamily/joined'), { familyUid: 'victim', memberName: 'mom' });
  await setDoc(doc(d, 'uidToFamily/legacyInvite'), { familyUid: 'victim' });
  await setDoc(doc(d, 'mcpTokens/t'), { x: 1 });
}); };
const as = (uid, email) => env.authenticatedContext(uid, email ? { email } : {}).firestore();
await seed();

// ── The hole ──
const att = as('attacker', 'a@evil.com');
await check('attacker cannot map self to a family (old exploit)', assertFails(setDoc(doc(att, 'uidToFamily/attacker'), { familyUid: 'victim' })));
await check('…nor with merge', assertFails(setDoc(doc(att, 'uidToFamily/attacker'), { familyUid: 'victim' }, { merge: true })));
await check('…nor with a made-up code', assertFails(setDoc(doc(att, 'uidToFamily/attacker'), { familyUid: 'victim', memberName: null, joinCode: 'NOPE22' })));
await check('…nor with another family\'s code', assertFails(setDoc(doc(att, 'uidToFamily/attacker'), { familyUid: 'victim', memberName: null, joinCode: 'OTHER2' })));
await check('…nor a path-shaped code', assertFails(setDoc(doc(att, 'uidToFamily/attacker'), { familyUid: 'victim', memberName: null, joinCode: 'FAMV23/x' })));
await check('attacker cannot write someone else\'s mapping', assertFails(setDoc(doc(att, 'uidToFamily/joined'), { familyUid: 'other' })));
await check('attacker cannot read someone else\'s mapping', assertFails(getDoc(doc(att, 'uidToFamily/joined'))));
await check('attacker cannot list mappings', assertFails(getDocs(collection(att, 'uidToFamily'))));
await check('attacker still cannot read victim family', assertFails(getDoc(doc(att, 'families/victim'))));
await check('attacker cannot forge a join code for victim', assertFails(setDoc(doc(att, 'joinCodes/EVIL22'), { ownerUid: 'victim' })));
await check('attacker cannot re-point an existing code', assertFails(setDoc(doc(att, 'joinCodes/FAMV23'), { ownerUid: 'attacker' })));
await check('attacker cannot strip a kid code\'s member', assertFails(setDoc(doc(att, 'joinCodes/KIDV23'), { ownerUid: 'victim' })));
await check('attacker cannot delete a code', assertFails(deleteDoc(doc(att, 'joinCodes/FAMV23'))));
await check('nobody can list join codes', assertFails(getDocs(collection(att, 'joinCodes'))));
await check('no nested docs under joinCodes', assertFails(setDoc(doc(att, 'joinCodes/A/b/c'), { ownerUid: 'victim' })));
await check('signed-out user cannot read a code', assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), 'joinCodes/FAMV23'))));
// own-family attacker with own code can't jump families
await check('attacker with own invite account cannot map to victim', assertFails(setDoc(doc(as('inv2', 'other2@fh.familyhub'), 'uidToFamily/inv2'), { familyUid: 'victim' }, { merge: true })));
await check('self-made invite account with no code record gets nothing', assertFails(setDoc(doc(as('inv3', 'zzzzzz@fh.familyhub'), 'uidToFamily/inv3'), { familyUid: 'victim' }, { merge: true })));

// ── Legit flows keep working ──
await check('anyone signed in can read a code they know', assertSucceeds(getDoc(doc(att, 'joinCodes/FAMV23'))));
const g = as('google1', 'g@gmail.com');
await check('personal account joins with family code', assertSucceeds(setDoc(doc(g, 'uidToFamily/google1'), { familyUid: 'victim', memberName: null, joinCode: 'FAMV23' })));
await check('…and can then read the family', assertSucceeds(getDoc(doc(g, 'families/victim/lists/l1'))));
await check('…and its own mapping', assertSucceeds(getDoc(doc(g, 'uidToFamily/google1'))));
await check('…login re-write (merge) passes', assertSucceeds(setDoc(doc(g, 'uidToFamily/google1'), { familyUid: 'victim' }, { merge: true })));
await check('…cannot hop to another family without its code', assertFails(setDoc(doc(g, 'uidToFamily/google1'), { familyUid: 'other' }, { merge: true })));
await check('…cannot rename self to another member', assertFails(setDoc(doc(g, 'uidToFamily/google1'), { memberName: 'mom' }, { merge: true })));
await check('…can move to another family with its code', assertSucceeds(setDoc(doc(g, 'uidToFamily/google1'), { familyUid: 'other', memberName: null, joinCode: 'OTHER2' })));
await check('…cannot delete own mapping', assertFails(deleteDoc(doc(g, 'uidToFamily/google1'))));
const k = as('google2', 'kid@gmail.com');
await check('kid code: must join as that kid', assertSucceeds(setDoc(doc(k, 'uidToFamily/google2'), { familyUid: 'victim', memberName: 'kid', joinCode: 'KIDV23' })));
await check('kid code cannot be used to join as a parent', assertFails(setDoc(doc(as('google3', 'k2@gmail.com'), 'uidToFamily/google3'), { familyUid: 'victim', memberName: 'mom', joinCode: 'KIDV23' })));
await check('kid code cannot be used to join with no member', assertFails(setDoc(doc(as('google3', 'k2@gmail.com'), 'uidToFamily/google3'), { familyUid: 'victim', memberName: null, joinCode: 'KIDV23' })));
await check('extra fields are refused', assertFails(setDoc(doc(as('google3', 'k2@gmail.com'), 'uidToFamily/google3'), { familyUid: 'victim', memberName: 'kid', joinCode: 'KIDV23', admin: true })));
const inv = as('inviteFam', 'famv23@fh.familyhub');
await check('family-code invite account maps on login (current + old app)', assertSucceeds(setDoc(doc(inv, 'uidToFamily/inviteFam'), { familyUid: 'victim' }, { merge: true })));
await check('…then reads the family', assertSucceeds(getDoc(doc(inv, 'families/victim'))));
const kinv = as('inviteKid', 'kidv23@fh.familyhub');
await check('kid-code invite account maps on login', assertSucceeds(setDoc(doc(kinv, 'uidToFamily/inviteKid'), { familyUid: 'victim' }, { merge: true })));
await check('kid-code invite account cannot claim to be a parent', assertFails(setDoc(doc(kinv, 'uidToFamily/inviteKid'), { familyUid: 'victim', memberName: 'mom' }, { merge: true })));
await check('invite account cannot present a different code', assertFails(setDoc(doc(kinv, 'uidToFamily/inviteKid'), { familyUid: 'other', memberName: null, joinCode: 'OTHER2' })));
await check('existing member whose code was removed keeps re-writing fine', assertSucceeds(setDoc(doc(as('legacyInvite', 'gone22@fh.familyhub'), 'uidToFamily/legacyInvite'), { familyUid: 'victim' }, { merge: true })));
await check('existing joined member re-write keeps member', assertSucceeds(setDoc(doc(as('joined', 'm@gmail.com'), 'uidToFamily/joined'), { familyUid: 'victim' }, { merge: true })));
// codes issued by the family
const owner = as('victim', 'owner@gmail.com');
await check('owner issues a member code', assertSucceeds(setDoc(doc(owner, 'joinCodes/NEWC23'), { ownerUid: 'victim', memberName: 'dad' })));
await check('owner issues a family code at signup (no family doc yet)', assertSucceeds(setDoc(doc(as('brandnew', 'n@gmail.com'), 'joinCodes/NEWF23'), { ownerUid: 'brandnew' })));
await check('joined member issues a code for their family', assertSucceeds(setDoc(doc(as('joined', 'm@gmail.com'), 'joinCodes/NEWC24'), { ownerUid: 'victim', memberName: 'x' })));
await check('owner cannot issue a code for another family', assertFails(setDoc(doc(owner, 'joinCodes/NEWC25'), { ownerUid: 'other' })));
await check('code collision cannot take over another family\'s code', assertFails(setDoc(doc(owner, 'joinCodes/OTHER2'), { ownerUid: 'victim' })));
await check('owner deletes own code', assertSucceeds(deleteDoc(doc(owner, 'joinCodes/NEWC23'))));
// unchanged areas
await check('owner reads own family', assertSucceeds(getDoc(doc(owner, 'families/victim'))));
await check('connector tokens stay locked', assertFails(getDoc(doc(owner, 'mcpTokens/t'))));
await check('connector tokens cannot be forged', assertFails(setDoc(doc(owner, 'mcpTokens/forged'), { kind: 'access' })));
await check('community collections still open to signed-in users', assertSucceeds(addDoc(collection(owner, 'schoolClasses/c1/pendingEvents'), { title: 'x' })));
console.log(`\n${pass} passed, ${fail} failed`);
await env.cleanup(); process.exit(fail ? 1 : 0);
