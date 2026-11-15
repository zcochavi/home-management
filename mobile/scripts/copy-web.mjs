// Copies the FamilyHub web app (repo root) into mobile/www, which Capacitor
// bundles into the Android app. The web app stays the single source of truth.
import { cpSync, mkdirSync, rmSync, existsSync } from 'node:fs';
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
console.log(`copied web app into ${out}`);
