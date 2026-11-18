const WEBTOP_INGEST_URL = 'https://us-central1-familyhub-7fdd5.cloudfunctions.net/webtopIngest';
const WEBTOP_LINK_URL   = 'https://us-central1-familyhub-7fdd5.cloudfunctions.net/webtopLink';
const WEBTOP_ORIGIN     = 'https://webtop.smartschool.co.il';
const WEBTOP_HW_URL     = 'https://webtopserver.smartschool.co.il/server/api/PupilCard/GetPupilLessonsAndHomework';

// Webtop's CDN blocks cloud servers, so FamilyHub's server can no longer fetch
// homework itself. This extension does the fetch from the parent's own browser
// (where Webtop accepts the connection) and sends only the parsed homework to
// FamilyHub to store.

const AUTO_SYNC_MIN_GAP_MS = 10 * 60 * 1000; // don't auto-sync more than every 10 min
const ALARM_NAME = 'fh-webtop-sync';

// Headers Webtop's own site sends with this request.
const WEBTOP_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json, text/plain, */*',
  'Language': 'he',
  'Rememberme': '0',
};

// Requests this extension makes itself (service worker, tabId -1) must not be
// mistaken for the Webtop site's own traffic.
const isOwnRequest = d => d.tabId < 0 || (d.initiator || '').startsWith('chrome-extension://');
const studentKey = p => `${p.studentName || ''}|${p.classCode}`;

// ─── Capture the session token (for the popup status display) and auto-sync ───
chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    if (isOwnRequest(details)) return;
    const cookieHeader = details.requestHeaders?.find(h => h.name.toLowerCase() === 'cookie');
    const match = cookieHeader?.value?.match(/(?:^|;\s*)webToken=([^;]+)/);
    if (!match?.[1]) return;
    chrome.storage.local.set({ webtopToken: match[1].trim() });
  },
  { urls: ['https://webtopserver.smartschool.co.il/*'] },
  ['requestHeaders', 'extraHeaders']
);

// ─── Capture each kid's params — but only from requests that SUCCEEDED ────────
// The params include an encrypted studentID that changes with the login
// session, and Webtop's own site sometimes fires stale requests that fail.
// So hold each request's params until we see it complete with 200.
const pendingParams = new Map(); // requestId -> params

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (isOwnRequest(details) || !details.requestBody?.raw?.length) return;
    try {
      const params = JSON.parse(new TextDecoder().decode(details.requestBody.raw[0].bytes));
      if (params.studentID && params.classCode != null) pendingParams.set(details.requestId, params);
    } catch (_) {}
  },
  { urls: [WEBTOP_HW_URL] },
  ['requestBody']
);

chrome.webRequest.onCompleted.addListener(
  async (details) => {
    const params = pendingParams.get(details.requestId);
    pendingParams.delete(details.requestId);
    if (!params || details.statusCode !== 200) return;
    const fresh = { ...params, weekIndex: 0 };
    const { syncParamsMap = {} } = await chrome.storage.local.get(['syncParamsMap']);
    syncParamsMap[studentKey(fresh)] = { ...fresh, capturedAt: Date.now() };
    await chrome.storage.local.set({ syncParamsMap, syncParams: fresh });
    // The site just successfully loaded homework — a good moment to sync.
    syncToFamilyHub({ auto: true }).catch(err => console.log('[FH] auto sync skipped:', err.message));
  },
  { urls: [WEBTOP_HW_URL] }
);

chrome.webRequest.onErrorOccurred.addListener(
  (details) => pendingParams.delete(details.requestId),
  { urls: [WEBTOP_HW_URL] }
);

// ─── Fallback token read when a Webtop tab finishes loading ───────────────────
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.startsWith(WEBTOP_ORIGIN)) _readTokenFromCookies();
});

async function _readTokenFromCookies() {
  for (const url of ['https://webtop.smartschool.co.il', 'https://webtopserver.smartschool.co.il']) {
    try {
      const all = await chrome.cookies.getAll({ url });
      const found = all.find(c => c.name === 'webToken');
      if (found?.value) { await chrome.storage.local.set({ webtopToken: found.value }); return true; }
    } catch (err) { console.error('[FH] cookie error for', url, err); }
  }
  return false;
}

// ─── Periodic background sync (works while the Webtop session is alive) ───────
chrome.runtime.onInstalled.addListener(() => chrome.alarms.create(ALARM_NAME, { periodInMinutes: 120 }));
chrome.runtime.onStartup.addListener(() => chrome.alarms.create(ALARM_NAME, { periodInMinutes: 120 }));
chrome.alarms.onAlarm.addListener(a => {
  if (a.name !== ALARM_NAME) return;
  syncToFamilyHub({ auto: true }).catch(err => console.log('[FH] alarm sync skipped:', err.message));
  syncMashov({ auto: true }).catch(err => console.log('[FH] mashov alarm sync skipped:', err.message));
});

// ─── Fetch one week of homework from Webtop, from this browser ────────────────
async function fetchWeekFromWebtop(syncParams, weekIndex) {
  const { capturedAt, ...params } = syncParams;
  const body = JSON.stringify({ ...params, weekIndex });
  const failures = [];

  // 1) Inside an open Webtop tab — same origin, cookies and headers as the
  //    Webtop site itself, so this is the most faithful option.
  const tabs = await chrome.tabs.query({ url: 'https://webtop.smartschool.co.il/*' });
  const tab = tabs.find(t => !t.discarded && !/\/account\/login/.test(t.url || '')) || null;
  if (tab) {
    try {
      const [injection] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        world: 'MAIN',
        func: async (url, b, headers) => {
          try {
            const r = await fetch(url, { method: 'POST', credentials: 'include', headers, body: b });
            return { status: r.status, text: await r.text() };
          } catch (e) {
            return { status: 0, text: String(e) };
          }
        },
        args: [WEBTOP_HW_URL, body, WEBTOP_HEADERS],
      });
      const result = injection?.result;
      if (result?.status === 200) return JSON.parse(result.text);
      failures.push(`tab:${result?.status ?? '?'} ${String(result?.text || '').slice(0, 120)}`);
    } catch (err) {
      failures.push(`tab:error ${err.message}`);
    }
  } else {
    failures.push(tabs.length ? 'tab:only-login-page' : 'tab:none');
  }

  // 2) Straight from the extension, with the browser's cookies.
  try {
    const r = await fetch(WEBTOP_HW_URL, { method: 'POST', credentials: 'include', headers: WEBTOP_HEADERS, body });
    if (r.ok) {
      const json = await r.json().catch(() => null);
      if (json) return json;
    }
    failures.push(`direct:${r.status}`);
  } catch (err) {
    failures.push(`direct:error ${err.message}`);
  }

  console.warn(`[FH] week ${weekIndex} for ${syncParams.studentName || syncParams.classCode} failed:`, failures.join(' | '));
  const err = new Error(tabs.some(t => /\/account\/login/.test(t.url || '')) && !tab ? 'session_expired' : 'webtop_failed');
  err.detail = failures.join(' | ');
  throw err;
}

// Flatten Webtop's day → hour → schedule structure into homework items
// (same shape the server used to produce).
function flattenHomework(json, classCode) {
  const homework = [];
  const dayData = json?.data;
  if (!dayData) return homework;
  for (const day of Object.values(dayData)) {
    const hours = day?.hoursData;
    if (!hours) continue;
    for (const hour of Object.values(hours)) {
      const schedules = hour?.scheduale;
      if (!Array.isArray(schedules)) continue;
      for (const s of schedules) {
        if (s?.homeWork) {
          homework.push({
            subject: s.subject_name || '',
            text: s.homeWork,
            context: s.descClass || '',
            date: (day.date || '').slice(0, 10),
            classCode,
          });
        }
      }
    }
  }
  return homework;
}

// ─── Sync: fetch in-browser for every known kid, send results to FamilyHub ────
let _syncInFlight = null;
function syncToFamilyHub(opts = {}) {
  if (_syncInFlight) return _syncInFlight;
  _syncInFlight = _doSync(opts).finally(() => { _syncInFlight = null; });
  return _syncInFlight;
}

async function _doSync({ auto = false } = {}) {
  const stored = await chrome.storage.local.get(['syncParamsMap', 'syncParams', 'familyId', 'lastSync', 'fullSyncDone']);
  const { familyId, lastSync } = stored;
  const fullSyncDone = stored.fullSyncDone || {};
  // Only params captured from a successful Webtop request (1.3.1+). Older saved
  // params may carry a stale session-bound studentID, so they're not reused.
  const students = Object.values(stored.syncParamsMap || {});

  if (!familyId)        throw new Error('not_linked');
  if (!students.length) throw new Error('no_params');
  if (auto && lastSync && Date.now() - lastSync < AUTO_SYNC_MIN_GAP_MS) return { ok: true, skipped: true };

  let homeworkCount = 0, total = 0, isFirstSync = false, synced = 0, lastErr = null;
  for (const syncParams of students) {
    const key = studentKey(syncParams);
    const classCode = String(syncParams.classCode ?? syncParams.studentID ?? '');
    // First sync for this kid: pull ~1 month back. Afterwards: current week.
    const weekOffsets = fullSyncDone[key] ? [0] : [0, -1, -2, -3];

    let homework = [], weeksOk = 0;
    for (const offset of weekOffsets) {
      try {
        homework = homework.concat(flattenHomework(await fetchWeekFromWebtop(syncParams, offset), classCode));
        weeksOk++;
      } catch (err) {
        lastErr = err; // skip this week, keep going
      }
    }
    if (!weeksOk) continue;

    const { capturedAt, ...paramsToSend } = syncParams;
    const res = await fetchWithRetry(WEBTOP_INGEST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ familyId, syncParams: paramsToSend, homework }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      lastErr = new Error(body.error || `server_${res.status}`);
      continue;
    }
    const json = await res.json();
    homeworkCount += json.homeworkCount || 0;
    total = json.total || total;
    isFirstSync = isFirstSync || !!json.isFirstSync;
    if (weeksOk === weekOffsets.length) fullSyncDone[key] = true;
    synced++;
  }

  if (!synced) throw lastErr || new Error('webtop_failed');
  await chrome.storage.local.set({ lastSync: Date.now(), fullSyncDone });
  setBadge('✓', '#22c55e', 4000);
  console.log(`[FH] sync success: ${synced}/${students.length} kids, ${homeworkCount} items`);
  return { ok: true, homeworkCount, total, isFirstSync, synced, students: students.length };
}

function syncErrorMessage(err) {
  switch (err?.message) {
    case 'not_linked':      return 'לא מחובר למשפחה';
    case 'no_params':       return 'פתח את דף שיעורי הבית ב-Webtop לכל ילד, או היכנס למשו״ב, ואז סנכרן';
    case 'session_expired': return 'הסשן ב-Webtop פג — היכנס ל-Webtop מחדש';
    case 'webtop_failed':   return `Webtop לא החזיר שיעורים — פתח את דף שיעורי הבית ב-Webtop ונסה שוב (${err.detail || ''})`;
    case 'mashov_no_kids':  return 'היכנס למשו״ב עם פרטי ההורה, ואז סנכרן';
    case 'mashov_session_expired': return 'הסשן במשו״ב פג — היכנס למשו״ב מחדש';
    case 'mashov_failed':   return `משו״ב לא החזיר שיעורים — פתח את משו״ב ונסה שוב (${err.detail || ''})`;
    default:                return err?.message || 'שגיאה';
  }
}

async function fetchWithRetry(url, options, maxRetries = 2) {
  let lastErr;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      lastErr = err;
      if (attempt < maxRetries) await new Promise(r => setTimeout(r, 1500));
    }
  }
  throw lastErr;
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function setBadge(text, color, clearAfterMs) {
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color });
  if (clearAfterMs) setTimeout(() => chrome.action.setBadgeText({ text: '' }), clearAfterMs);
}

// ─── Popup messages ───────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  if (msg.type === 'GET_STATUS') {
    chrome.storage.local.get(['familyId', 'familyName', 'lastSync'], data => reply(data));
    return true;
  }
  if (msg.type === 'LINK_FAMILY') {
    linkFamily(msg.familyId).then(reply);
    return true;
  }
  if (msg.type === 'UNLINK') {
    chrome.storage.local.remove(['familyId', 'familyName', 'lastSync', 'webtopToken', 'syncParams', 'syncParamsMap', 'fullSyncDone', ...MASHOV_KEYS], () => reply({ ok: true }));
    return true;
  }
  if (msg.type === 'FH_MASHOV_CHILD') { onMashovChild(msg.payload); return; }
  if (msg.type === 'FH_MASHOV_CSRF') {
    const v = String(msg.payload || '');
    if (v && v.length <= 500) chrome.storage.local.set({ mashovCsrf: v });
    return;
  }
  if (msg.type === 'MANUAL_SYNC') {
    syncAll()
      .then(reply)
      .catch(err => { setBadge('!', '#ef4444', 6000); reply({ ok: false, error: syncErrorMessage(err) }); });
    return true;
  }
  if (msg.type === 'REFRESH_COOKIE') {
    _readTokenFromCookies().then(() => reply({ ok: true })).catch(() => reply({ ok: false }));
    return true;
  }
});

async function linkFamily(familyId) {
  try {
    const res = await fetchWithRetry(WEBTOP_LINK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ familyId }),
    });
    if (!res.ok) return { ok: false, error: 'קוד לא תקין' };
    const { familyName } = await res.json();
    // Mashov's ingest accepts families linked either way; record a Mashov link too.
    fetch(MASHOV_LINK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ familyId }) }).catch(() => {});
    await chrome.storage.local.set({ familyId, familyName });
    await _readTokenFromCookies();
    return { ok: true, familyName };
  } catch (_) {
    return { ok: false, error: 'שגיאת רשת' };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Mashov — for kids whose school uses Mashov instead of Webtop
// ═══════════════════════════════════════════════════════════════════════════════
// mashov-capture.js (on web.mashov.info) reports the kids from the site's login
// response and the session's CSRF token. Homework is fetched from this browser with
// the parent's Mashov session and sent to FamilyHub's mashovIngest, which never
// contacts Mashov itself. No Mashov password is ever seen or stored.
const MASHOV_INGEST_URL = 'https://us-central1-familyhub-7fdd5.cloudfunctions.net/mashovIngest';
const MASHOV_LINK_URL   = 'https://us-central1-familyhub-7fdd5.cloudfunctions.net/mashovLink';
const MASHOV_ORIGIN     = 'https://web.mashov.info';
const MASHOV_KEYS = ['mashovChildren', 'mashovCsrf', 'mashovLastSync', 'mashovFullSync'];
const GUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isoDaysAgo = (n) => {
  const d = new Date(Date.now() - n * 864e5);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

let _mashovAutoTimer = null;
async function onMashovChild(c) {
  const guid = String(c?.childGuid || '').toLowerCase();
  if (!GUID_RE.test(guid)) return;
  const { mashovChildren = {} } = await chrome.storage.local.get(['mashovChildren']);
  const prev = mashovChildren[guid];
  // An id seen in a URL must not replace the named entry from the login response.
  if (prev && !c.privateName) return;
  const s = (v, n) => String(v ?? '').slice(0, n);
  mashovChildren[guid] = {
    childGuid: guid, privateName: s(c.privateName, 60), familyName: s(c.familyName, 60),
    classCode: s(c.classCode, 10), classNum: s(c.classNum, 10), schoolName: s(c.schoolName, 120),
  };
  await chrome.storage.local.set({ mashovChildren });
  // The parent just logged in / opened a kid — a good moment to sync (once things settle).
  clearTimeout(_mashovAutoTimer);
  _mashovAutoTimer = setTimeout(() => syncMashov({ auto: true }).catch(err => console.log('[FH] mashov auto sync skipped:', err.message)), 4000);
}

async function _mashovCsrf() {
  const { mashovCsrf } = await chrome.storage.local.get(['mashovCsrf']);
  if (mashovCsrf) return mashovCsrf;
  try {
    const all = await chrome.cookies.getAll({ url: MASHOV_ORIGIN });
    const c = all.find(x => /^(csrf-token|xsrf-token)$/i.test(x.name));
    if (c?.value) return decodeURIComponent(c.value);
  } catch (_) {}
  return '';
}

async function fetchMashovHomework(childGuid) {
  const url = `${MASHOV_ORIGIN}/api/students/${childGuid}/homework`;
  const headers = { 'Accept': 'application/json, text/plain, */*' };
  const csrf = await _mashovCsrf();
  if (csrf) headers['X-Csrf-Token'] = csrf;
  const failures = [];
  let authFail = false;

  // 1) Inside an open Mashov tab — the site's own origin and cookies.
  const tabs = await chrome.tabs.query({ url: `${MASHOV_ORIGIN}/*` });
  const tab = tabs.find(t => !t.discarded && !/\/login/i.test(t.url || '')) || null;
  if (tab) {
    try {
      const [injection] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        world: 'MAIN',
        func: async (u, h) => {
          try {
            const r = await fetch(u, { credentials: 'include', headers: h });
            return { status: r.status, text: await r.text() };
          } catch (e) { return { status: 0, text: String(e) }; }
        },
        args: [url, headers],
      });
      const r = injection?.result;
      if (r?.status === 200) return JSON.parse(r.text);
      if (r?.status === 401 || r?.status === 403) authFail = true;
      failures.push(`tab:${r?.status ?? '?'}`);
    } catch (err) { failures.push(`tab:error ${err.message}`); }
  } else {
    failures.push(tabs.length ? 'tab:only-login-page' : 'tab:none');
  }

  // 2) Straight from the extension, with the browser's Mashov cookies.
  try {
    const r = await fetch(url, { credentials: 'include', headers });
    if (r.ok) { const j = await r.json().catch(() => null); if (j) return j; }
    if (r.status === 401 || r.status === 403) authFail = true;
    failures.push(`direct:${r.status}`);
  } catch (err) { failures.push(`direct:error ${err.message}`); }

  const err = new Error(authFail || (tabs.length && !tab) ? 'mashov_session_expired' : 'mashov_failed');
  err.detail = failures.join(' | ');
  throw err;
}

let _mashovInFlight = null;
function syncMashov(opts = {}) {
  if (_mashovInFlight) return _mashovInFlight;
  _mashovInFlight = _doMashovSync(opts).finally(() => { _mashovInFlight = null; });
  return _mashovInFlight;
}

async function _doMashovSync({ auto = false } = {}) {
  const st = await chrome.storage.local.get(['familyId', 'mashovChildren', 'mashovLastSync', 'mashovFullSync']);
  const kids = Object.values(st.mashovChildren || {});
  const full = st.mashovFullSync || {};
  if (!st.familyId) throw new Error('not_linked');
  if (!kids.length) throw new Error('mashov_no_kids');
  if (auto && st.mashovLastSync && Date.now() - st.mashovLastSync < AUTO_SYNC_MIN_GAP_MS) return { ok: true, skipped: true };

  let homeworkCount = 0, total = 0, isFirstSync = false, synced = 0, lastErr = null;
  for (const child of kids) {
    const since = isoDaysAgo(full[child.childGuid] ? 21 : 35); // first sync: ~5 weeks back
    let raw;
    try { raw = await fetchMashovHomework(child.childGuid); }
    catch (err) { lastErr = err; continue; }
    const homework = (Array.isArray(raw) ? raw : []).filter(h => String(h?.lessonDate || '').slice(0, 10) >= since);
    const res = await fetchWithRetry(MASHOV_INGEST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ familyId: st.familyId, child, since, homework, source: 'extension' }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      lastErr = new Error(body.error || `server_${res.status}`);
      continue;
    }
    const json = await res.json();
    homeworkCount += json.homeworkCount || 0;
    total += json.total || 0;
    isFirstSync = isFirstSync || !!json.isFirstSync;
    full[child.childGuid] = true;
    synced++;
  }
  if (!synced) throw lastErr || new Error('mashov_failed');
  await chrome.storage.local.set({ mashovLastSync: Date.now(), mashovFullSync: full });
  setBadge('✓', '#22c55e', 4000);
  return { ok: true, homeworkCount, total, isFirstSync, synced, students: kids.length };
}

// Manual sync from the popup: Webtop and/or Mashov, whichever this browser has.
async function syncAll() {
  const { syncParamsMap = {}, mashovChildren = {} } = await chrome.storage.local.get(['syncParamsMap', 'mashovChildren']);
  const hasWebtop = Object.keys(syncParamsMap).length > 0;
  const hasMashov = Object.keys(mashovChildren).length > 0;
  if (!hasWebtop && !hasMashov) return syncToFamilyHub({ auto: false }); // throws the usual "no_params"
  const results = [], errors = [];
  for (const [has, run] of [[hasWebtop, () => syncToFamilyHub({ auto: false })], [hasMashov, () => syncMashov({ auto: false })]]) {
    if (!has) continue;
    try { results.push(await run()); } catch (err) { errors.push(err); }
  }
  if (!results.length) throw errors[0];
  const sum = (k) => results.reduce((n, r) => n + (r[k] || 0), 0);
  return {
    ok: true,
    homeworkCount: sum('homeworkCount'), total: sum('total'), synced: sum('synced'), students: sum('students'),
    isFirstSync: results.some(r => r.isFirstSync),
    warning: errors.length ? syncErrorMessage(errors[0]) : null,
  };
}
