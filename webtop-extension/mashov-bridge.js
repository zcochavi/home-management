// Isolated-world relay: messages from mashov-capture.js (page context) → background.
window.addEventListener('message', e => {
  if (e.source !== window || e.origin !== window.location.origin) return;
  const t = e.data?.type;
  if (t === 'FH_MASHOV_CHILD' || t === 'FH_MASHOV_CSRF') {
    try { chrome.runtime.sendMessage({ type: t, payload: e.data.payload }); } catch (_) {}
  }
});
