import { getDataProvider } from '@/lib/data';
import { apiSuccess, apiError } from '@/lib/http/apiResponse';
import { withApiErrors } from '@/lib/http/guard';
import { requireSession, requireWriteAccess } from '@/lib/auth/rbac';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['NEW', 'ACKNOWLEDGED', 'DISPATCHED', 'RESPONDING', 'RESOLVED'];

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  return withApiErrors(async () => {
    requireSession();
    const data = getDataProvider();
    const incident = await data.getIncident(params.id);
    if (!incident) return apiError('NOT_FOUND', 'That incident could not be found.');
    return apiSuccess(incident);
  });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return withApiErrors(async () => {
    requireWriteAccess();
    const body = (await req.json().catch(() => null)) as { status?: string } | null;
    if (!body?.status || !VALID_STATUSES.includes(body.status)) {
      return apiError('VALIDATION_ERROR', 'A valid status is required.');
    }
    const data = getDataProvider();
    const updated = await data.updateIncidentStatus(params.id, body.status as never);
    if (!updated) return apiError('NOT_FOUND', 'That incident could not be found.');
    return apiSuccess(updated);
  });
}
