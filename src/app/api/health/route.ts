import { isAiConfigured, isDemoMode, isSupabaseLostFoundConfigured, env } from '@/lib/config/env';
import { lostFoundBackup } from '@/lib/data/lostFoundBackup';
import { apiSuccess } from '@/lib/http/apiResponse';

export const dynamic = 'force-dynamic';

type DependencyStatus = 'OK' | 'DEGRADED' | 'OFFLINE' | 'DEMO';

async function checkAi(): Promise<DependencyStatus> {
  if (!isAiConfigured()) return 'DEMO';
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${env.ai.baseUrl!.replace(/\/$/, '')}/models`, { signal: controller.signal }).catch(() => null);
    clearTimeout(timer);
    return res && res.ok ? 'OK' : 'DEGRADED';
  } catch {
    return 'DEGRADED';
  }
}

async function checkLostFoundBackup(): Promise<DependencyStatus> {
  if (!isSupabaseLostFoundConfigured()) return 'DEMO';
  // A real read against the table doubles as a connectivity + table-exists
  // check — lostFoundBackup.list() already returns null (not a throw) on
  // any failure, which we surface as DEGRADED rather than crashing.
  const result = await lostFoundBackup.list();
  return result !== null ? 'OK' : 'DEGRADED';
}

export async function GET() {
  const demo = isDemoMode();
  const [aiStatus, lostFoundStatus] = await Promise.all([checkAi(), checkLostFoundBackup()]);

  return apiSuccess({
    mode: demo ? 'DEMO' : 'LIVE',
    dependencies: {
      database: demo ? 'DEMO' : 'OK',
      lostFoundBackup: lostFoundStatus,
      ai: aiStatus,
      maps: 'OK', // MapLibre + OSM tiles, no key required
      governmentSources: 'DEGRADED' // adapters stubbed, see /data-sources
    },
    timestamp: new Date().toISOString()
  });
}
