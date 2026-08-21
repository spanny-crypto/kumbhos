import type { Metadata } from 'next';
import './globals.css';
import { env } from '@/lib/config/env';

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
    <html lang="en">
      <body className="min-h-screen bg-paper-bg font-sans text-paper-text antialiased">{children}</body>
    </html>
  );
}
