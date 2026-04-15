// ─── Configuration ───────────────────────────────────────────────────────────
const CLOUD_FN_URL = 'https://us-central1-familyhub-7fdd5.cloudfunctions.net/webtopSetup';

// ─── Message handler ─────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'FH_WEBTOP_LOGIN')  handleLogin(msg.payload);
  if (msg.type === 'FH_WEBTOP_PARAMS') handleParams(msg.payload);
});

async function handleLogin(loginData) {
  await chrome.storage.local.set({ webtopSession: loginData });
  await trySendToFamilyHub();
}

async function handleParams(params) {
  await chrome.storage.local.set({ syncParams: params });
  await trySendToFamilyHub();
}

// ─── Send captured data to FamilyHub Cloud Function ──────────────────────────
async function trySendToFamilyHub() {
  const stored = await chrome.storage.local.get(['webtopSession', 'syncParams', 'familyId']);
  const { webtopSession, syncParams, familyId } = stored;

  if (!familyId)       return; // not linked yet
  if (!webtopSession)  return; // no token yet
  if (!syncParams)     return; // no homework params yet

  try {
    const res = await fetch(CLOUD_FN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webtopSession, syncParams, familyId }),
    });

    if (res.ok) {
      await chrome.storage.local.set({ lastSync: Date.now() });
      setBadge('✓', '#22c55e', 4000);
    } else {
      setBadge('!', '#ef4444', 6000);
    }
  } catch (_) {
    setBadge('!', '#ef4444', 6000);
  }
}

// ─── Badge helper ─────────────────────────────────────────────────────────────
function setBadge(text, color, clearAfterMs) {
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color });
  if (clearAfterMs) setTimeout(() => chrome.action.setBadgeText({ text: '' }), clearAfterMs);
}

// ─── Popup requests ──────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  if (msg.type === 'GET_STATUS') {
    chrome.storage.local.get(['familyId', 'familyName', 'lastSync', 'webtopSession'], data => {
      reply(data);
    });
    return true; // keep channel open for async reply
  }

  if (msg.type === 'LINK_FAMILY') {
    linkFamily(msg.familyId).then(reply);
    return true;
  }

  if (msg.type === 'UNLINK') {
    chrome.storage.local.remove(['familyId', 'familyName', 'lastSync'], () => reply({ ok: true }));
    return true;
  }
});

// ─── Link to a FamilyHub family by UID ───────────────────────────────────────
async function linkFamily(familyId) {
  try {
    const res = await fetch(
      `https://us-central1-familyhub-7fdd5.cloudfunctions.net/webtopLink`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyId }),
      }
    );
    if (!res.ok) return { ok: false, error: 'קוד לא תקין' };
    const { familyName } = await res.json();
    await chrome.storage.local.set({ familyId, familyName });
    return { ok: true, familyName };
  } catch (_) {
    return { ok: false, error: 'שגיאת רשת' };
  }
}
