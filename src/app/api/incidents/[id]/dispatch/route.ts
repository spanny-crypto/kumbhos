import { getDataProvider } from '@/lib/data';
import { recommendDispatch } from '@/lib/risk/dispatch';
import { apiSuccess, apiError } from '@/lib/http/apiResponse';
import { withApiErrors } from '@/lib/http/guard';
import { requireSession, requireWriteAccess } from '@/lib/auth/rbac';

export const dynamic = 'force-dynamic';

// GET returns a recommendation only (no side effects) — the operator reviews
// it before confirming. POST performs the actual assignment, requiring the
// human confirmation the spec mandates for all dispatch actions.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  return withApiErrors(async () => {
    requireSession();
    const data = getDataProvider();
    const incident = await data.getIncident(params.id);
    if (!incident) return apiError('NOT_FOUND', 'That incident could not be found.');
    const [teams, facilities, volunteers] = await Promise.all([data.getResponseTeams(), data.getInfrastructure(), data.getVolunteers()]);
    return apiSuccess(recommendDispatch(incident, teams, facilities, volunteers));
  });
}

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  return withApiErrors(async () => {
    requireWriteAccess();
    const data = getDataProvider();
    const incident = await data.getIncident(params.id);
    if (!incident) return apiError('NOT_FOUND', 'That incident could not be found.');
    const [teams, facilities, volunteers] = await Promise.all([data.getResponseTeams(), data.getInfrastructure(), data.getVolunteers()]);
    const recommendation = recommendDispatch(incident, teams, facilities, volunteers);
    const updated = await data.assignIncident(params.id, recommendation.team?.id ?? null, recommendation.volunteer?.id ?? null);
    return apiSuccess({ incident: updated, recommendation });
  });
}
