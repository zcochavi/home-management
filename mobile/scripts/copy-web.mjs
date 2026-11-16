// Copies the FamilyHub web app (repo root) into mobile/www, which Capacitor
// bundles into the Android app. The web app stays the single source of truth.
import { cpSync, mkdirSync, rmSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const out  = join(root, 'mobile', 'www');
const files = [
  'index.html', 'app.js', 'styles.css', 'manifest.json', 'firebase-messaging-sw.js',
  'icon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'logo-mark.svg', '_ver.json',
];
const dirs = ['event-icons'];

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const f of files) if (existsSync(join(root, f))) cpSync(join(root, f), join(out, f));
for (const d of dirs)  if (existsSync(join(root, d))) cpSync(join(root, d), join(out, d), { recursive: true });
// Load Capacitor's runtime first in the app's copy of index.html, so the web app
// can reach native plugins (window.Capacitor.registerPlugin). The website itself
// never loads it — app.js only uses native plugins when Capacitor reports native.
cpSync(join(root, 'mobile', 'node_modules', '@capacitor', 'core', 'dist', 'capacitor.js'), join(out, 'capacitor.js'));
const indexPath = join(out, 'index.html');
const html = readFileSync(indexPath, 'utf8');
if (!html.includes('<head>')) throw new Error('index.html has no <head> to inject capacitor.js into');
writeFileSync(indexPath, html.replace('<head>', '<head>\n  <script src="capacitor.js"></script>'));

console.log(`copied web app into ${out}`);
