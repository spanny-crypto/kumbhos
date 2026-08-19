import { getSession } from '@/lib/auth/session';
import { apiSuccess } from '@/lib/http/apiResponse';
import { withApiErrors } from '@/lib/http/guard';

export const dynamic = 'force-dynamic';

export async function GET() {
  return withApiErrors(async () => {
    const session = getSession();
    return apiSuccess(session ? { authenticated: true, name: session.name, role: session.role } : { authenticated: false });
  });
}
