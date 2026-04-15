const WEBTOP_SETUP_URL = 'https://us-central1-familyhub-7fdd5.cloudfunctions.net/webtopSetup';
const WEBTOP_LINK_URL  = 'https://us-central1-familyhub-7fdd5.cloudfunctions.net/webtopLink';
const WEBTOP_ORIGIN    = 'https://webtop.smartschool.co.il';

// ─── Intercept any Webtop API call that carries student identity fields ───────
// We watch ALL calls to the API server. Any POST that includes studentID +
// classCode + periodID is good enough to build syncParams with weekIndex=0.
// This fires on the initial page load (not just the homework tab).
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (!details.requestBody?.raw?.length) return;
    try {
      const bytes  = details.requestBody.raw[0].bytes;
      const body   = new TextDecoder().decode(bytes);
      const params = JSON.parse(body);
      const endpoint = details.url.split('/').pop();
      console.log('[FH] Webtop API:', endpoint, '| studentID:', params.studentID, '| classCode:', params.classCode);

      // Need at least studentID + classCode to be useful
      if (!params.studentID || !params.classCode) return;

      // Build syncParams (force weekIndex 0 = current week)
      const syncParams = { ...params, weekIndex: 0 };

      chrome.storage.local.get(['syncParams']).then(stored => {
        // Always update if we got the actual homework endpoint;
        // only store for the first time for other endpoints
        const isHomework = endpoint.includes('GetPupilLessonsAndHomework');
        if (isHomework || !stored.syncParams) {
          console.log('[FH] storing syncParams from:', endpoint);
          chrome.storage.local.set({ syncParams }).then(() => trySendToFamilyHub());
        }
      });
    } catch (_) {}
  },
  { urls: ['https://webtopserver.smartschool.co.il/*'] },
  ['requestBody']
);

// ─── Read webToken cookie when user is on Webtop ──────────────────────────────
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;
  if (!tab.url?.startsWith(WEBTOP_ORIGIN)) return;
  readWebtopCookie();
});

async function readWebtopCookie() {
  // Try both the frontend and API domains — the cookie may be set on either
  const searchUrls = [
    'https://webtop.smartschool.co.il',
    'https://webtopserver.smartschool.co.il',
  ];
  for (const url of searchUrls) {
    try {
      const all = await chrome.cookies.getAll({ url });
      console.log('[FH] cookies on', url, '->', all.map(c => c.name).join(', ') || '(none)');
      const found = all.find(c => c.name === 'webToken') || all.find(c => c.name.toLowerCase().includes('token'));
      if (found?.value) {
        console.log('[FH] token cookie found:', found.name, 'len:', found.value.length);
        await chrome.storage.local.set({ webtopToken: found.value });
        await trySendToFamilyHub();
        return;
      }
    } catch (err) {
      console.error('[FH] cookie error for', url, err);
    }
  }
  console.log('[FH] no token cookie found on any domain');
}

// ─── Send to FamilyHub Cloud Function ────────────────────────────────────────
async function trySendToFamilyHub() {
  const stored = await chrome.storage.local.get(['webtopToken', 'syncParams', 'familyId']);
  const { webtopToken, syncParams, familyId } = stored;

  if (!familyId)    { console.log('[FH] not linked'); return; }
  if (!webtopToken) { console.log('[FH] no token — visit Webtop while logged in'); return; }
  if (!syncParams)  { console.log('[FH] no params — open the homework page in Webtop'); return; }

  console.log('[FH] sending to FamilyHub…');
  try {
    const res = await fetch(WEBTOP_SETUP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        webtopSession: { token: webtopToken },
        syncParams,
        familyId,
      }),
    });
    if (res.ok) {
      const json = await res.json();
      console.log('[FH] sync success:', json);
      await chrome.storage.local.set({ lastSync: Date.now() });
      setBadge('✓', '#22c55e', 4000);
    } else {
      const text = await res.text();
      console.error('[FH] sync failed:', res.status, text);
      setBadge('!', '#ef4444', 6000);
    }
  } catch (err) {
    console.error('[FH] network error:', err);
    setBadge('!', '#ef4444', 6000);
  }
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
    chrome.storage.local.remove(['familyId', 'familyName', 'lastSync', 'webtopToken', 'syncParams'], () => reply({ ok: true }));
    return true;
  }
  if (msg.type === 'MANUAL_SYNC') {
    readWebtopCookie().then(() => manualSync()).then(reply).catch(err => reply({ ok: false, error: err.message }));
    return true;
  }
  if (msg.type === 'REFRESH_COOKIE') {
    readWebtopCookie().then(() => reply({ ok: true })).catch(() => reply({ ok: false }));
    return true;
  }
});

async function manualSync() {
  const stored = await chrome.storage.local.get(['webtopToken', 'syncParams', 'familyId']);
  const { webtopToken, syncParams, familyId } = stored;
  if (!familyId)    return { ok: false, error: 'לא מחובר למשפחה' };
  if (!webtopToken) return { ok: false, error: 'טוקן חסר — פתח Webtop בדפדפן' };
  if (!syncParams)  return { ok: false, error: 'פרמטרים חסרים — פתח שיעורי בית ב-Webtop' };

  const res = await fetch(WEBTOP_SETUP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ webtopSession: { token: webtopToken }, syncParams, familyId }),
  });
  if (!res.ok) return { ok: false, error: `שרת: ${res.status}` };
  const json = await res.json();
  await chrome.storage.local.set({ lastSync: Date.now() });
  setBadge('✓', '#22c55e', 4000);
  return { ok: true, homeworkCount: json.homeworkCount };
}

async function linkFamily(familyId) {
  try {
    const res = await fetch(WEBTOP_LINK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ familyId }),
    });
    if (!res.ok) return { ok: false, error: 'קוד לא תקין' };
    const { familyName } = await res.json();
    await chrome.storage.local.set({ familyId, familyName });
    // Try reading cookie immediately after linking
    await readWebtopCookie();
    return { ok: true, familyName };
  } catch (_) {
    return { ok: false, error: 'שגיאת רשת' };
  }
}
