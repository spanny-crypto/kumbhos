import { getDataProvider } from '@/lib/data';
import { computeCrowdPressure } from '@/lib/risk/pressureIndex';
import { predictCrowdPressure } from '@/lib/risk/prediction';
import { apiSuccess, apiError } from '@/lib/http/apiResponse';
import { withApiErrors } from '@/lib/http/guard';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  return withApiErrors(async () => {
    const data = getDataProvider();
    const zone = await data.getZone(params.id);
    if (!zone) return apiError('NOT_FOUND', 'That zone could not be found.');
    return apiSuccess({
      zone,
      pressure: computeCrowdPressure(zone),
      prediction: predictCrowdPressure(zone)
    });
  });
}
