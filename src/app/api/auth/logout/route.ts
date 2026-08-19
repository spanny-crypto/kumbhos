import { cookies } from 'next/headers';
import { SESSION_COOKIE } from '@/lib/auth/session';
import { apiSuccess } from '@/lib/http/apiResponse';
import { withApiErrors } from '@/lib/http/guard';

export const dynamic = 'force-dynamic';

export async function POST() {
  return withApiErrors(async () => {
    cookies().delete(SESSION_COOKIE);
    return apiSuccess({ loggedOut: true });
  });
}
