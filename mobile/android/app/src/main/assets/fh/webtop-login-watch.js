// Webtop login screen (WebtopLoginActivity): notices when the parent is logged in and Webtop
// has listed their children (dashboard/InitDashboard or PupilCard/GetSettingsList), and tells
// the screen how many — it then closes by itself and the app fetches every child's homework
// (see _wtDiscoverStudents in app.js), so the parent doesn't open each child's page.
// A student's own login lists no children: nothing is reported and the screen stays open.
(function () {
  if (window.__fhLoginWatch) return;
  window.__fhLoginWatch = 1;
  var reported = false;
  function check(url, text) {
    if (reported || !/dashboard\/InitDashboard|PupilCard\/GetSettingsList/i.test(url || '')) return;
    try {
      var d = (JSON.parse(text || '') || {}).data || {};
      var kids = d.childrens || d.children || [];
      if (Array.isArray(kids) && kids.length) { reported = true; FHWebtop.onKidsListed(kids.length); }
    } catch (e) {}
  }
  var of = window.fetch;
  if (of) {
    window.fetch = function (u) {
      var url = (typeof u === 'string' ? u : (u && u.url)) || '';
      return of.apply(this, arguments).then(function (r) {
        if (r.status === 200 && /InitDashboard|GetSettingsList/i.test(url)) r.clone().text().then(function (t) { check(url, t); }).catch(function () {});
        return r;
      });
    };
  }
  var oo = XMLHttpRequest.prototype.open, os = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (m, u) { this.__fhWU = String(u || ''); return oo.apply(this, arguments); };
  XMLHttpRequest.prototype.send = function () {
    var x = this;
    if (/InitDashboard|GetSettingsList/i.test(x.__fhWU || '')) {
      x.addEventListener('load', function () {
        if (x.status !== 200) return;
        var t = null;
        try { t = (x.responseType === '' || x.responseType === 'text') ? x.responseText : (x.responseType === 'json' ? JSON.stringify(x.response) : null); } catch (e) {}
        check(x.__fhWU, t);
      });
    }
    return os.apply(this, arguments);
  };
})();
