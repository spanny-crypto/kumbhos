// Builds the fully static bundle that ships inside the Android app, then
// copies it into mobile/www where Capacitor picks it up.
//
// The web app has server-only pieces a static export cannot contain: the
// /api route handlers, the Command Centre (whose layout calls getSession()
// via next/headers), and the auth middleware. None of them belong in the
// public-facing mobile app anyway — the Command Centre is a staff tool, and
// the app reads its data from the bundled snapshot instead of the API. So
// they're moved aside for the duration of the export and put straight back,
// including on failure.
import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, renameSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const parked = join(root, '.app-build-parked');

// [source, parkedName] — things a static export cannot contain.
// /wristband/[id] is the page a *printed QR code* opens; those codes encode
// the live https:// URL, so that page only ever needs to exist on the web.
// Inside the app the band is shown directly after creation, and lookup by
// code reads from local storage.
const SERVER_ONLY = [
  [join(root, 'src', 'app', 'api'), 'api'],
  [join(root, 'src', 'app', 'command'), 'command'],
  [join(root, 'src', 'middleware.ts'), 'middleware.ts'],
  [join(root, 'src', 'app', 'sitemap.ts'), 'sitemap.ts'],
  [join(root, 'src', 'app', '(public)', 'wristband', '[id]'), 'wristband-id']
];

function park() {
  mkdirSync(parked, { recursive: true });
  for (const [src, name] of SERVER_ONLY) {
    if (existsSync(src)) renameSync(src, join(parked, name));
  }
}

function restore() {
  for (const [src, name] of SERVER_ONLY) {
    const held = join(parked, name);
    if (existsSync(held)) renameSync(held, src);
  }
  rmSync(parked, { recursive: true, force: true });
}

let failure;
park();
try {
  execSync('npx next build', {
    stdio: 'inherit',
    env: { ...process.env, OFFLINE_APP: 'true', NEXT_PUBLIC_OFFLINE_APP: 'true' }
  });
} catch (err) {
  failure = err;
} finally {
  restore();
}

if (failure) {
  console.error('\n[build-app] Export failed; server-only files have been restored.');
  process.exit(1);
}

const out = join(root, '.next-app');
const www = join(root, 'mobile', 'www');
rmSync(www, { recursive: true, force: true });
mkdirSync(www, { recursive: true });
cpSync(out, www, { recursive: true });

console.log('\n[build-app] Static app bundle copied to mobile/www');
