import type { Metadata } from 'next';
import { Figtree, EB_Garamond } from 'next/font/google';
import './globals.css';
import { env } from '@/lib/config/env';

// next/font self-hosts these at build time (downloaded once, served from
// our own domain, subset + inlined font-display: swap) — no runtime request
// to Google's font CDN and no layout shift while the font loads. This is
// the fast path, not a `<link>` tag to fonts.googleapis.com.
const figtree = Figtree({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const ebGaramond = EB_Garamond({ subsets: ['latin'], variable: '--font-serif', display: 'swap' });

// metadataBase turns every relative URL below (and any relative og:image
// etc. added later) into an absolute one using the deployment's real public
// URL — required for Open Graph/Twitter previews and for search engines to
// resolve canonical links correctly. Falls back to localhost in dev, but
// NEXT_PUBLIC_APP_URL must be set to the real deployed domain in production
// (see .env.example) or these tags will silently point at localhost.
const siteName = 'KumbhOS';
const title = 'KumbhOS — Predictive Crowd & Infrastructure Intelligence';
const description = 'See the pressure before it becomes a problem. A predictive crowd and infrastructure intelligence platform for large gatherings.';

export const metadata: Metadata = {
  metadataBase: new URL(env.appUrl),
  title: { default: title, template: `%s — ${siteName}` },
  description,
  applicationName: siteName,
  keywords: ['KumbhOS', 'Kumbh Mela', 'crowd management', 'crowd intelligence', 'crowd safety', 'infrastructure monitoring', 'Prayagraj'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName,
    title,
    description,
    url: '/'
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description
  },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${figtree.variable} ${ebGaramond.variable}`}>
      <body className="min-h-screen bg-paper-bg font-sans text-paper-text antialiased">{children}</body>
    </html>
  );
}
