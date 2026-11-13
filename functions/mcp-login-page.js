// The sign-in + consent page of the Claude connector (served at /authorize by mcp.js).
// The browser signs in with Firebase Auth, then sends its ID token to /authorize/identity and
// /authorize/approve — the page itself never sees an OAuth code until the final redirect.
'use strict';

const FIREBASE_CONFIG = {
  apiKey:     'AIzaSyAlaDotuWTCk3GDqpgY-tEaNkpDrbOKM6M',
  authDomain: 'familyhub-7fdd5.firebaseapp.com',
  projectId:  'familyhub-7fdd5',
};

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// JSON that is safe to place inside a <script> element.
const scriptJson = v => JSON.stringify(v).replace(/[<\u2028\u2029]/g, c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));

const LOGO = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="96 104 320 310" aria-hidden="true"><path d="M104 244 L256 122 L408 244" fill="none" stroke="#fff" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/><circle cx="190" cy="290" r="28" fill="#fff"/><circle cx="322" cy="290" r="28" fill="#fff"/><circle cx="256" cy="268" r="34" fill="#FFD166"/><path d="M148 400 a42 42 0 0 1 84 0Z M280 400 a42 42 0 0 1 84 0Z" fill="#fff"/><path d="M212 400 a44 44 0 0 1 88 0Z" fill="#FFD166"/></svg>';

const GOOGLE_G = '<svg viewBox="0 0 18 18" aria-hidden="true"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.96 10.71a5.41 5.41 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l3-2.33z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58z"/></svg>';

const STYLE = `
:root{--primary-500:#6C8CFF;--primary-600:#5A78E6;--primary-700:#4A65CC;--primary-50:#F0F4FF;--primary-100:#E8EDFF;
  --error:#E05353;--error-bg:#FDF0F0;--gray-900:#1F2937;--gray-700:#374151;--gray-500:#6B7280;--gray-300:#D1D5DB;--gray-200:#E5E7EB;
  --bg:#EBF0FA;--surface:#fff}
*{box-sizing:border-box}
html,body{margin:0}
body{font-family:'Heebo','Inter',system-ui,sans-serif;background:var(--bg);color:var(--gray-900);min-height:100vh;
  display:flex;align-items:center;justify-content:center;padding:24px 16px;line-height:1.5}
.card{width:100%;max-width:400px;background:var(--surface);border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(74,101,204,.14)}
.head{background:linear-gradient(135deg,var(--primary-500),var(--primary-700));color:#fff;padding:24px;display:flex;align-items:center;gap:14px}
.head svg{width:44px;height:44px;flex:none}
.head h1{margin:0;font-size:19px;font-weight:800;line-height:1.3}
.body{padding:24px}
.view[hidden]{display:none}
p{margin:0 0 16px}
.muted{color:var(--gray-500);font-size:14px}
.btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;min-height:48px;padding:10px 16px;border-radius:12px;
  border:1.5px solid transparent;font:inherit;font-weight:700;font-size:16px;cursor:pointer;transition:background .15s,border-color .15s}
.btn:disabled{opacity:.55;cursor:default}
.btn-primary{background:var(--primary-500);color:#fff}
.btn-primary:hover:not(:disabled){background:var(--primary-600)}
.btn-outline{background:#fff;color:var(--gray-900);border-color:var(--gray-300)}
.btn-outline:hover:not(:disabled){background:var(--primary-50);border-color:var(--primary-500)}
.btn-text{background:none;color:var(--gray-500);font-weight:500;min-height:40px}
.btn-text:hover:not(:disabled){color:var(--gray-900)}
.btn svg{width:18px;height:18px;flex:none}
.btn:focus-visible,input:focus-visible{outline:3px solid var(--primary-100);outline-offset:1px;border-color:var(--primary-500)}
.or{display:flex;align-items:center;gap:12px;color:var(--gray-500);font-size:13px;margin:18px 0}
.or::before,.or::after{content:'';flex:1;height:1px;background:var(--gray-200)}
label.field{display:block;font-size:14px;font-weight:500;color:var(--gray-700);margin-bottom:12px}
input[type=email],input[type=password]{display:block;width:100%;margin-top:4px;min-height:46px;padding:10px 12px;border:1.5px solid var(--gray-300);
  border-radius:12px;font:inherit;font-size:16px;direction:ltr;text-align:left;background:#fff;color:inherit}
.err{background:var(--error-bg);color:var(--error);border-radius:12px;padding:10px 12px;font-size:14px;margin-bottom:16px}
.err:empty{display:none}
.who{background:var(--primary-50);border-radius:12px;padding:12px 14px;margin-bottom:18px;font-size:14px}
.who b{display:block;font-size:16px}
h2{font-size:17px;margin:0 0 10px}
ul.perms{margin:0 0 14px;padding:0;list-style:none}
ul.perms li{position:relative;padding-inline-start:26px;margin-bottom:8px;font-size:15px}
ul.perms li::before{content:'✓';position:absolute;inset-inline-start:2px;top:0;color:var(--primary-500);font-weight:800}
fieldset{border:0;margin:0 0 18px;padding:0}
legend{font-weight:700;font-size:15px;padding:0;margin-bottom:8px}
.pick{display:flex;align-items:center;gap:10px;padding:11px 12px;border:1.5px solid var(--gray-200);border-radius:12px;margin-bottom:8px;cursor:pointer}
.pick:has(input:checked){border-color:var(--primary-500);background:var(--primary-50)}
.pick input{width:18px;height:18px;accent-color:var(--primary-500);margin:0}
.actions{display:grid;gap:8px;margin-top:6px}
.spinner{width:34px;height:34px;border-radius:50%;border:4px solid var(--primary-100);border-top-color:var(--primary-500);margin:20px auto;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.spinner{animation-duration:2.4s}.btn{transition:none}}
`;

function shell(bodyHtml, script = '') {
  return `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>חיבור Claude ל‑FamilyHub</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700;800&display=swap" rel="stylesheet">
<style>${STYLE}</style>
</head>
<body>
<main class="card">
  <div class="head">${LOGO}<h1>חיבור <bdi>Claude</bdi> ל‑<bdi>FamilyHub</bdi></h1></div>
  <div class="body">${bodyHtml}</div>
</main>
${script}
</body>
</html>`;
}

function renderErrorPage(message) {
  return shell(`<p>${esc(message)}</p>`);
}

function renderLoginPage({ clientName, redirectHost, params }) {
  const body = `
    <div class="view" id="vLoading"><div class="spinner" role="status" aria-label="טוען"></div></div>

    <div class="view" id="vLogin" hidden>
      <p>התחברו עם החשבון שלכם ב‑<bdi>FamilyHub</bdi> כדי ש‑<bdi>${esc(clientName)}</bdi> יוכל להוסיף מתכונים ואירועים למשפחה.</p>
      <div class="err" id="loginErr" role="alert"></div>
      <button class="btn btn-outline" id="googleBtn" type="button">${GOOGLE_G}<span>המשך עם Google</span></button>
      <div class="or">או</div>
      <form id="emailForm" novalidate>
        <label class="field">אימייל<input type="email" id="email" autocomplete="username" required></label>
        <label class="field">סיסמה<input type="password" id="pwd" autocomplete="current-password" required></label>
        <button class="btn btn-primary" id="emailBtn" type="submit">התחברות</button>
      </form>
    </div>

    <div class="view" id="vConsent" hidden>
      <div class="who"><b id="whoFamily"></b><span id="whoEmail" dir="ltr"></span></div>
      <h2>לאשר ל‑<bdi>${esc(clientName)}</bdi>:</h2>
      <ul class="perms">
        <li>להוסיף מתכונים לרשימות של המשפחה</li>
        <li>לפרסם בשמך אירועים בקהילת הכיתה (ללא חברות בוועד — באישור הוועד)</li>
        <li>לראות את שמות בני המשפחה והכיתות של הילדים</li>
      </ul>
      <p class="muted"><bdi>${esc(clientName)}</bdi> לא יוכל לערוך או למחוק תוכן קיים.</p>
      <fieldset id="memberPick" hidden>
        <legend>על שם מי יירשמו הפעולות?</legend>
        <div id="memberList"></div>
      </fieldset>
      <p class="muted" id="memberFixed" hidden></p>
      <div class="err" id="consentErr" role="alert"></div>
      <div class="actions">
        <button class="btn btn-primary" id="approveBtn" type="button">אישור וחיבור</button>
        <button class="btn btn-outline" id="cancelBtn" type="button">ביטול</button>
        <button class="btn btn-text" id="switchBtn" type="button">התחברות עם חשבון אחר</button>
      </div>
      <p class="muted" style="margin:14px 0 0;text-align:center">לאחר האישור תועברו אל <bdi dir="ltr">${esc(redirectHost)}</bdi></p>
    </div>

    <div class="view" id="vBlocked" hidden>
      <div class="err" id="blockedMsg" role="alert"></div>
      <div class="actions">
        <button class="btn btn-outline" id="blockedSwitchBtn" type="button">התחברות עם חשבון אחר</button>
      </div>
    </div>`;

  const script = `
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
<script>
(function () {
  var CFG = ${scriptJson({ firebase: FIREBASE_CONFIG, params })};
  var $ = function (id) { return document.getElementById(id); };
  var views = ['vLoading', 'vLogin', 'vConsent', 'vBlocked'];
  function show(id) { views.forEach(function (v) { $(v).hidden = v !== id; }); }

  var AUTH_ERRORS = {
    'auth/wrong-password': 'האימייל או הסיסמה שגויים',
    'auth/user-not-found': 'האימייל או הסיסמה שגויים',
    'auth/invalid-credential': 'האימייל או הסיסמה שגויים',
    'auth/invalid-login-credentials': 'האימייל או הסיסמה שגויים',
    'auth/invalid-email': 'כתובת האימייל אינה תקינה',
    'auth/too-many-requests': 'יותר מדי ניסיונות. נסו שוב בעוד כמה דקות',
    'auth/network-request-failed': 'אין חיבור לרשת. נסו שוב'
  };
  var BLOCKED = {
    no_family: 'לחשבון הזה אין משפחה ב‑FamilyHub. פתחו משפחה באפליקציה, או התחברו עם החשבון שבו אתם משתמשים שם.',
    parents_only: 'רק הורים יכולים לחבר את Claude למשפחה.'
  };
  function authError(e) { return AUTH_ERRORS[e && e.code] || 'ההתחברות נכשלה. נסו שוב'; }

  if (typeof firebase === 'undefined') {
    $('blockedMsg').textContent = 'לא ניתן לטעון את רכיב ההתחברות. בדקו את החיבור לרשת ורעננו את הדף.';
    $('blockedSwitchBtn').hidden = true;
    return show('vBlocked');
  }
  firebase.initializeApp(CFG.firebase);
  var auth = firebase.auth();
  var pendingLoginMsg = '';

  function post(path, data) {
    return fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, body: j }; }); });
  }
  function signOutToLogin(msg) { pendingLoginMsg = msg || ''; return auth.signOut(); }

  function loadIdentity(user) {
    show('vLoading');
    user.getIdToken().then(function (idToken) { return post('/authorize/identity', { idToken: idToken }); })
      .then(function (r) {
        if (r.ok) return showConsent(r.body);
        if (r.body.error === 'login_required') return signOutToLogin('לצורך אבטחה יש להתחבר מחדש.');
        $('blockedMsg').textContent = BLOCKED[r.body.error] || 'אירעה שגיאה. נסו שוב מאוחר יותר.';
        show('vBlocked');
      })
      .catch(function () {
        $('blockedMsg').textContent = 'אין חיבור לשרת. בדקו את החיבור לרשת ונסו שוב.';
        show('vBlocked');
      });
  }

  function showConsent(info) {
    $('whoFamily').textContent = info.familyName ? 'משפחת ' + info.familyName : 'המשפחה שלך';
    $('whoEmail').textContent = info.email || '';
    $('consentErr').textContent = '';
    var list = $('memberList');
    list.textContent = '';
    $('memberPick').hidden = !!info.memberName;
    $('memberFixed').hidden = !info.memberName;
    if (info.memberName) {
      $('memberFixed').textContent = 'הפעולות יירשמו על שם ' + info.memberName + '.';
    } else {
      info.parents.forEach(function (name, i) {
        var label = document.createElement('label');
        label.className = 'pick';
        var input = document.createElement('input');
        input.type = 'radio'; input.name = 'member'; input.value = name;
        input.checked = info.parents.length === 1 && i === 0;
        var span = document.createElement('span');
        span.textContent = name;
        input.addEventListener('change', function () { $('consentErr').textContent = ''; });
        label.appendChild(input); label.appendChild(span);
        list.appendChild(label);
      });
    }
    $('approveBtn').disabled = false;
    show('vConsent');
  }

  $('approveBtn').addEventListener('click', function () {
    var picked = document.querySelector('input[name=member]:checked');
    if (!$('memberPick').hidden && !picked) { $('consentErr').textContent = 'בחרו על שם מי יירשמו הפעולות.'; return; }
    var user = auth.currentUser;
    if (!user) return show('vLogin');
    $('approveBtn').disabled = true;
    $('consentErr').textContent = '';
    user.getIdToken().then(function (idToken) {
      return post('/authorize/approve', Object.assign({ idToken: idToken, memberName: picked ? picked.value : null }, CFG.params));
    }).then(function (r) {
      if (r.ok && r.body.redirect) {
        show('vLoading');
        leaving = true;
        return auth.signOut().catch(function () {}).then(function () { location.replace(r.body.redirect); });
      }
      if (r.body.error === 'login_required') return signOutToLogin('לצורך אבטחה יש להתחבר מחדש.');
      $('consentErr').textContent = r.body.error === 'invalid_client'
        ? 'פג תוקף הבקשה. חזרו ל‑Claude ונסו לחבר שוב.' : 'אירעה שגיאה. נסו שוב.';
      $('approveBtn').disabled = false;
    }).catch(function () {
      $('consentErr').textContent = 'אין חיבור לשרת. נסו שוב.';
      $('approveBtn').disabled = false;
    });
  });

  var leaving = false;
  $('cancelBtn').addEventListener('click', function () {
    var u = new URL(CFG.params.redirect_uri);
    u.searchParams.set('error', 'access_denied');
    u.searchParams.set('error_description', 'The user cancelled the connection.');
    if (CFG.params.state) u.searchParams.set('state', CFG.params.state);
    leaving = true;
    show('vLoading');
    auth.signOut().catch(function () {}).then(function () { location.replace(u.toString()); });
  });
  $('switchBtn').addEventListener('click', function () { signOutToLogin(''); });
  $('blockedSwitchBtn').addEventListener('click', function () { signOutToLogin(''); });

  $('googleBtn').addEventListener('click', function () {
    $('loginErr').textContent = '';
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    auth.signInWithPopup(provider).catch(function (e) {
      var code = e && e.code;
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return;
      // In-app browsers often refuse popups — fall back to a full-page redirect.
      if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
        return auth.signInWithRedirect(provider);
      }
      $('loginErr').textContent = authError(e);
    });
  });

  $('emailForm').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var email = $('email').value.trim(), pwd = $('pwd').value;
    if (!email || !pwd) { $('loginErr').textContent = 'יש להזין אימייל וסיסמה'; return; }
    $('loginErr').textContent = '';
    $('emailBtn').disabled = true;
    auth.signInWithEmailAndPassword(email, pwd)
      .catch(function (e) { $('loginErr').textContent = authError(e); })
      .then(function () { $('emailBtn').disabled = false; });
  });

  // The session lives only in this tab, and is ended as soon as the connection is approved.
  auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
    .then(function () { return auth.getRedirectResult(); })
    .catch(function (e) { pendingLoginMsg = authError(e); })
    .then(function () {
      auth.onAuthStateChanged(function (user) {
        if (leaving) return;
        if (user && !user.isAnonymous) return loadIdentity(user);
        $('loginErr').textContent = pendingLoginMsg;
        pendingLoginMsg = '';
        $('pwd').value = '';
        show('vLogin');
      });
    });
})();
</script>`;

  return shell(body, script);
}

module.exports = { renderLoginPage, renderErrorPage };
