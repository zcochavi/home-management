const stateUnlinked = document.getElementById('stateUnlinked');
const stateLinked   = document.getElementById('stateLinked');
const familyNameEl  = document.getElementById('familyNameEl');
const syncStatusEl  = document.getElementById('syncStatusEl');
const familyIdInput = document.getElementById('familyIdInput');
const linkError     = document.getElementById('linkError');
const linkBtn       = document.getElementById('linkBtn');
const unlinkBtn     = document.getElementById('unlinkBtn');
const syncBtn       = document.getElementById('syncBtn');
const syncResult    = document.getElementById('syncResult');
const dbgToken      = document.getElementById('dbgToken');
const dbgParams     = document.getElementById('dbgParams');

// ── Load current state ────────────────────────────────────────────────────────
function loadStatus() {
  chrome.storage.local.get(['familyId', 'familyName', 'lastSync', 'webtopToken', 'syncParams'], data => {
    if (data?.familyId) {
      showLinked(data.familyName || data.familyId, data.lastSync);
      dbgToken.textContent  = data.webtopToken  ? `טוקן: ✅ ${data.webtopToken.slice(0,12)}…` : 'טוקן: ❌ חסר — פתח Webtop';
      dbgParams.textContent = data.syncParams   ? `פרמטרים: ✅ כיתה ${data.syncParams.classCode ?? '?'}` : 'פרמטרים: ❌ חסר — פתח שיעורי בית ב-Webtop';
    } else {
      showUnlinked();
    }
  });
}

// On open: refresh cookie, then update display
chrome.runtime.sendMessage({ type: 'REFRESH_COOKIE' }, () => loadStatus());
loadStatus();

// ── Link ──────────────────────────────────────────────────────────────────────
linkBtn.addEventListener('click', async () => {
  const id = familyIdInput.value.trim();
  if (!id) { linkError.textContent = 'הזן קוד משפחה'; return; }
  linkError.textContent = '';
  linkBtn.disabled = true;
  linkBtn.textContent = 'מחבר...';

  chrome.runtime.sendMessage({ type: 'LINK_FAMILY', familyId: id }, res => {
    linkBtn.disabled = false;
    linkBtn.textContent = 'חבר ←';
    if (res?.ok) {
      showLinked(res.familyName || id, null);
      loadStatus();
    } else {
      linkError.textContent = res?.error || 'שגיאה, נסה שוב';
    }
  });
});

familyIdInput.addEventListener('keydown', e => { if (e.key === 'Enter') linkBtn.click(); });

// ── Manual sync ───────────────────────────────────────────────────────────────
syncBtn.addEventListener('click', () => {
  syncBtn.disabled = true;
  syncBtn.textContent = 'מסנכרן...';
  syncResult.textContent = '';
  syncResult.style.color = '#16a34a';
  chrome.runtime.sendMessage({ type: 'MANUAL_SYNC' }, res => {
    syncBtn.disabled = false;
    syncBtn.textContent = 'סנכרן עכשיו';
    if (res?.ok) {
      const label = res.isFirstSync
        ? `✅ סנכרון ראשוני: ${res.homeworkCount} שיעורים נטענו (${res.total} בסך הכל)`
        : `✅ ${res.homeworkCount} שיעורים עודכנו (${res.total} בסך הכל)`;
      syncResult.textContent = label;
      loadStatus();
    } else {
      syncResult.style.color = '#ef4444';
      syncResult.textContent = res?.error || 'שגיאה';
    }
  });
});

// ── Unlink ────────────────────────────────────────────────────────────────────
unlinkBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'UNLINK' }, () => showUnlinked());
});

// ── UI helpers ────────────────────────────────────────────────────────────────
function showLinked(name, lastSync) {
  stateUnlinked.style.display = 'none';
  stateLinked.style.display   = '';
  familyNameEl.textContent = `משפחת ${name}`;
  syncStatusEl.textContent = lastSync
    ? `סונכרן לאחרונה: ${timeSince(lastSync)}`
    : 'טרם סונכרן';
}

function showUnlinked() {
  stateLinked.style.display   = 'none';
  stateUnlinked.style.display = '';
  familyIdInput.value = '';
  linkError.textContent = '';
}

function timeSince(ms) {
  const diff = Math.floor((Date.now() - ms) / 1000);
  if (diff < 60)    return 'לפני פחות מדקה';
  if (diff < 3600)  return `לפני ${Math.floor(diff / 60)} דקות`;
  if (diff < 86400) return `לפני ${Math.floor(diff / 3600)} שעות`;
  return `לפני ${Math.floor(diff / 86400)} ימים`;
}
