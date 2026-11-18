// Runs in Mashov's page context (content_scripts world MAIN). Watches the site's own
// API traffic and reports, via window.postMessage to mashov-bridge.js:
//  - the kids, from the login response (accessToken.children), or at least their ids
//    from the site's /api/students/{childGuid}/... requests;
//  - the session's CSRF token, which Mashov's API wants in an X-Csrf-Token header.
// Nothing else is read; passwords never pass through here.
(function () {
  if (window.__fhMashov) return;
  window.__fhMashov = 1;
  const CHILD_URL = /\/api\/students\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\//i;
  const post = (type, payload) => window.postMessage({ type, payload }, window.location.origin);
  const csrf = (v) => { if (v) post('FH_MASHOV_CSRF', String(v)); };

  function seen(url, body) {
    url = String(url || '');
    const m = CHILD_URL.exec(url);
    if (m) post('FH_MASHOV_CHILD', { childGuid: m[1] });
    if (!url.includes('/api/') || !body) return;
    let j = body;
    try { if (typeof j === 'string') j = JSON.parse(j); } catch (_) { return; }
    const a = j && j.accessToken;
    if (!a || !Array.isArray(a.children)) return;
    const schoolName = a.schoolOptions?.schoolName || a.schoolSettings?.schoolName || '';
    for (const c of a.children) {
      if (!c?.childGuid) continue;
      post('FH_MASHOV_CHILD', {
        childGuid: c.childGuid, privateName: c.privateName || '', familyName: c.familyName || '',
        classCode: c.classCode || '', classNum: c.classNum == null ? '' : String(c.classNum), schoolName,
      });
    }
  }

  const XO = XMLHttpRequest.prototype.open, XS = XMLHttpRequest.prototype.send, XH = XMLHttpRequest.prototype.setRequestHeader;
  XMLHttpRequest.prototype.open = function (m, u) { this.__fhUrl = String(u || ''); return XO.apply(this, arguments); };
  XMLHttpRequest.prototype.setRequestHeader = function (n, v) { if (String(n).toLowerCase() === 'x-csrf-token') csrf(v); return XH.apply(this, arguments); };
  XMLHttpRequest.prototype.send = function () {
    const x = this;
    if ((x.__fhUrl || '').includes('/api/')) {
      x.addEventListener('load', () => {
        if (x.status !== 200) return;
        try { csrf(x.getResponseHeader('x-csrf-token')); } catch (_) {}
        let r = null;
        try { r = (x.responseType === '' || x.responseType === 'text') ? x.responseText : x.response; } catch (_) {}
        seen(x.__fhUrl, r);
      });
    }
    return XS.apply(this, arguments);
  };

  const F = window.fetch;
  if (F) {
    window.fetch = function (u, o) {
      const s = String(typeof u === 'string' ? u : (u && u.url) || '');
      try {
        const h = o && o.headers;
        if (h) {
          if (typeof h.get === 'function') csrf(h.get('x-csrf-token'));
          else for (const k in h) if (k.toLowerCase() === 'x-csrf-token') csrf(h[k]);
        }
      } catch (_) {}
      return F.apply(this, arguments).then(r => {
        if (s.includes('/api/') && r.status === 200) {
          try { csrf(r.headers.get('x-csrf-token')); } catch (_) {}
          r.clone().text().then(t => seen(s, t)).catch(() => {});
        }
        return r;
      });
    };
  }
})();
