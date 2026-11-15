const WEBTOP_INGEST_URL = 'https://us-central1-familyhub-7fdd5.cloudfunctions.net/webtopIngest';
const WEBTOP_LINK_URL   = 'https://us-central1-familyhub-7fdd5.cloudfunctions.net/webtopLink';
const WEBTOP_ORIGIN     = 'https://webtop.smartschool.co.il';
const WEBTOP_HW_URL     = 'https://webtopserver.smartschool.co.il/server/api/PupilCard/GetPupilLessonsAndHomework';

// Webtop's CDN blocks cloud servers, so FamilyHub's server can no longer fetch
// homework itself. This extension now does the fetch from the parent's own
// browser (where Webtop accepts the connection) and sends only the parsed
// homework to FamilyHub to store.

const AUTO_SYNC_MIN_GAP_MS = 10 * 60 * 1000; // don't auto-sync more than every 10 min
const ALARM_NAME = 'fh-webtop-sync';

// ─── Capture the session token (for the popup status display) and auto-sync ───
chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    const cookieHeader = details.requestHeaders?.find(h => h.name.toLowerCase() === 'cookie');
    const match = cookieHeader?.value?.match(/(?:^|;\s*)webToken=([^;]+)/);
    if (!match?.[1]) return;
    const token = match[1].trim();
    chrome.storage.local.set({ webtopToken: token }).then(() => {
      // Give onBeforeRequest a moment to store syncParams from the same request.
      setTimeout(() => syncToFamilyHub({ auto: true }).catch(() => {}), 500);
    });
  },
  { urls: ['https://webtopserver.smartschool.co.il/*'] },
  ['requestHeaders', 'extraHeaders']
);

// ─── Capture syncParams (studentID / classCode) from Webtop's own requests ────
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (!details.requestBody?.raw?.length) return;
    try {
      const body   = new TextDecoder().decode(details.requestBody.raw[0].bytes);
      const params = JSON.parse(body);
      if (!params.studentID || !params.classCode) return;
      const endpoint = details.url.split('/').pop();
      chrome.storage.local.get(['syncParams']).then(stored => {
        if (endpoint.includes('GetPupilLessonsAndHomework') || !stored.syncParams) {
          chrome.storage.local.set({ syncParams: { ...params, weekIndex: 0 } });
        }
      });
    } catch (_) {}
  },
  { urls: ['https://webtopserver.smartschool.co.il/*'] },
  ['requestBody']
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
  if (a.name === ALARM_NAME) syncToFamilyHub({ auto: true }).catch(err => console.log('[FH] alarm sync skipped:', err.message));
});

// ─── Fetch one week of homework from Webtop, from this browser ────────────────
async function fetchWeekFromWebtop(syncParams, weekIndex) {
  const body = JSON.stringify({ ...syncParams, weekIndex });

  // 1) Straight from the extension — the browser's own connection and cookies.
  try {
    const r = await fetch(WEBTOP_HW_URL, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    if (r.ok) {
      const json = await r.json().catch(() => null);
      if (json) return json;
    }
    console.warn('[FH] direct fetch returned', r.status, '— trying via a Webtop tab');
  } catch (err) {
    console.warn('[FH] direct fetch failed — trying via a Webtop tab', err);
  }

  // 2) Fallback: run the same request inside an open Webtop tab, exactly as the
  //    Webtop site itself does (same origin, same session cookies).
  const [tab] = await chrome.tabs.query({ url: 'https://webtop.smartschool.co.il/*' });
  if (!tab) throw new Error('no_webtop_tab');
  const [injection] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    world: 'MAIN',
    func: async (url, b) => {
      try {
        const r = await fetch(url, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: b });
        return { status: r.status, text: await r.text() };
      } catch (e) {
        return { status: 0, text: String(e) };
      }
    },
    args: [WEBTOP_HW_URL, body],
  });
  const result = injection?.result;
  if (!result || result.status !== 200) {
    throw new Error(result?.status === 401 || result?.status === 403 ? 'session_expired' : `webtop_${result?.status ?? 'error'}`);
  }
  return JSON.parse(result.text);
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

// ─── Sync: fetch in-browser, send parsed homework to FamilyHub ────────────────
let _syncInFlight = null;
function syncToFamilyHub(opts = {}) {
  if (_syncInFlight) return _syncInFlight;
  _syncInFlight = _doSync(opts).finally(() => { _syncInFlight = null; });
  return _syncInFlight;
}

async function _doSync({ auto = false } = {}) {
  const stored = await chrome.storage.local.get(['syncParams', 'familyId', 'lastSync', 'fullSyncDone']);
  const { syncParams, familyId, lastSync } = stored;
  const fullSyncDone = stored.fullSyncDone || {};

  if (!familyId)   throw new Error('not_linked');
  if (!syncParams) throw new Error('no_params');
  if (auto && lastSync && Date.now() - lastSync < AUTO_SYNC_MIN_GAP_MS) return { ok: true, skipped: true };

  const classCode = String(syncParams.classCode || syncParams.studentID || '');
  // First sync for this class: pull ~1 month back. Afterwards: current week.
  const weekOffsets = fullSyncDone[classCode] ? [0] : [0, -1, -2, -3];

  let homework = [];
  for (const offset of weekOffsets) {
    const json = await fetchWeekFromWebtop(syncParams, offset);
    homework = homework.concat(flattenHomework(json, classCode));
  }

  const res = await fetchWithRetry(WEBTOP_INGEST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ familyId, syncParams, homework }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `server_${res.status}`);
  }
  const json = await res.json();
  fullSyncDone[classCode] = true;
  await chrome.storage.local.set({ lastSync: Date.now(), fullSyncDone });
  setBadge('✓', '#22c55e', 4000);
  console.log('[FH] sync success:', json);
  return { ok: true, homeworkCount: json.homeworkCount, total: json.total, isFirstSync: json.isFirstSync };
}

function syncErrorMessage(err) {
  switch (err?.message) {
    case 'not_linked':      return 'לא מחובר למשפחה';
    case 'no_params':       return 'פרמטרים חסרים — פתח שיעורי בית ב-Webtop';
    case 'no_webtop_tab':   return 'פתח את Webtop בדפדפן (מחובר) ונסה שוב';
    case 'session_expired': return 'הסשן ב-Webtop פג — היכנס ל-Webtop מחדש';
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
    chrome.storage.local.remove(['familyId', 'familyName', 'lastSync', 'webtopToken', 'syncParams', 'fullSyncDone'], () => reply({ ok: true }));
    return true;
  }
  if (msg.type === 'MANUAL_SYNC') {
    syncToFamilyHub({ auto: false })
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
    await chrome.storage.local.set({ familyId, familyName });
    await _readTokenFromCookies();
    return { ok: true, familyName };
  } catch (_) {
    return { ok: false, error: 'שגיאת רשת' };
  }
}
