/** @type {import('next').NextConfig} */

// OFFLINE_APP=true produces the fully static bundle that ships inside the
// Android app: no server, no API routes, no middleware. Data comes from the
// snapshot in src/lib/data/offlineStore.ts instead. The web deployment is
// unaffected and still builds as a normal server-rendered Next.js app.
const isOfflineApp = process.env.OFFLINE_APP === 'true';

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  ...(isOfflineApp
    ? {
        output: 'export',
        distDir: '.next-app',
        images: { unoptimized: true },
        // Static hosting inside a WebView serves directory/index.html, so
        // emit /live-map/index.html rather than /live-map.html.
        trailingSlash: true
      }
    : {
        async headers() {
          return [
            {
              source: '/command/:path*',
              headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]
            }
          ];
        }
      })
};

module.exports = nextConfig;
