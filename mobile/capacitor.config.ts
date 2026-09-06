import type { CapacitorConfig } from '@capacitor/cli';

// Fully offline app: www/ holds a static export of the site with the entire
// dataset baked into the JS bundle (see scripts/build-app.mjs and
// src/lib/data/offlineStore.ts). Nothing is fetched at runtime, so there is
// no spinner, no refetch loop, and no dependency on network or on the
// Netlify deployment being up. Rebuild with `npm run build:app` after
// changing the site.
const config: CapacitorConfig = {
  appId: 'com.kumbhos.app',
  appName: 'KumbhOS',
  webDir: 'www',
  android: {
    allowMixedContent: false
  }
};

export default config;
