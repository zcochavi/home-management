// Diagnostic recording for the Webtop login screen (WebtopLoginActivity).
// Records the shape of every API request Webtop's own site makes — address, request body
// and response — so we can learn how the site gets each child's homework parameters and
// later fetch them without the parent opening every child's page.
// Personal data is masked: text becomes s<length>#<fingerprint> (the same value always gets
// the same fingerprint, so a value can be followed from one request to another without
// revealing it); numbers of 1000 and up become n#<fingerprint>; small numbers, booleans and
// field names stay. Identical requests (same address and body) are kept at most 3 times.
(function () {
  if (window.__fhTrace) return;
  window.__fhTrace = 1;
  var t0 = Date.now(), seen = {};

  function fp(str) {
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return ('00000' + h.toString(16)).slice(-6);
  }
  function mask(v, depth) {
    if (v === null || typeof v === 'boolean') return v;
    if (typeof v === 'number') return (Number.isInteger(v) && Math.abs(v) < 1000) ? v : 'n#' + fp(String(v));
    if (typeof v === 'string') return 's' + v.length + '#' + fp(v);
    if (depth > 5) return '…';
    if (Array.isArray(v)) {
      var out = { _array: v.length };
      if (v.length) out.first = mask(v[0], depth + 1);
      if (v.length > 1) out.second = mask(v[1], depth + 1);
      return out;
    }
    if (typeof v === 'object') {
      var o = {}, keys = Object.keys(v).slice(0, 60);
      for (var k = 0; k < keys.length; k++) o[keys[k]] = mask(v[keys[k]], depth + 1);
      return o;
    }
    return typeof v;
  }
  function parse(text) {
    if (text == null || text === '') return null;
    try { return mask(JSON.parse(text), 0); } catch (e) { return 'text' + String(text).length; }
  }
  function cleanUrl(u) {
    try {
      var x = new URL(u, location.href);
      var q = []; x.searchParams.forEach(function (_, k) { q.push(k); });
      return x.origin + x.pathname + (q.length ? '?' + q.join('&') : '');
    } catch (e) { return String(u).split('?')[0]; }
  }
  function wanted(u) { return /smartschool|\/api\//i.test(u); }
  function record(method, url, body, status, resText) {
    try {
      var cu = cleanUrl(url), req = parse(body);
      var key = method + ' ' + cu + ' ' + JSON.stringify(req); // identical requests only
      seen[key] = (seen[key] || 0) + 1;
      if (seen[key] > 3) return;
      var entry = { t: Date.now() - t0, m: method, u: cu, st: status, req: req, res: parse(resText) };
      var s = JSON.stringify(entry);
      if (s.length > 6000) { entry.res = '(large: ' + s.length + ')'; s = JSON.stringify(entry); }
      FHWebtop.onTrace(s);
    } catch (e) {}
  }

  var of = window.fetch;
  if (of) {
    window.fetch = function (u, o) {
      var url = (typeof u === 'string' ? u : (u && u.url)) || '';
      var method = (o && o.method) || (u && u.method) || 'GET';
      var body = o && typeof o.body === 'string' ? o.body : null;
      return of.apply(this, arguments).then(function (r) {
        if (wanted(url)) r.clone().text().then(function (txt) { record(method, url, body, r.status, txt); }).catch(function () {});
        return r;
      });
    };
  }
  var oo = XMLHttpRequest.prototype.open, os = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (m, u) { this.__fhM = m; this.__fhU = String(u || ''); return oo.apply(this, arguments); };
  XMLHttpRequest.prototype.send = function (b) {
    var x = this;
    if (wanted(x.__fhU || '')) {
      x.addEventListener('load', function () {
        var txt = null;
        try { txt = (x.responseType === '' || x.responseType === 'text') ? x.responseText : (x.responseType === 'json' ? JSON.stringify(x.response) : null); } catch (e) {}
        record(x.__fhM || 'GET', x.__fhU, typeof b === 'string' ? b : null, x.status, txt);
      });
    }
    return os.apply(this, arguments);
  };
})();
