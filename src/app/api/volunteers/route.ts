import { getDataProvider } from '@/lib/data';
import { apiSuccess } from '@/lib/http/apiResponse';
import { withApiErrors } from '@/lib/http/guard';
import { requireSession } from '@/lib/auth/rbac';

export const dynamic = 'force-dynamic';

export async function GET() {
  return withApiErrors(async () => {
    requireSession();
    const data = getDataProvider();
    const volunteers = await data.getVolunteers();
    return apiSuccess(volunteers);
  });
}
