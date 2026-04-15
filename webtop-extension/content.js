// Inject our interceptor into the Webtop page context via extension URL.
// The extension origin is whitelisted in Webtop's CSP, so this works.
const s = document.createElement('script');
s.src = chrome.runtime.getURL('injected.js');
s.onload = () => s.remove();
(document.head || document.documentElement).appendChild(s);

// Bridge messages from page context → background service worker.
window.addEventListener('message', e => {
  if (e.source !== window) return;
  if (e.data?.type === 'FH_WEBTOP_LOGIN' || e.data?.type === 'FH_WEBTOP_PARAMS') {
    chrome.runtime.sendMessage(e.data);
  }
});
