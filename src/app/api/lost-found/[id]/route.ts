import { getDataProvider } from '@/lib/data';
import { apiSuccess, apiError } from '@/lib/http/apiResponse';
import { withApiErrors } from '@/lib/http/guard';
import { requireWriteAccess } from '@/lib/auth/rbac';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['OPEN', 'POTENTIAL_MATCH', 'VERIFIED', 'REUNITED', 'CLOSED'];

// Status transitions (potential-match, verified, reunited) require staff
// (command centre) sign-in — human verification is mandatory before any
// case is marked resolved, per the "no unrestricted matching" requirement.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return withApiErrors(async () => {
    requireWriteAccess();
    const body = (await req.json().catch(() => null)) as { status?: string } | null;
    if (!body?.status || !VALID_STATUSES.includes(body.status)) {
      return apiError('VALIDATION_ERROR', 'A valid status is required.');
    }
    const data = getDataProvider();
    const updated = await data.updateLostFoundStatus(params.id, body.status as never);
    if (!updated) return apiError('NOT_FOUND', 'That case could not be found.');
    return apiSuccess(updated);
  });
}
