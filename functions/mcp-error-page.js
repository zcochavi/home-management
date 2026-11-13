// The one page the Claude connector serves itself: shown when a connection link is invalid.
// (Approving a connection happens inside the app, on its "Connected apps" screen.)
'use strict';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function renderErrorPage(message, appUrl) {
  return `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>FamilyHub</title>
<style>
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px 16px;
  font-family:'Heebo',system-ui,sans-serif;background:#EBF0FA;color:#1F2937;line-height:1.5}
main{max-width:400px;background:#fff;border-radius:20px;padding:24px;box-shadow:0 8px 32px rgba(74,101,204,.14)}
h1{font-size:19px;margin:0 0 10px}
p{margin:0 0 16px}
a{color:#4A65CC;font-weight:700}
</style>
</head>
<body>
<main>
  <h1>חיבור <bdi>Claude</bdi> ל‑<bdi>FamilyHub</bdi></h1>
  <p>${esc(message)}</p>
  <a href="${esc(appUrl)}">פתיחת FamilyHub</a>
</main>
</body>
</html>`;
}

module.exports = { renderErrorPage };
