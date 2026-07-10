const WEBTOP_SETUP_URL = 'https://us-central1-familyhub-7fdd5.cloudfunctions.net/webtopSetup';
const WEBTOP_LINK_URL  = 'https://us-central1-familyhub-7fdd5.cloudfunctions.net/webtopLink';
const WEBTOP_ORIGIN    = 'https://webtop.smartschool.co.il';

// ─── Capture webToken + trigger sync (fires AFTER onBeforeRequest for same req)
// onBeforeSendHeaders fires after onBeforeRequest, so by the time we run here
// the syncParams are already being written. We wait 200ms to let that settle.
chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    const cookieHeader = details.requestHeaders?.find(h => h.name.toLowerCase() === 'cookie');
    console.warn('[FH] onBeforeSendHeaders:', details.url.split('/').pop(),
      '| Cookie header:', cookieHeader ? 'found' : 'NOT FOUND');
    if (!cookieHeader?.value) return;
    const match = cookieHeader.value.match(/(?:^|;\s*)webToken=([^;]+)/);
    if (!match?.[1]) {
      console.warn('[FH] no webToken in Cookie header. Keys:', cookieHeader.value.split(';').map(p=>p.trim().split('=')[0]).join(', '));
      return;
    }
    const token = match[1].trim();
    const fullCookie = cookieHeader.value; // full Cookie header, e.g. "webToken=X; other=Y"
    chrome.storage.local.get(['webtopToken']).then(stored => {
      const isNew = stored.webtopToken !== token;
      console.warn('[FH] webToken', isNew ? 'NEW' : 'same', 'len:', token.length,
        '| full cookie keys:', fullCookie.split(';').map(p=>p.trim().split('=')[0]).join(', '));
      chrome.storage.local.set({ webtopToken: token, webtopFullCookie: fullCookie }).then(() => {
        setTimeout(() => trySendToFamilyHub(), 200);
      });
    });
  },
  { urls: ['https://webtopserver.smartschool.co.il/*'] },
  ['requestHeaders', 'extraHeaders']
);

// ─── Capture syncParams from request body (fires BEFORE onBeforeSendHeaders) ──
// Only stores syncParams — sync is triggered by onBeforeSendHeaders above.
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (!details.requestBody?.raw?.length) return;
    try {
      const bytes  = details.requestBody.raw[0].bytes;
      const body   = new TextDecoder().decode(bytes);
      const params = JSON.parse(body);
      const endpoint = details.url.split('/').pop();
      console.log('[FH] onBeforeRequest:', endpoint, '| studentID:', params.studentID, '| classCode:', params.classCode);

      if (!params.studentID || !params.classCode) return;

      const syncParams = { ...params, weekIndex: 0 };
      chrome.storage.local.get(['syncParams']).then(stored => {
        const isHomework = endpoint.includes('GetPupilLessonsAndHomework');
        if (isHomework || !stored.syncParams) {
          console.log('[FH] storing syncParams from:', endpoint);
          chrome.storage.local.set({ syncParams });
          // sync is triggered by onBeforeSendHeaders, not here
        }
      });
    } catch (_) {}
  },
  { urls: ['https://webtopserver.smartschool.co.il/*'] },
  ['requestBody']
);

// ─── Fallback: also read cookie when Webtop tab finishes loading ──────────────
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;
  if (!tab.url?.startsWith(WEBTOP_ORIGIN)) return;
  // Just store the token if we can find it — no sync trigger here
  // (onBeforeRequest handles sync when API requests fire)
  _readTokenFromCookies();
});

async function _readTokenFromCookies() {
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
        return true;
      }
    } catch (err) {
      console.error('[FH] cookie error for', url, err);
    }
  }
  console.log('[FH] no token cookie found on any domain');
  return false;
}

// Called from popup REFRESH_COOKIE — only updates stored token, no sync
async function refreshCookieOnly() {
  await _readTokenFromCookies();
}

// ─── Send to FamilyHub Cloud Function ────────────────────────────────────────
async function trySendToFamilyHub() {
  const stored = await chrome.storage.local.get(['webtopToken', 'webtopFullCookie', 'syncParams', 'familyId']);
  const { webtopToken, webtopFullCookie, syncParams, familyId } = stored;

  if (!familyId)    { console.log('[FH] not linked'); return; }
  if (!webtopToken) { console.log('[FH] no token — visit Webtop while logged in'); return; }
  if (!syncParams)  { console.log('[FH] no params — open the homework page in Webtop'); return; }

  console.log('[FH] sending to FamilyHub…');
  try {
    const res = await fetchWithRetry(WEBTOP_SETUP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        webtopSession: { token: webtopToken, fullCookie: webtopFullCookie || null },
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

async function fetchWithRetry(url, options, maxRetries = 2) {
  let lastErr;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      lastErr = err;
      if (attempt < maxRetries) {
        console.log(`[FH] fetch attempt ${attempt + 1} failed, retrying…`);
        await new Promise(r => setTimeout(r, 1500));
      }
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
    chrome.storage.local.remove(['familyId', 'familyName', 'lastSync', 'webtopToken', 'syncParams'], () => reply({ ok: true }));
    return true;
  }
  if (msg.type === 'MANUAL_SYNC') {
    manualSync().then(reply).catch(err => reply({ ok: false, error: err.message }));
    return true;
  }
  if (msg.type === 'REFRESH_COOKIE') {
    refreshCookieOnly().then(() => reply({ ok: true })).catch(() => reply({ ok: false }));
    return true;
  }
});

async function manualSync() {
  const stored = await chrome.storage.local.get(['webtopToken', 'syncParams', 'familyId']);
  const { webtopToken, syncParams, familyId } = stored;
  if (!familyId)    return { ok: false, error: 'לא מחובר למשפחה' };
  if (!webtopToken) return { ok: false, error: 'טוקן חסר — פתח Webtop בדפדפן' };
  if (!syncParams)  return { ok: false, error: 'פרמטרים חסרים — פתח שיעורי בית ב-Webtop' };

  const res = await fetchWithRetry(WEBTOP_SETUP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ webtopSession: { token: webtopToken }, syncParams, familyId }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = body.error === 'session_expired'
      ? 'הסשן פג — פתח Webtop ורענן'
      : body.error || `שרת: ${res.status}`;
    return { ok: false, error: err };
  }
  const json = await res.json();
  await chrome.storage.local.set({ lastSync: Date.now() });
  setBadge('✓', '#22c55e', 4000);
  return { ok: true, homeworkCount: json.homeworkCount, total: json.total, isFirstSync: json.isFirstSync };
}

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
