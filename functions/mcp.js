// Claude connector: an MCP server (Streamable HTTP, stateless) plus the small OAuth 2.1
// authorization server that protects it. Served through Firebase Hosting rewrites so that the
// OAuth discovery documents live at the root of the domain, where MCP clients look for them.
//
//   /mcp                                      MCP endpoint (JSON-RPC over POST, Bearer token)
//   /.well-known/oauth-protected-resource     RFC 9728 metadata
//   /.well-known/oauth-authorization-server   RFC 8414 metadata
//   /register                                 RFC 7591 dynamic client registration
//   /authorize                                parks the request and sends the browser to the app
//   /authorize/request|approve|deny           called by the app's "Connected apps" screen, which
//   /authorize/connections|disconnect         shows the request, and lists / ends connections
//   /token                                    code exchange + refresh (PKCE S256, public clients)
//   /revoke                                   RFC 7009
//
// There is no separate sign-in: the person approves the connection inside the app, in the
// session they are already signed in to, and the app proves who they are with its Firebase ID
// token. Everything a tool writes is attributed to that parent, in their family, and follows
// the same rules the app applies to them.
'use strict';

const crypto = require('crypto');
const { renderErrorPage } = require('./mcp-error-page');

const DEFAULT_BASE  = 'https://familyhub-7fdd5.firebaseapp.com';
const ALLOWED_HOSTS = ['familyhub-7fdd5.firebaseapp.com', 'familyhub-7fdd5.web.app'];
const APP_URL       = 'https://zcochavi.github.io/home-management/';
const JOIN_DOMAIN   = 'fh.familyhub';

// Only Claude may be an OAuth client: registering any other redirect target is refused, so a
// consent given on our page can never deliver a code to somebody else's site. Loopback
// addresses (any port) are what Claude Code and local MCP tools use.
const ALLOWED_REDIRECTS = [
  'https://claude.ai/api/mcp/auth_callback',
  'https://claude.com/api/mcp/auth_callback',
];

const SCOPE            = 'family';
const CODE_TTL_MS      = 5 * 60 * 1000;
const ACCESS_TTL_MS    = 60 * 60 * 1000;
const REFRESH_TTL_MS   = 60 * 24 * 3600 * 1000;
const REFRESH_GRACE_MS = 60 * 1000;            // a rotated refresh token still works this long (client retries)
const CLIENT_IDLE_MS   = REFRESH_TTL_MS + 7 * 24 * 3600 * 1000;
const NEW_CLIENT_MS    = 24 * 3600 * 1000;     // a registration nobody finishes signing in with
const REQUEST_TTL_MS   = 15 * 60 * 1000;       // time to approve a connection request in the app

const PROTOCOL_VERSIONS = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05'];

const DEFAULT_EVENT_TYPES = [
  { id: 'birthday',     labelHe: 'יום הולדת',   labelEn: 'Birthday',     mDate: true,  mTime: true,  mLoc: true,  hasGenderFilter: true  },
  { id: 'trip',         labelHe: 'טיול',         labelEn: 'Trip',         mDate: true,  mTime: false, mLoc: false, hasGenderFilter: false },
  { id: 'party',        labelHe: 'מסיבה',        labelEn: 'Party',        mDate: true,  mTime: true,  mLoc: true,  hasGenderFilter: false },
  { id: 'announcement', labelHe: 'הודעה',        labelEn: 'Announcement', mDate: false, mTime: false, mLoc: false, hasGenderFilter: false },
  { id: 'other',        labelHe: 'אחר',          labelEn: 'Other',        mDate: false, mTime: false, mLoc: false, hasGenderFilter: false },
  { id: 'classEvent',   labelHe: 'אירוע כיתתי', labelEn: 'Class event',  mDate: true,  mTime: true,  mLoc: true,  hasGenderFilter: false },
];

// ── Small helpers ─────────────────────────────────────────

const sha256hex   = s => crypto.createHash('sha256').update(s).digest('hex');
const randomToken = (bytes = 32) => crypto.randomBytes(bytes).toString('base64url');
const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

function isLoopback(u) {
  return u.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(u.hostname);
}

function isAllowedRedirect(uri) {
  if (typeof uri !== 'string' || uri.length > 300) return false;
  if (ALLOWED_REDIRECTS.includes(uri)) return true;
  try { const u = new URL(uri); return isLoopback(u) && !u.hash; } catch (_) { return false; }
}

// Exact match, except that a loopback redirect may use any port (the client picks a free one).
function redirectMatches(registered, requested) {
  if (registered === requested) return true;
  try {
    const a = new URL(registered), b = new URL(requested);
    return isLoopback(a) && isLoopback(b) && a.hostname === b.hostname &&
           a.pathname === b.pathname && a.search === b.search;
  } catch (_) { return false; }
}

// Same ids the app builds in classIdFor / gradeIdFor / schoolIdFor.
const _n = s => (s || '').trim().replace(/\s+/g, ' ').replace(/\//g, '-').replace(/~/g, '');
function classIdFor(school) {
  if (!school?.city?.trim() || !school?.grade) return null;
  return [_n(school.city), _n(school.name || ''), school.grade, _n(school.classNum || '')].join('~~');
}
function gradeIdFor(school) {
  if (!school?.city?.trim() || !school?.grade) return null;
  return [_n(school.city), _n(school.name || ''), school.grade].join('~~');
}
function schoolIdFor(school) {
  if (!school?.city?.trim() || !school?.name?.trim()) return null;
  return [_n(school.city), _n(school.name)].join('~~');
}
function classLabel(school) {
  const grade = school.grade ? 'כיתה ' + school.grade + (school.classNum ? "'" + school.classNum : '') : '';
  return [school.name || school.city, grade].filter(Boolean).join(' · ');
}

function todayInIsrael(nowMs) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(nowMs));
}
function isRealDate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + 'T00:00:00Z');
  return !isNaN(d) && d.toISOString().slice(0, 10) === s;
}
const isHttpUrl = s => { try { return ['http:', 'https:'].includes(new URL(s).protocol); } catch (_) { return false; } };

// A problem the person (or Claude) can fix — reported as a tool error, not a server fault.
class ToolError extends Error {}

// ── Tool definitions ──────────────────────────────────────

const TOOLS = [
  {
    name: 'get_family_context',
    title: 'Get family context',
    description:
      "Returns who is connected (parent and family name), the family's kids with their school class, " +
      'whether this parent publishes community events directly or needs committee approval, the ' +
      "available community event types with their required fields, and today's date in Israel. " +
      'Call this before create_community_event to pick the right kid and event type.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: 'create_recipe',
    title: 'Create recipe',
    description:
      "Adds a new recipe to the family's lists in FamilyHub. Write the recipe in the language of the " +
      'source (usually Hebrew). Each ingredient is a separate item with an optional amount; each ' +
      'preparation step is a separate entry, in order. Show the user what will be saved before calling.',
    inputSchema: {
      type: 'object',
      properties: {
        name:        { type: 'string', description: 'Recipe name, e.g. "עוגת שוקולד".' },
        ingredients: {
          type: 'array',
          description: 'Ingredients, in the order they appear.',
          items: {
            type: 'object',
            properties: {
              name:   { type: 'string', description: 'Ingredient, without the amount, e.g. "קמח".' },
              amount: { type: 'string', description: 'Free-text amount, e.g. "2 כוסות" or "200 גרם".' },
            },
            required: ['name'],
            additionalProperties: false,
          },
        },
        steps:      { type: 'array', items: { type: 'string' }, description: 'Preparation steps, one per entry, in order. No numbering.' },
        servings:   { type: 'integer', minimum: 1, description: 'Number of servings, if the source says.' },
        source_url: { type: 'string', description: 'Link to the original post or page, if there is one.' },
        visibility: { type: 'string', enum: ['family', 'private'], description: 'Who sees the recipe. Default "family".' },
      },
      required: ['name'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  },
  {
    name: 'create_community_event',
    title: 'Create community event',
    description:
      "Posts an event to the school community of one of the family's kids (class by default), for " +
      'example from a message a teacher sent. Other parents are notified, so confirm the details with ' +
      'the user before calling. Committee members publish immediately; other parents submit the event ' +
      'for committee approval. Call get_family_context first for kid names, event types and required fields.',
    inputSchema: {
      type: 'object',
      properties: {
        kid_name: { type: 'string', description: "The kid whose class the event is for. Required when the family has more than one kid in a class." },
        title:    { type: 'string', description: 'Short event title.' },
        type:     { type: 'string', description: 'Event type id from get_family_context. Default "other".' },
        date:     { type: 'string', description: 'Event date, YYYY-MM-DD.' },
        time:     { type: 'string', description: 'Start time, 24-hour HH:MM.' },
        location: { type: 'string' },
        note:     { type: 'string', description: 'Details for parents: what to bring, cost, and so on.' },
        scope:    { type: 'string', enum: ['class', 'grade', 'school'], description: 'Audience. Default "class". "grade" and "school" are for committee members only.' },
        gender_filter: { type: 'string', enum: ['all', 'boys', 'girls'], description: 'Only for event types that support it (such as birthday). Default "all".' },
        paybox_url:    { type: 'string', description: 'Payment link, if any.' },
        rsvp:          { type: 'boolean', description: 'Whether parents can answer attending or not. Default true.' },
      },
      required: ['title'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },
];

// ── Handler factory ───────────────────────────────────────

function createHandler({ db, auth, FieldValue, adminUid, baseUrl: fixedBase, now = () => Date.now() }) {
  const clients = db.collection('mcpClients');
  const codes   = db.collection('mcpAuthCodes');
  const tokens  = db.collection('mcpTokens');

  function baseUrlOf(req) {
    if (fixedBase) return fixedBase;
    const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim().toLowerCase();
    return ALLOWED_HOSTS.includes(host) ? 'https://' + host : DEFAULT_BASE;
  }

  // ── Who is this? ────────────────────────────────────────
  // Maps a signed-in Firebase user to { familyUid, isOwner, memberName? }. The family owner's
  // account is shared by whoever uses that device, so the member is picked on the consent page;
  // an account that joined as a specific member is always that member.
  async function resolveAccount(decoded) {
    const uid = decoded.uid;
    const own = await db.collection('families').doc(uid).get();
    if (own.exists) return { familyUid: uid, isOwner: true, family: own.data(), lockedMember: null };

    const mapped = await db.collection('uidToFamily').doc(uid).get();
    const familyUid = mapped.exists ? mapped.data().familyUid : null;
    if (!familyUid) return null;
    const fam = await db.collection('families').doc(familyUid).get();
    if (!fam.exists) return null;

    let lockedMember = mapped.data().memberName || null;
    const email = String(decoded.email || '');
    if (email.endsWith('@' + JOIN_DOMAIN)) {
      // A join code's shared account. Which member it stands for comes only from the code's own
      // record — the account's profile and mapping can be edited by whoever holds the code.
      const code = email.slice(0, -JOIN_DOMAIN.length - 1).toUpperCase();
      const jc = await db.collection('joinCodes').doc(code).get();
      if (!jc.exists || jc.data().ownerUid !== familyUid) return null;
      lockedMember = jc.data().memberName || null;
    }
    return { familyUid, isOwner: false, family: fam.data(), lockedMember };
  }

  const parentsOf = fam => (fam.members || []).filter(m => m.role === 'parent').map(m => m.name);

  async function verifyLogin(idToken) {
    if (typeof idToken !== 'string' || !idToken) throw new HttpError(401, 'login_required');
    let decoded;
    try { decoded = await auth.verifyIdToken(idToken); }
    catch (_) { throw new HttpError(401, 'login_required'); }
    if (decoded.firebase?.sign_in_provider === 'anonymous') throw new HttpError(401, 'login_required');
    return decoded;
  }

  async function describeAccount(decoded) {
    const acct = await resolveAccount(decoded);
    if (!acct) throw new HttpError(403, 'no_family');
    const members = acct.family.members || [];
    if (acct.lockedMember) {
      const m = members.find(x => x.name === acct.lockedMember);
      if (m && m.role !== 'parent') throw new HttpError(403, 'parents_only');
      if (!m) acct.lockedMember = null;
    }
    const parents = parentsOf(acct.family);
    if (!parents.length) throw new HttpError(403, 'parents_only');
    return { acct, parents };
  }

  // ── OAuth: clients ──────────────────────────────────────

  async function getClient(clientId) {
    if (typeof clientId !== 'string' || !/^[A-Za-z0-9_-]{8,80}$/.test(clientId)) return null;
    const snap = await clients.doc(clientId).get();
    if (!snap.exists || snap.data().expiresAt < now()) return null;
    return { id: clientId, ...snap.data() };
  }

  async function handleRegister(req, res) {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const uris = body.redirect_uris;
    if (!Array.isArray(uris) || !uris.length || uris.length > 5 || !uris.every(isAllowedRedirect)) {
      return json(res, 400, { error: 'invalid_redirect_uri', error_description: 'Only Claude callback URLs and loopback addresses may be registered.' });
    }
    const clientId = 'c_' + randomToken(18);
    const clientName = str(body.client_name, 80) || 'MCP client';
    await clients.doc(clientId).set({ redirectUris: uris, clientName, createdAt: now(), expiresAt: now() + NEW_CLIENT_MS });
    await cleanupExpired();
    json(res, 201, {
      client_id: clientId,
      client_id_issued_at: Math.floor(now() / 1000),
      client_name: clientName,
      redirect_uris: uris,
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      token_endpoint_auth_method: 'none',
    });
  }

  // Expired registrations, codes and tokens are removed a few at a time whenever new ones are made.
  async function cleanupExpired() {
    try {
      for (const col of [clients, codes, tokens]) {
        const snap = await col.where('expiresAt', '<', now()).limit(20).get();
        await Promise.all(snap.docs.map(d => d.ref.delete()));
      }
    } catch (e) { console.warn('mcp cleanupExpired:', e.message); }
  }

  // ── OAuth: authorize ────────────────────────────────────

  // Claude sends the browser here. The request is checked, parked under a one-time id, and the
  // browser goes on to the app, which shows it on the "Connected apps" screen.
  async function handleAuthorize(req, res) {
    const q = req.query || {};
    const client = await getClient(q.client_id);
    const redirectUri = typeof q.redirect_uri === 'string' ? q.redirect_uri : '';
    // Without a known client and redirect there is nowhere safe to send an error — show it here.
    if (!client || !client.redirectUris.some(r => redirectMatches(r, redirectUri))) {
      return html(res, 400, renderErrorPage('הקישור לחיבור אינו תקין או שפג תוקפו. נסו לחבר שוב מתוך Claude.', APP_URL));
    }
    const state = typeof q.state === 'string' ? q.state.slice(0, 2000) : '';
    const fail = (error, description) => {
      const u = new URL(redirectUri);
      u.searchParams.set('error', error);
      u.searchParams.set('error_description', description);
      if (state) u.searchParams.set('state', state);
      res.redirect(302, u.toString());
    };
    if (q.response_type !== 'code') return fail('unsupported_response_type', 'Only response_type=code is supported.');
    if (q.code_challenge_method !== 'S256' || !/^[A-Za-z0-9_-]{43,128}$/.test(String(q.code_challenge || ''))) {
      return fail('invalid_request', 'PKCE with code_challenge_method=S256 is required.');
    }
    const requestId = randomToken(24);
    await codes.doc(requestKey(requestId)).set({
      kind: 'request', clientId: client.id, clientName: client.clientName, redirectUri, state,
      codeChallenge: q.code_challenge, issuer: baseUrlOf(req),
      createdAt: now(), expiresAt: now() + REQUEST_TTL_MS,
    });
    res.redirect(302, APP_URL + '?connect=' + requestId);
  }

  const requestKey = id => 'r_' + sha256hex(String(id));
  async function loadRequest(requestId) {
    if (typeof requestId !== 'string' || !/^[A-Za-z0-9_-]{20,64}$/.test(requestId)) throw new HttpError(404, 'request_expired');
    const ref = codes.doc(requestKey(requestId));
    const snap = await ref.get();
    if (!snap.exists || snap.data().kind !== 'request' || snap.data().expiresAt < now()) throw new HttpError(404, 'request_expired');
    return { ref, data: snap.data() };
  }

  // What the app shows before the person decides.
  async function handleRequestInfo(req, res) {
    const decoded = await verifyLogin(req.body?.idToken);
    await describeAccount(decoded);
    const { data } = await loadRequest(req.body?.requestId);
    json(res, 200, { app: data.clientName, returnsTo: new URL(data.redirectUri).host });
  }

  async function handleApprove(req, res) {
    const b = req.body || {};
    const decoded = await verifyLogin(b.idToken);
    const { acct, parents } = await describeAccount(decoded);
    const memberName = acct.lockedMember || b.memberName;
    if (!parents.includes(memberName)) throw new HttpError(403, 'parents_only');

    // One decision per request: it is removed in the same transaction that reads it.
    const { ref } = await loadRequest(b.requestId);
    const r = await db.runTransaction(async tx => {
      const snap = await tx.get(ref);
      if (!snap.exists) return null;
      tx.delete(ref);
      return snap.data();
    });
    if (!r || r.expiresAt < now()) throw new HttpError(404, 'request_expired');

    const code = randomToken(32);
    await codes.doc(sha256hex(code)).set({
      kind: 'code', clientId: r.clientId, clientName: r.clientName, redirectUri: r.redirectUri, codeChallenge: r.codeChallenge,
      uid: decoded.uid, familyUid: acct.familyUid, isOwner: acct.isOwner, memberName,
      createdAt: now(), expiresAt: now() + CODE_TTL_MS,
    });
    const u = new URL(r.redirectUri);
    u.searchParams.set('code', code);
    if (r.state) u.searchParams.set('state', r.state);
    u.searchParams.set('iss', r.issuer);
    json(res, 200, { redirect: u.toString() });
  }

  async function handleDeny(req, res) {
    const { ref, data } = await loadRequest(req.body?.requestId);
    await ref.delete();
    const u = new URL(data.redirectUri);
    u.searchParams.set('error', 'access_denied');
    u.searchParams.set('error_description', 'The user declined the connection.');
    if (data.state) u.searchParams.set('state', data.state);
    json(res, 200, { redirect: u.toString() });
  }

  // ── Connections (the app's "Connected apps" screen) ─────
  // A connection is one approved grant; its live refresh token stands for it.

  async function liveGrants(uid) {
    const snap = await tokens.where('uid', '==', uid).get();
    return snap.docs.map(d => d.data())
      .filter(t => t.kind === 'refresh' && t.expiresAt > now() + REFRESH_GRACE_MS);
  }

  async function handleConnections(req, res) {
    const decoded = await verifyLogin(req.body?.idToken);
    const grants = await liveGrants(decoded.uid);
    json(res, 200, {
      url: baseUrlOf(req) + '/mcp',
      connections: grants
        .map(g => ({ id: g.grantId, app: g.clientName || 'Claude', memberName: g.memberName, connectedAt: g.connectedAt || g.createdAt }))
        .sort((a, b) => b.connectedAt - a.connectedAt),
    });
  }

  async function handleDisconnect(req, res) {
    const decoded = await verifyLogin(req.body?.idToken);
    const grantId = req.body?.grantId;
    if (typeof grantId !== 'string' || !grantId) throw new HttpError(400, 'invalid_request');
    const all = await tokens.where('grantId', '==', grantId).get();
    await Promise.all(all.docs.filter(d => d.data().uid === decoded.uid).map(d => d.ref.delete()));
    json(res, 200, {});
  }

  // ── OAuth: tokens ───────────────────────────────────────

  async function issueTokens(grant) {
    const access = randomToken(32), refresh = randomToken(32);
    const base = {
      clientId: grant.clientId, uid: grant.uid, familyUid: grant.familyUid, isOwner: !!grant.isOwner,
      memberName: grant.memberName, grantId: grant.grantId, clientName: grant.clientName || '',
      connectedAt: grant.connectedAt, createdAt: now(),
    };
    await Promise.all([
      tokens.doc(sha256hex(access)).set({ ...base, kind: 'access', expiresAt: now() + ACCESS_TTL_MS }),
      tokens.doc(sha256hex(refresh)).set({ ...base, kind: 'refresh', expiresAt: now() + REFRESH_TTL_MS }),
      clients.doc(grant.clientId).update({ expiresAt: now() + CLIENT_IDLE_MS }),
    ]);
    return {
      access_token: access, token_type: 'Bearer', expires_in: Math.floor(ACCESS_TTL_MS / 1000),
      refresh_token: refresh, scope: SCOPE,
    };
  }

  async function handleToken(req, res) {
    const b = req.body && typeof req.body === 'object' ? req.body : {};
    const oauthErr = (error, description, status = 400) => json(res, status, { error, error_description: description });
    const client = await getClient(b.client_id);
    if (!client) return oauthErr('invalid_client', 'Unknown client_id.', 401);

    if (b.grant_type === 'authorization_code') {
      if (typeof b.code !== 'string' || typeof b.code_verifier !== 'string') return oauthErr('invalid_request', 'code and code_verifier are required.');
      const ref = codes.doc(sha256hex(b.code));
      // Single use: the code is deleted in the same transaction that reads it.
      const data = await db.runTransaction(async tx => {
        const snap = await tx.get(ref);
        if (!snap.exists) return null;
        tx.delete(ref);
        return snap.data();
      });
      const challenge = crypto.createHash('sha256').update(b.code_verifier).digest('base64url');
      if (!data || data.kind !== 'code' || data.expiresAt < now() || data.clientId !== client.id ||
          data.redirectUri !== b.redirect_uri || data.codeChallenge !== challenge) {
        return oauthErr('invalid_grant', 'The authorization code is invalid or expired.');
      }
      const out = await issueTokens({ ...data, grantId: randomToken(12), connectedAt: now() });
      await cleanupExpired();
      return json(res, 200, out);
    }

    if (b.grant_type === 'refresh_token') {
      if (typeof b.refresh_token !== 'string') return oauthErr('invalid_request', 'refresh_token is required.');
      const ref = tokens.doc(sha256hex(b.refresh_token));
      // Rotation: the presented token is retired (kept briefly so a retried request still works).
      const data = await db.runTransaction(async tx => {
        const snap = await tx.get(ref);
        if (!snap.exists) return null;
        const d = snap.data();
        if (d.kind !== 'refresh' || d.expiresAt < now() || d.clientId !== client.id) return null;
        tx.update(ref, { expiresAt: Math.min(d.expiresAt, now() + REFRESH_GRACE_MS) });
        return d;
      });
      if (!data) return oauthErr('invalid_grant', 'The refresh token is invalid or expired.');
      return json(res, 200, await issueTokens(data));
    }

    oauthErr('unsupported_grant_type', 'Use authorization_code or refresh_token.');
  }

  async function handleRevoke(req, res) {
    const token = req.body?.token;
    if (typeof token === 'string' && token) {
      const snap = await tokens.doc(sha256hex(token)).get();
      if (snap.exists) {
        // Disconnecting ends the whole connection, not just the one token presented.
        const all = await tokens.where('grantId', '==', snap.data().grantId).get();
        await Promise.all(all.docs.map(d => d.ref.delete()));
      }
    }
    json(res, 200, {});
  }

  // ── MCP ─────────────────────────────────────────────────

  async function authenticate(req) {
    const m = /^Bearer\s+(\S+)$/i.exec(String(req.headers.authorization || ''));
    if (!m) return null;
    const snap = await tokens.doc(sha256hex(m[1])).get();
    if (!snap.exists) return null;
    const d = snap.data();
    return d.kind === 'access' && d.expiresAt >= now() ? d : null;
  }

  async function handleMcp(req, res) {
    const identity = await authenticate(req);
    if (!identity) {
      res.set('WWW-Authenticate', `Bearer resource_metadata="${baseUrlOf(req)}/.well-known/oauth-protected-resource", scope="${SCOPE}"`);
      return json(res, 401, { error: 'invalid_token', error_description: 'Sign in to FamilyHub to use this connector.' });
    }
    if (req.method !== 'POST') {
      res.set('Allow', 'POST');
      return json(res, 405, { jsonrpc: '2.0', id: null, error: { code: -32000, message: 'Method not allowed. This server answers POST requests only.' } });
    }
    const body = req.body;
    const batch = Array.isArray(body);
    const messages = batch ? body : [body];
    if (!messages.length || messages.some(m => !m || typeof m !== 'object' || m.jsonrpc !== '2.0')) {
      return json(res, 400, { jsonrpc: '2.0', id: null, error: { code: -32600, message: 'Invalid JSON-RPC request.' } });
    }
    const replies = [];
    for (const msg of messages) {
      if (typeof msg.method !== 'string' || msg.id === undefined || msg.id === null) continue; // notification or response
      replies.push(await dispatch(msg, identity));
    }
    if (!replies.length) return res.status(202).end();
    json(res, 200, batch ? replies : replies[0]);
  }

  async function dispatch(msg, identity) {
    const ok  = result => ({ jsonrpc: '2.0', id: msg.id, result });
    const err = (code, message) => ({ jsonrpc: '2.0', id: msg.id, error: { code, message } });
    const params = msg.params && typeof msg.params === 'object' ? msg.params : {};
    switch (msg.method) {
      case 'initialize':
        return ok({
          protocolVersion: PROTOCOL_VERSIONS.includes(params.protocolVersion) ? params.protocolVersion : PROTOCOL_VERSIONS[0],
          capabilities: { tools: {} },
          serverInfo: { name: 'familyhub', title: 'FamilyHub', version: '1.0.0' },
          instructions:
            'FamilyHub is a family management app. Use these tools to save a recipe the user shares into ' +
            "their family's recipes, or to post a school community event from details the user gives " +
            '(for example a message from a teacher). Content is usually in Hebrew — keep the original language. ' +
            'Summarize what you are about to create and let the user confirm before calling a create tool.',
        });
      case 'ping':
        return ok({});
      case 'tools/list':
        return ok({ tools: TOOLS });
      case 'tools/call': {
        const impl = toolImpls[params.name];
        if (!impl) return err(-32602, `Unknown tool: ${params.name}`);
        try {
          const out = await impl(identity, params.arguments && typeof params.arguments === 'object' ? params.arguments : {});
          return ok({ content: [{ type: 'text', text: JSON.stringify(out, null, 2) }] });
        } catch (e) {
          if (e instanceof ToolError) return ok({ content: [{ type: 'text', text: e.message }], isError: true });
          console.error(`mcp tool ${params.name} failed:`, e);
          return ok({ content: [{ type: 'text', text: 'FamilyHub had an internal error. Nothing was saved; try again.' }], isError: true });
        }
      }
      default:
        return err(-32601, `Method not found: ${msg.method}`);
    }
  }

  // ── Tools ───────────────────────────────────────────────

  // The family and member behind a token, re-read on every call so that removing a member (or
  // changing their role) in the app takes effect immediately.
  async function loadFamily(identity) {
    const snap = await db.collection('families').doc(identity.familyUid).get();
    if (!snap.exists) throw new ToolError('This family no longer exists in FamilyHub. Disconnect and reconnect the connector.');
    const family = snap.data();
    const members = family.members || [];
    const me = members.find(m => m.name === identity.memberName);
    if (!me || me.role !== 'parent') {
      throw new ToolError(`"${identity.memberName}" is no longer a parent in this family. Disconnect and reconnect the connector.`);
    }
    return { family, members, me };
  }

  // Mirrors the app (_memberCommitteeClasses / isCommitteeFor / canPublishDirectly).
  function publishesDirectly(identity, family, members, me, cid) {
    if (adminUid && identity.familyUid === adminUid && identity.isOwner) return true;
    if (identity.isOwner && family.role === 'committee') return true;
    let cls;
    if (me.committeeClasses !== undefined) cls = me.committeeClasses || [];
    else if (members.some(x => x.committeeClasses !== undefined)) cls = [];
    else cls = identity.isOwner ? (family.committeeClasses || []) : [];
    return cls.includes(cid) || cls.includes('*');
  }

  const kidsInClasses = members => members
    .filter(m => m.role === 'kid' && m.school?.city && m.school?.grade)
    .map(m => ({ member: m, cid: classIdFor(m.school) }))
    .filter(k => k.cid);

  async function eventTypes() {
    let types = DEFAULT_EVENT_TYPES.map(t => ({ ...t, enabled: true }));
    try {
      const snap = await db.collection('appConfig').doc('eventTypes').get();
      const saved = snap.exists && Array.isArray(snap.data().types) ? snap.data().types : [];
      if (saved.length) {
        const byId = new Map(saved.map(t => [t.id, t]));
        types = DEFAULT_EVENT_TYPES.map(def => (byId.has(def.id) ? { ...def, ...byId.get(def.id) } : { ...def, enabled: true }));
        const defaults = new Set(DEFAULT_EVENT_TYPES.map(d => d.id));
        saved.filter(t => t && t.id && !defaults.has(t.id)).forEach(t => types.push(t));
      }
    } catch (e) { console.warn('mcp eventTypes: using defaults,', e.message); }
    return types.filter(t => t.enabled !== false);
  }

  const toolImpls = {
    async get_family_context(identity) {
      const { family, members, me } = await loadFamily(identity);
      const types = await eventTypes();
      return {
        connected_as: identity.memberName,
        family_name: family.familyName || '',
        today: todayInIsrael(now()),
        timezone: 'Asia/Jerusalem',
        kids: members.filter(m => m.role === 'kid').map(m => {
          const cid = m.school?.city && m.school?.grade ? classIdFor(m.school) : null;
          if (!cid) return { name: m.name, in_class: false };
          const direct = publishesDirectly(identity, family, members, me, cid);
          return {
            name: m.name,
            in_class: true,
            class: classLabel(m.school),
            community_events: direct ? 'published immediately (committee member)' : 'sent for committee approval',
          };
        }),
        event_types: types.map(t => ({
          id: t.id,
          label: t.labelHe || t.labelEn || t.id,
          required: [t.mDate && 'date', t.mTime && 'time', t.mLoc && 'location'].filter(Boolean),
          supports_gender_filter: !!t.hasGenderFilter,
        })),
      };
    },

    async create_recipe(identity, a) {
      await loadFamily(identity);
      const name = str(a.name, 120);
      if (!name) throw new ToolError('name is required.');
      const rawIngredients = Array.isArray(a.ingredients) ? a.ingredients : [];
      const rawSteps = Array.isArray(a.steps) ? a.steps : [];
      if (rawIngredients.length > 100 || rawSteps.length > 100) throw new ToolError('A recipe can have at most 100 ingredients and 100 steps.');
      const t0 = now();
      const items = rawIngredients
        .map(i => (typeof i === 'string' ? { name: i } : i || {}))
        .map(i => ({ name: str(i.name, 200), amount: str(i.amount, 60) }))
        .filter(i => i.name)
        .map((i, idx) => ({ id: t0 + idx, name: i.name, done: false, ...(i.amount ? { amount: i.amount } : {}) }));
      const steps = rawSteps.map(s => str(s, 2000)).filter(Boolean)
        .map((text, idx) => ({ id: t0 + 1000 + idx, text, done: false }));
      if (!items.length && !steps.length) throw new ToolError('Give at least one ingredient or one preparation step.');

      const meta = {};
      if (a.servings !== undefined && a.servings !== null) {
        const sv = Number(a.servings);
        if (!Number.isInteger(sv) || sv < 1 || sv > 1000) throw new ToolError('servings must be a whole number of 1 or more.');
        meta.servings = sv;
      }
      if (a.source_url) {
        const url = str(a.source_url, 500);
        if (!isHttpUrl(url)) throw new ToolError('source_url must be an http(s) link.');
        meta.sourceUrl = url;
      }
      if (a.visibility !== undefined && !['family', 'private'].includes(a.visibility)) throw new ToolError('visibility must be "family" or "private".');

      const ref = await db.collection('families').doc(identity.familyUid).collection('lists').add({
        type: 'recipe', name, meta,
        sharedWith: a.visibility === 'private' ? [identity.memberName] : 'all',
        canEdit: 'all',
        createdBy: identity.memberName,
        createdVia: 'claude',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        items, steps,
      });
      return {
        status: 'created', recipe_id: ref.id, name,
        ingredients: items.length, steps: steps.length,
        visible_to: a.visibility === 'private' ? identity.memberName : 'the whole family',
        open_in_app: APP_URL,
      };
    },

    async create_community_event(identity, a) {
      const { family, members, me } = await loadFamily(identity);
      const kids = kidsInClasses(members);
      if (!kids.length) throw new ToolError('No kid in this family is registered in a school class yet. Add the school details in the FamilyHub app first.');
      let kid;
      const kidName = str(a.kid_name, 80);
      if (kidName) {
        kid = kids.find(k => k.member.name === kidName);
        if (!kid) throw new ToolError(`No kid named "${kidName}" is in a class. Kids in a class: ${kids.map(k => k.member.name).join(', ')}.`);
      } else if (kids.length === 1) {
        kid = kids[0];
      } else {
        throw new ToolError(`kid_name is required — ask the user which kid's class this is for: ${kids.map(k => k.member.name).join(', ')}.`);
      }
      const cid = kid.cid, school = kid.member.school;

      const title = str(a.title, 120);
      if (!title) throw new ToolError('title is required.');
      const types = await eventTypes();
      const typeId = str(a.type, 60) || 'other';
      const type = types.find(t => t.id === typeId);
      if (!type) throw new ToolError(`Unknown event type "${typeId}". Available: ${types.map(t => t.id).join(', ')}.`);

      const date = str(a.date, 10), time = str(a.time, 5);
      const location = str(a.location, 200), note = str(a.note, 2000);
      if (date && !isRealDate(date)) throw new ToolError('date must be a real date in YYYY-MM-DD format.');
      if (date && date < todayInIsrael(now())) throw new ToolError(`date ${date} is in the past (today is ${todayInIsrael(now())}). Check the year.`);
      if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new ToolError('time must be 24-hour HH:MM.');
      const missing = [type.mDate && !date && 'date', type.mTime && !time && 'time', type.mLoc && !location && 'location'].filter(Boolean);
      if (missing.length) throw new ToolError(`Event type "${type.id}" requires: ${missing.join(', ')}. Ask the user for the missing details.`);

      const scope = a.scope === undefined ? 'class' : a.scope;
      if (!['class', 'grade', 'school'].includes(scope)) throw new ToolError('scope must be "class", "grade" or "school".');
      const gender = a.gender_filter === undefined ? 'all' : a.gender_filter;
      if (!['all', 'boys', 'girls'].includes(gender)) throw new ToolError('gender_filter must be "all", "boys" or "girls".');
      if (gender !== 'all' && !type.hasGenderFilter) throw new ToolError(`Event type "${type.id}" does not support gender_filter.`);
      let payboxUrl = '';
      if (a.paybox_url) {
        payboxUrl = str(a.paybox_url, 500);
        if (!isHttpUrl(payboxUrl)) throw new ToolError('paybox_url must be an http(s) link.');
      }

      const direct = publishesDirectly(identity, family, members, me, cid);
      if (!direct && scope !== 'class') throw new ToolError('Only committee members can post to a whole grade or school. Use scope "class".');

      const docData = {
        title, date, type: type.id, note, scope,
        postedBy: { familyUid: identity.familyUid, firstName: identity.memberName, familyName: family.familyName || '' },
        createdAt: FieldValue.serverTimestamp(),
        genderFilter: gender,
        createdVia: 'claude',
      };
      if (a.rsvp === false) docData.rsvp = false;
      if (time) docData.time = time;
      if (location) docData.location = location;
      if (payboxUrl) docData.payboxUrl = payboxUrl;

      const summary = { title, type: type.id, date: date || null, time: time || null, location: location || null, class: classLabel(school), kid: kid.member.name };
      if (!direct) {
        const ref = await db.collection('schoolClasses').doc(cid).collection('pendingEvents').add({ ...docData, status: 'pending' });
        return { status: 'pending_approval', event_id: ref.id, ...summary, message: 'Sent to the class committee for approval. It appears in the community once approved.', open_in_app: APP_URL };
      }
      let coll = 'schoolClasses', docId = cid;
      if (scope === 'grade')  { coll = 'schoolGrades'; docId = gradeIdFor(school) || cid; }
      if (scope === 'school') { coll = 'schools';      docId = schoolIdFor(school) || cid; }
      const ref = await db.collection(coll).doc(docId).collection('events').add(docData);
      return { status: 'published', event_id: ref.id, scope, ...summary, message: 'Published. Parents in the ' + scope + ' were notified.', open_in_app: APP_URL };
    },
  };

  // ── Router ──────────────────────────────────────────────

  return async function handler(req, res) {
    const path = (String(req.path || '/').replace(/\/+$/, '') || '/');
    res.set('Cache-Control', 'no-store');
    // No cookies are involved anywhere, so cross-origin callers get nothing a server-side caller doesn't.
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Expose-Headers', 'WWW-Authenticate');
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept, Mcp-Protocol-Version, Mcp-Session-Id');
      res.set('Access-Control-Max-Age', '3600');
      return res.status(204).end();
    }
    const base = baseUrlOf(req);
    try {
      const route = req.method + ' ' + path;
      if (path === '/mcp' || path === '/') return await handleMcp(req, res);
      switch (route) {
        case 'GET /.well-known/oauth-protected-resource':
        case 'GET /.well-known/oauth-protected-resource/mcp':
          return json(res, 200, {
            resource: base + '/mcp',
            authorization_servers: [base],
            scopes_supported: [SCOPE],
            bearer_methods_supported: ['header'],
            resource_name: 'FamilyHub',
          });
        case 'GET /.well-known/oauth-authorization-server':
        case 'GET /.well-known/openid-configuration':
          return json(res, 200, {
            issuer: base,
            authorization_endpoint: base + '/authorize',
            token_endpoint: base + '/token',
            registration_endpoint: base + '/register',
            revocation_endpoint: base + '/revoke',
            response_types_supported: ['code'],
            grant_types_supported: ['authorization_code', 'refresh_token'],
            code_challenge_methods_supported: ['S256'],
            token_endpoint_auth_methods_supported: ['none'],
            revocation_endpoint_auth_methods_supported: ['none'],
            scopes_supported: [SCOPE],
            authorization_response_iss_parameter_supported: true,
          });
        case 'POST /register':           return await handleRegister(req, res);
        case 'GET /authorize':              return await handleAuthorize(req, res);
        case 'POST /authorize/request':     return await handleRequestInfo(req, res);
        case 'POST /authorize/approve':     return await handleApprove(req, res);
        case 'POST /authorize/deny':        return await handleDeny(req, res);
        case 'POST /authorize/connections': return await handleConnections(req, res);
        case 'POST /authorize/disconnect':  return await handleDisconnect(req, res);
        case 'POST /token':              return await handleToken(req, res);
        case 'POST /revoke':             return await handleRevoke(req, res);
        default:                         return json(res, 404, { error: 'not_found' });
      }
    } catch (e) {
      if (e instanceof HttpError) return json(res, e.status, { error: e.code });
      console.error('mcp handler error:', e);
      json(res, 500, { error: 'server_error' });
    }
  };
}

class HttpError extends Error {
  constructor(status, code) { super(code); this.status = status; this.code = code; }
}

function json(res, status, body) {
  res.status(status).set('Content-Type', 'application/json; charset=utf-8').send(JSON.stringify(body));
}
function html(res, status, body) {
  res.status(status)
    .set('Content-Type', 'text/html; charset=utf-8')
    .set('X-Frame-Options', 'DENY')
    .set('Content-Security-Policy', "frame-ancestors 'none'; base-uri 'none'")
    .set('Referrer-Policy', 'no-referrer')
    .send(body);
}

module.exports = { createHandler, isAllowedRedirect, redirectMatches, classIdFor, TOOLS };
