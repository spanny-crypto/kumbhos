import { getDataProvider } from '@/lib/data';
import { computeCrowdPressure } from '@/lib/risk/pressureIndex';
import { apiSuccess } from '@/lib/http/apiResponse';
import { withApiErrors } from '@/lib/http/guard';

export const dynamic = 'force-dynamic';

export async function GET() {
  return withApiErrors(async () => {
    const data = getDataProvider();
    const zones = await data.getZones();
    const zonesWithPressure = zones.map((zone) => ({ zone, pressure: computeCrowdPressure(zone) }));
    return apiSuccess(zonesWithPressure, { source: data.source === 'LIVE' ? 'LIVE' : 'SIMULATED' });
  });
}
