import { isDemoMode } from '@/lib/config/env';
import type { DataProvider } from './provider';
import { DemoDataProvider } from './demoProvider';

let cached: DataProvider | null = null;

/**
 * Single entry point for every API route. Picks Supabase only when live
 * credentials are configured and demo mode isn't forced; otherwise falls
 * back to the in-memory demo provider and logs why, so a missing/misconfigured
 * credential degrades gracefully instead of crashing requests.
 */
export function getDataProvider(): DataProvider {
  if (cached) return cached;

  if (!isDemoMode()) {
    try {
      // Lazily require so the Supabase client is never constructed (and
      // never even imported) when running in demo mode.
      const { SupabaseDataProvider } = require('./supabaseProvider') as typeof import('./supabaseProvider');
      cached = new SupabaseDataProvider();
      return cached;
    } catch (err) {
      console.error('[KumbhOS] Supabase provider unavailable, falling back to demo data:', err instanceof Error ? err.message : err);
    }
  }

  cached = new DemoDataProvider();
  return cached;
}

export type { DataProvider } from './provider';
export * from './types';
