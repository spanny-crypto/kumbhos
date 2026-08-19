import { getDataProvider } from '@/lib/data';
import { computeSanitationPressure } from '@/lib/risk/sanitationPressure';
import { apiSuccess } from '@/lib/http/apiResponse';
import { withApiErrors } from '@/lib/http/guard';
import type { Toilet } from '@/lib/data/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  return withApiErrors(async () => {
    const data = getDataProvider();
    const toilets = await data.getToilets();

    const byCluster = new Map<string, Toilet[]>();
    for (const t of toilets) {
      const list = byCluster.get(t.clusterId) ?? [];
      list.push(t);
      byCluster.set(t.clusterId, list);
    }
    const pressure = Array.from(byCluster.entries()).map(([clusterId, list]) => computeSanitationPressure({ clusterId, toilets: list }));

    return apiSuccess({ toilets, pressure });
  });
}
