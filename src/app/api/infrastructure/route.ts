import { getDataProvider } from '@/lib/data';
import { apiSuccess } from '@/lib/http/apiResponse';
import { withApiErrors } from '@/lib/http/guard';

export const dynamic = 'force-dynamic';

export async function GET() {
  return withApiErrors(async () => {
    const data = getDataProvider();
    const assets = await data.getInfrastructure();
    return apiSuccess(assets);
  });
}
