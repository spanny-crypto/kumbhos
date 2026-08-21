import type { MetadataRoute } from 'next';
import { env } from '@/lib/config/env';

// Next.js serves this automatically at /sitemap.xml. Only public,
// indexable routes are listed — /command/** and /login are deliberately
// excluded (see public/robots.txt and next.config.js's noindex header on
// /command/**), since they're staff-only and shouldn't be crawled at all.
const PUBLIC_ROUTES = [
  '',
  'billboard',
  'live-map',
  'crowd',
  'navigation',
  'facilities',
  'emergency',
  'lost-found',
  'events',
  'assistant',
  'data-sources'
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.appUrl.replace(/\/$/, '');
  const now = new Date();
  return PUBLIC_ROUTES.map((path) => ({
    url: path ? `${base}/${path}` : `${base}/`,
    lastModified: now,
    changeFrequency: 'hourly' as const,
    priority: path === '' ? 1 : 0.7
  }));
}
