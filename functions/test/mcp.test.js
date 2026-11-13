// Run with: npm test   (from functions/)
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const { createHandler, isAllowedRedirect, redirectMatches } = require('../mcp');
const { fakeFirestore, serve } = require('./helpers');

const CLAUDE_CB = 'https://claude.ai/api/mcp/auth_callback';
const ADMIN = 'adminUid';
const SCHOOL = { city: 'תל אביב', name: 'גורדון', grade: 'ג', classNum: '2' };
const CID = 'תל אביב~~גורדון~~ג~~2';

async function setup({ family } = {}) {
  const db = fakeFirestore();
  const clock = { t: Date.parse('2026-11-13T10:00:00Z') };
  const users = {}; // idToken -> decoded token
  await db.collection('families').doc('fam1').set(family || {
    familyName: 'כהן',
    members: [
      { name: 'דנה', role: 'parent' },
      { name: 'יוסי', role: 'parent', committeeClasses: [CID] },
      { name: 'נועה', role: 'kid', gender: 'girl', school: SCHOOL },
      { name: 'איתי', role: 'kid' },
    ],
  });
  const handler = createHandler({
    db, adminUid: ADMIN, now: () => clock.t,
    FieldValue: { serverTimestamp: () => 'SERVER_TS' },
    auth: { verifyIdToken: async (t) => { if (!users[t]) throw new Error('bad token'); return users[t]; } },
  });
  const srv = await serve(handler);
  const login = (idToken, decoded) => { users[idToken] = { auth_time: clock.t / 1000, firebase: { sign_in_provider: 'google.com' }, ...decoded }; };
  login('owner-token', { uid: 'fam1', email: 'dana@example.com' });

  const post = (path, body, headers = {}) => fetch(srv.url + path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  const form = (path, body) => fetch(srv.url + path, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(body) });

  // Full OAuth dance; returns the token response.
  async function connect({ idToken = 'owner-token', memberName = 'דנה', redirect = CLAUDE_CB } = {}) {
    const reg = await (await post('/register', { client_name: 'Claude', redirect_uris: [redirect] })).json();
    const verifier = crypto.randomBytes(32).toString('base64url');
    const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
    const approve = await post('/authorize/approve', { idToken, memberName, client_id: reg.client_id, redirect_uri: redirect, state: 'st8', code_challenge: challenge });
    if (!approve.ok) return { approve, status: approve.status, error: (await approve.json()).error };
    const back = new URL((await approve.json()).redirect);
    const tok = await form('/token', { grant_type: 'authorization_code', code: back.searchParams.get('code'), code_verifier: verifier, client_id: reg.client_id, redirect_uri: redirect });
    return { ...(await tok.json()), client_id: reg.client_id, back, verifier, code: back.searchParams.get('code') };
  }
  let rpcId = 0;
  async function rpc(token, method, params) {
    const r = await post('/mcp', { jsonrpc: '2.0', id: ++rpcId, method, params }, token ? { Authorization: 'Bearer ' + token } : {});
    return { status: r.status, headers: r.headers, body: r.status === 202 ? null : await r.json() };
  }
  async function call(token, name, args) {
    const r = await rpc(token, 'tools/call', { name, arguments: args });
    const result = r.body.result;
    return { isError: !!result.isError, text: result.content[0].text, data: result.isError ? null : JSON.parse(result.content[0].text) };
  }
  return { db, clock, srv, login, post, form, connect, rpc, call };
}

test('redirect allowlist: only Claude callbacks and loopback', () => {
  assert.ok(isAllowedRedirect(CLAUDE_CB));
  assert.ok(isAllowedRedirect('https://claude.com/api/mcp/auth_callback'));
  assert.ok(isAllowedRedirect('http://localhost:3118/callback'));
  assert.ok(isAllowedRedirect('http://127.0.0.1/callback'));
  assert.ok(!isAllowedRedirect('https://evil.example/cb'));
  assert.ok(!isAllowedRedirect('https://claude.ai.evil.example/api/mcp/auth_callback'));
  assert.ok(!isAllowedRedirect('https://claude.ai/api/mcp/auth_callback/../x'));
  assert.ok(!isAllowedRedirect('https://localhost/callback'));
  assert.ok(!isAllowedRedirect('http://localhost.evil.example/callback'));
  assert.ok(redirectMatches('http://localhost/callback', 'http://localhost:51234/callback'));
  assert.ok(!redirectMatches('http://localhost/callback', 'http://localhost:51234/other'));
  assert.ok(!redirectMatches(CLAUDE_CB, CLAUDE_CB + '?x=1'));
});

test('discovery: 401 points at metadata, metadata is consistent', async (t) => {
  const s = await setup(); t.after(s.srv.close);
  const r = await s.rpc(null, 'initialize', {});
  assert.equal(r.status, 401);
  const m = /resource_metadata="([^"]+)"/.exec(r.headers.get('www-authenticate'));
  assert.ok(m, 'WWW-Authenticate carries resource_metadata');
  const prmPath = new URL(m[1]).pathname;
  const prm = await (await fetch(s.srv.url + prmPath)).json();
  assert.equal(prm.resource, 'https://familyhub-7fdd5.firebaseapp.com/mcp');
  assert.deepEqual(prm.authorization_servers, ['https://familyhub-7fdd5.firebaseapp.com']);
  const as = await (await fetch(s.srv.url + '/.well-known/oauth-authorization-server')).json();
  assert.equal(as.issuer, prm.authorization_servers[0]);
  assert.deepEqual(as.code_challenge_methods_supported, ['S256']);
  assert.ok(as.token_endpoint_auth_methods_supported.includes('none'));
  for (const k of ['authorization_endpoint', 'token_endpoint', 'registration_endpoint']) assert.ok(as[k].startsWith(as.issuer + '/'));
  // Asking on the other hosting domain answers with that domain, so `resource` matches the URL the user typed.
  const alt = await (await fetch(s.srv.url + prmPath, { headers: { 'X-Forwarded-Host': 'familyhub-7fdd5.web.app' } })).json();
  assert.equal(alt.resource, 'https://familyhub-7fdd5.web.app/mcp');
  const spoof = await (await fetch(s.srv.url + prmPath, { headers: { 'X-Forwarded-Host': 'evil.example' } })).json();
  assert.equal(spoof.resource, 'https://familyhub-7fdd5.firebaseapp.com/mcp');
});

test('register refuses foreign redirect URIs', async (t) => {
  const s = await setup(); t.after(s.srv.close);
  const bad = await s.post('/register', { redirect_uris: ['https://evil.example/cb'] });
  assert.equal(bad.status, 400);
  const mixed = await s.post('/register', { redirect_uris: [CLAUDE_CB, 'https://evil.example/cb'] });
  assert.equal(mixed.status, 400);
  const ok = await s.post('/register', { client_name: 'Claude', redirect_uris: [CLAUDE_CB] });
  assert.equal(ok.status, 201);
  assert.equal((await ok.json()).token_endpoint_auth_method, 'none');
});

test('authorize page: validates client, redirect and PKCE before rendering', async (t) => {
  const s = await setup(); t.after(s.srv.close);
  const reg = await (await s.post('/register', { client_name: '<b>Claude</b>', redirect_uris: [CLAUDE_CB] })).json();
  const q = (o) => s.srv.url + '/authorize?' + new URLSearchParams(o);
  const good = { client_id: reg.client_id, redirect_uri: CLAUDE_CB, response_type: 'code', code_challenge: 'a'.repeat(43), code_challenge_method: 'S256', state: '</script><script>alert(1)</script>' };

  const unknown = await fetch(q({ ...good, client_id: 'c_doesnotexist123' }), { redirect: 'manual' });
  assert.equal(unknown.status, 400);
  const wrongRedirect = await fetch(q({ ...good, redirect_uri: 'https://evil.example/cb' }), { redirect: 'manual' });
  assert.equal(wrongRedirect.status, 400, 'never redirects to an unregistered URI');
  assert.equal(wrongRedirect.headers.get('location'), null);

  const noPkce = await fetch(q({ ...good, code_challenge_method: 'plain' }), { redirect: 'manual' });
  assert.equal(noPkce.status, 302);
  assert.equal(new URL(noPkce.headers.get('location')).searchParams.get('error'), 'invalid_request');

  const page = await fetch(q(good));
  assert.equal(page.status, 200);
  assert.equal(page.headers.get('x-frame-options'), 'DENY');
  const htmlText = await page.text();
  assert.ok(!htmlText.includes('<script>alert(1)'), 'state is escaped inside the script block');
  assert.ok(!htmlText.includes('<b>Claude</b>'), 'client name is escaped');
  assert.ok(htmlText.includes('claude.ai'));
});

test('identity: owner picks a parent; joined member is fixed; kids and strangers are refused', async (t) => {
  const s = await setup(); t.after(s.srv.close);
  const owner = await (await s.post('/authorize/identity', { idToken: 'owner-token' })).json();
  assert.deepEqual(owner, { email: 'dana@example.com', familyName: 'כהן', memberName: null, parents: ['דנה', 'יוסי'] });

  await s.db.collection('uidToFamily').doc('u-yossi').set({ familyUid: 'fam1', memberName: 'יוסי' });
  s.login('yossi-token', { uid: 'u-yossi', email: 'yossi@example.com' });
  const joined = await (await s.post('/authorize/identity', { idToken: 'yossi-token' })).json();
  assert.equal(joined.memberName, 'יוסי');
  assert.deepEqual(joined.parents, []);
  // A fixed member can't approve as someone else.
  const t2 = await s.connect({ idToken: 'yossi-token', memberName: 'דנה' });
  const ctx = await s.call(t2.access_token, 'get_family_context', {});
  assert.equal(ctx.data.connected_as, 'יוסי');

  // Kid's personal join code: member named on the invite account profile.
  await s.db.collection('uidToFamily').doc('u-kid').set({ familyUid: 'fam1' });
  s.login('kid-token', { uid: 'u-kid', email: 'abc234@fh.familyhub', name: 'fam1|נועה', firebase: { sign_in_provider: 'password' } });
  const kid = await s.post('/authorize/identity', { idToken: 'kid-token' });
  assert.equal(kid.status, 403);
  assert.equal((await kid.json()).error, 'parents_only');
  assert.equal((await s.connect({ idToken: 'kid-token', memberName: 'דנה' })).error, 'parents_only');

  // Same, resolved through the joinCodes collection.
  await s.db.collection('uidToFamily').doc('u-kid2').set({ familyUid: 'fam1' });
  await s.db.collection('joinCodes').doc('XYZ789').set({ ownerUid: 'fam1', memberName: 'איתי' });
  s.login('kid2-token', { uid: 'u-kid2', email: 'xyz789@fh.familyhub' });
  assert.equal((await s.post('/authorize/identity', { idToken: 'kid2-token' })).status, 403);

  s.login('stranger-token', { uid: 'nobody', email: 'x@example.com' });
  const stranger = await s.post('/authorize/identity', { idToken: 'stranger-token' });
  assert.equal((await stranger.json()).error, 'no_family');

  s.login('anon-token', { uid: 'fam1', firebase: { sign_in_provider: 'anonymous' } });
  assert.equal((await s.post('/authorize/identity', { idToken: 'anon-token' })).status, 401);
  assert.equal((await s.post('/authorize/identity', { idToken: 'forged' })).status, 401);
});

test('approve: needs a fresh sign-in and a real parent', async (t) => {
  const s = await setup(); t.after(s.srv.close);
  assert.equal((await s.connect({ memberName: 'נועה' })).error, 'pick_member');
  assert.equal((await s.connect({ memberName: null })).error, 'pick_member');
  s.clock.t += 16 * 60 * 1000;
  assert.equal((await s.connect()).error, 'login_required');
});

test('token: PKCE, single-use codes, expiry, refresh rotation, revoke', async (t) => {
  const s = await setup(); t.after(s.srv.close);
  const tok = await s.connect();
  assert.equal(tok.token_type, 'Bearer');
  assert.equal(tok.back.searchParams.get('state'), 'st8');
  assert.equal(tok.back.origin + tok.back.pathname, CLAUDE_CB);
  assert.equal((await s.rpc(tok.access_token, 'ping')).status, 200);
  // Tokens are stored hashed.
  assert.ok(![...s.db.store.keys()].some(k => k.includes(tok.access_token) || k.includes(tok.refresh_token)));

  // Code replay
  const replay = await s.form('/token', { grant_type: 'authorization_code', code: tok.code, code_verifier: tok.verifier, client_id: tok.client_id, redirect_uri: CLAUDE_CB });
  assert.equal(replay.status, 400);
  assert.equal((await replay.json()).error, 'invalid_grant');

  // Wrong verifier
  const reg = await (await s.post('/register', { redirect_uris: [CLAUDE_CB] })).json();
  const challenge = crypto.createHash('sha256').update('right-verifier-right-verifier-right-verifier').digest('base64url');
  const ap = await (await s.post('/authorize/approve', { idToken: 'owner-token', memberName: 'דנה', client_id: reg.client_id, redirect_uri: CLAUDE_CB, code_challenge: challenge })).json();
  const code = new URL(ap.redirect).searchParams.get('code');
  const wrong = await s.form('/token', { grant_type: 'authorization_code', code, code_verifier: 'wrong-verifier', client_id: reg.client_id, redirect_uri: CLAUDE_CB });
  assert.equal((await wrong.json()).error, 'invalid_grant');

  // A code issued to one client can't be redeemed by another
  const ap2 = await (await s.post('/authorize/approve', { idToken: 'owner-token', memberName: 'דנה', client_id: reg.client_id, redirect_uri: CLAUDE_CB, code_challenge: challenge })).json();
  const other = await s.form('/token', { grant_type: 'authorization_code', code: new URL(ap2.redirect).searchParams.get('code'), code_verifier: 'right-verifier-right-verifier-right-verifier', client_id: tok.client_id, redirect_uri: CLAUDE_CB });
  assert.equal((await other.json()).error, 'invalid_grant');

  // Refresh rotates; the access token can't be used as a refresh token
  const notRefresh = await s.form('/token', { grant_type: 'refresh_token', refresh_token: tok.access_token, client_id: tok.client_id });
  assert.equal((await notRefresh.json()).error, 'invalid_grant');
  const r1 = await (await s.form('/token', { grant_type: 'refresh_token', refresh_token: tok.refresh_token, client_id: tok.client_id })).json();
  assert.ok(r1.access_token && r1.refresh_token && r1.refresh_token !== tok.refresh_token);
  assert.equal((await s.rpc(r1.access_token, 'ping')).status, 200);
  s.clock.t += 2 * 60 * 1000; // past the retry grace
  const old = await s.form('/token', { grant_type: 'refresh_token', refresh_token: tok.refresh_token, client_id: tok.client_id });
  assert.equal(old.status, 400);
  assert.equal((await old.json()).error, 'invalid_grant');

  // Access token expiry
  s.clock.t += 61 * 60 * 1000;
  assert.equal((await s.rpc(r1.access_token, 'ping')).status, 401);
  const r2 = await (await s.form('/token', { grant_type: 'refresh_token', refresh_token: r1.refresh_token, client_id: tok.client_id })).json();
  assert.equal((await s.rpc(r2.access_token, 'ping')).status, 200);

  // Revoke ends the whole connection
  assert.equal((await s.form('/revoke', { token: r2.refresh_token })).status, 200);
  assert.equal((await s.rpc(r2.access_token, 'ping')).status, 401);
  const dead = await s.form('/token', { grant_type: 'refresh_token', refresh_token: r2.refresh_token, client_id: tok.client_id });
  assert.equal((await dead.json()).error, 'invalid_grant');
});

test('mcp protocol: initialize, notifications, tools/list, unknown method, GET', async (t) => {
  const s = await setup(); t.after(s.srv.close);
  const { access_token } = await s.connect();
  const init = await s.rpc(access_token, 'initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 't', version: '1' } });
  assert.equal(init.body.result.protocolVersion, '2025-06-18');
  assert.ok(init.body.result.capabilities.tools);
  const future = await s.rpc(access_token, 'initialize', { protocolVersion: '2099-01-01' });
  assert.equal(future.body.result.protocolVersion, '2025-11-25');
  const note = await s.post('/mcp', { jsonrpc: '2.0', method: 'notifications/initialized' }, { Authorization: 'Bearer ' + access_token });
  assert.equal(note.status, 202);
  const list = await s.rpc(access_token, 'tools/list');
  assert.deepEqual(list.body.result.tools.map(x => x.name), ['get_family_context', 'create_recipe', 'create_community_event']);
  assert.equal((await s.rpc(access_token, 'resources/list')).body.error.code, -32601);
  const get = await fetch(s.srv.url + '/mcp', { headers: { Authorization: 'Bearer ' + access_token } });
  assert.equal(get.status, 405);
});

test('create_recipe writes the same document shape the app does', async (t) => {
  const s = await setup(); t.after(s.srv.close);
  const { access_token } = await s.connect();
  const r = await s.call(access_token, 'create_recipe', {
    name: ' עוגת שוקולד ', servings: 8, source_url: 'https://www.facebook.com/some/post',
    ingredients: [{ name: 'קמח', amount: '2 כוסות' }, { name: 'ביצים' }, { name: '  ' }],
    steps: ['לערבב', 'לאפות 40 דקות'],
  });
  assert.equal(r.isError, false);
  assert.equal(r.data.status, 'created');
  const doc = s.db.store.get('families/fam1/lists/' + r.data.recipe_id);
  assert.equal(doc.type, 'recipe');
  assert.equal(doc.name, 'עוגת שוקולד');
  assert.deepEqual(doc.meta, { servings: 8, sourceUrl: 'https://www.facebook.com/some/post' });
  assert.equal(doc.sharedWith, 'all');
  assert.equal(doc.canEdit, 'all');
  assert.equal(doc.createdBy, 'דנה');
  assert.equal(doc.createdAt, 'SERVER_TS');
  assert.deepEqual(doc.items.map(i => [i.name, i.amount, i.done]), [['קמח', '2 כוסות', false], ['ביצים', undefined, false]]);
  assert.deepEqual(doc.steps.map(x => [x.text, x.done]), [['לערבב', false], ['לאפות 40 דקות', false]]);
  assert.equal(new Set([...doc.items, ...doc.steps].map(x => x.id)).size, 4);

  const priv = await s.call(access_token, 'create_recipe', { name: 'סודי', steps: ['x'], visibility: 'private' });
  assert.deepEqual(s.db.store.get('families/fam1/lists/' + priv.data.recipe_id).sharedWith, ['דנה']);

  assert.ok((await s.call(access_token, 'create_recipe', { name: 'ריק' })).isError);
  assert.ok((await s.call(access_token, 'create_recipe', { steps: ['x'] })).isError);
  assert.ok((await s.call(access_token, 'create_recipe', { name: 'x', steps: ['x'], source_url: 'javascript:alert(1)' })).isError);
});

test('create_community_event: regular parent goes to pending, committee publishes', async (t) => {
  const s = await setup(); t.after(s.srv.close);
  const dana = (await s.connect({ memberName: 'דנה' })).access_token;
  const yossi = (await s.connect({ memberName: 'יוסי' })).access_token;

  const ctx = await s.call(dana, 'get_family_context', {});
  assert.equal(ctx.data.today, '2026-11-13');
  assert.deepEqual(ctx.data.kids.map(k => [k.name, k.in_class]), [['נועה', true], ['איתי', false]]);
  assert.match(ctx.data.kids[0].community_events, /approval/);
  assert.match((await s.call(yossi, 'get_family_context', {})).data.kids[0].community_events, /immediately/);
  assert.deepEqual(ctx.data.event_types.find(e => e.id === 'trip').required, ['date']);

  const ev = { title: 'טיול שנתי', type: 'trip', date: '2026-12-01', time: '08:00', note: 'להביא כובע ומים' };
  const pending = await s.call(dana, 'create_community_event', ev);
  assert.equal(pending.data.status, 'pending_approval');
  const pdoc = s.db.store.get(`schoolClasses/${CID}/pendingEvents/${pending.data.event_id}`);
  assert.equal(pdoc.status, 'pending');
  assert.deepEqual(pdoc.postedBy, { familyUid: 'fam1', firstName: 'דנה', familyName: 'כהן' });
  assert.equal(pdoc.scope, 'class');
  assert.equal(pdoc.genderFilter, 'all');
  assert.equal(pdoc.time, '08:00');
  assert.ok(!('location' in pdoc));

  const pub = await s.call(yossi, 'create_community_event', { ...ev, kid_name: 'נועה' });
  assert.equal(pub.data.status, 'published');
  const edoc = s.db.store.get(`schoolClasses/${CID}/events/${pub.data.event_id}`);
  assert.equal(edoc.title, 'טיול שנתי');
  assert.ok(!('status' in edoc));

  const grade = await s.call(yossi, 'create_community_event', { ...ev, scope: 'grade' });
  assert.ok(s.db.store.has(`schoolGrades/תל אביב~~גורדון~~ג/events/${grade.data.event_id}`));
  const school = await s.call(yossi, 'create_community_event', { ...ev, scope: 'school', rsvp: false });
  assert.equal(s.db.store.get(`schools/תל אביב~~גורדון/events/${school.data.event_id}`).rsvp, false);
  assert.match((await s.call(dana, 'create_community_event', { ...ev, scope: 'grade' })).text, /committee/);

  // Validation mirrors the app's form
  const bad = async (args, re) => { const r = await s.call(dana, 'create_community_event', args); assert.ok(r.isError, JSON.stringify(args)); assert.match(r.text, re); };
  await bad({ title: 'יום הולדת', type: 'birthday', date: '2026-12-01' }, /time, location/);
  await bad({ ...ev, date: '2026-02-30' }, /real date/);
  await bad({ ...ev, date: '2025-12-01' }, /past/);
  await bad({ ...ev, time: '8am' }, /HH:MM/);
  await bad({ ...ev, type: 'nope' }, /Unknown event type/);
  await bad({ ...ev, kid_name: 'איתי' }, /No kid named/);
  await bad({ ...ev, gender_filter: 'boys' }, /gender_filter/);
  await bad({ ...ev, paybox_url: 'javascript:1' }, /http/);
  await bad({ date: '2026-12-01' }, /title/);
  const before = s.db.store.size;
  await bad({ ...ev, date: 'soon' }, /real date/);
  assert.equal(s.db.store.size, before, 'a rejected call writes nothing');
});

test('committee rules follow the app: admin, family-level role, legacy fallback', async (t) => {
  const members = [{ name: 'אבא', role: 'parent' }, { name: 'ילד', role: 'kid', school: SCHOOL }];
  const ev = { title: 'x', date: '2026-12-01' };
  const run = async (family, extra = {}) => {
    const s = await setup({ family }); t.after(s.srv.close);
    if (extra.joined) {
      await s.db.collection('uidToFamily').doc('u2').set({ familyUid: 'fam1', memberName: 'אבא' });
      s.login('j', { uid: 'u2', email: 'j@example.com' });
    }
    const tok = await s.connect({ idToken: extra.joined ? 'j' : 'owner-token', memberName: 'אבא' });
    return (await s.call(tok.access_token, 'create_community_event', ev)).data.status;
  };
  assert.equal(await run({ familyName: 'א', members }), 'pending_approval');
  assert.equal(await run({ familyName: 'א', members, role: 'committee' }), 'published');
  assert.equal(await run({ familyName: 'א', members, role: 'committee' }, { joined: true }), 'pending_approval');
  assert.equal(await run({ familyName: 'א', members, committeeClasses: [CID] }), 'published');
  assert.equal(await run({ familyName: 'א', members, committeeClasses: [CID] }, { joined: true }), 'pending_approval');
  assert.equal(await run({ familyName: 'א', members: [{ ...members[0], committeeClasses: ['*'] }, members[1]] }, { joined: true }), 'published');
  assert.equal(await run({ familyName: 'א', committeeClasses: [CID], members: [{ ...members[0], committeeClasses: [] }, members[1]] }), 'pending_approval');
});

test('several kids: kid_name is required; removed members lose access at once', async (t) => {
  const s = await setup({ family: { familyName: 'לוי', members: [
    { name: 'אמא', role: 'parent' },
    { name: 'א', role: 'kid', school: SCHOOL },
    { name: 'ב', role: 'kid', school: { ...SCHOOL, grade: 'ה' } },
  ] } });
  t.after(s.srv.close);
  const { access_token } = await s.connect({ memberName: 'אמא' });
  const r = await s.call(access_token, 'create_community_event', { title: 'x' });
  assert.ok(r.isError);
  assert.match(r.text, /kid_name is required/);
  const ok = await s.call(access_token, 'create_community_event', { title: 'x', kid_name: 'ב' });
  assert.ok(s.db.store.has(`schoolClasses/תל אביב~~גורדון~~ה~~2/pendingEvents/${ok.data.event_id}`));

  await s.db.collection('families').doc('fam1').update({ members: [{ name: 'אמא', role: 'kid' }] });
  assert.match((await s.call(access_token, 'create_recipe', { name: 'x', steps: ['y'] })).text, /no longer a parent/);
  await s.db.collection('families').doc('fam1').delete();
  assert.match((await s.call(access_token, 'get_family_context', {})).text, /no longer exists/);
});

test('expired registrations, codes and tokens are cleaned up', async (t) => {
  const s = await setup(); t.after(s.srv.close);
  await s.connect();
  await s.post('/register', { redirect_uris: [CLAUDE_CB] }); // never used
  s.clock.t += 80 * 24 * 3600 * 1000;
  await s.post('/register', { redirect_uris: [CLAUDE_CB] });
  const left = [...s.db.store.keys()].filter(k => k.startsWith('mcp'));
  assert.equal(left.length, 1, 'only the newest registration remains: ' + left.join(', '));
});
