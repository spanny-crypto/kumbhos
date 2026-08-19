import { isAiConfigured, isDemoMode, env } from '@/lib/config/env';
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

export async function GET() {
  const demo = isDemoMode();
  const aiStatus = await checkAi();

  return apiSuccess({
    mode: demo ? 'DEMO' : 'LIVE',
    dependencies: {
      database: demo ? 'DEMO' : 'OK',
      ai: aiStatus,
      maps: 'OK', // MapLibre + OSM tiles, no key required
      governmentSources: 'DEGRADED' // adapters stubbed, see /data-sources
    },
    timestamp: new Date().toISOString()
  });
}
