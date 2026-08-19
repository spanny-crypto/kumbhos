import { getDataProvider } from '@/lib/data';
import { apiSuccess, apiError } from '@/lib/http/apiResponse';
import { withApiErrors } from '@/lib/http/guard';
import { requireSession, requireWriteAccess } from '@/lib/auth/rbac';
import type { CreateIncidentInput } from '@/lib/data/provider';

export const dynamic = 'force-dynamic';

const VALID_TYPES = ['MEDICAL', 'FIRE', 'MISSING_PERSON', 'CROWD_SURGE', 'ACCIDENT', 'INFRASTRUCTURE_FAILURE', 'WATER_FLOOD', 'SECURITY', 'OTHER'];
const VALID_SEVERITIES = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'];

export async function GET() {
  return withApiErrors(async () => {
    requireSession();
    const data = getDataProvider();
    const incidents = await data.getIncidents();
    return apiSuccess(incidents);
  });
}

export async function POST(req: Request) {
  return withApiErrors(async () => {
    requireWriteAccess();
    const body = (await req.json().catch(() => null)) as Partial<CreateIncidentInput> | null;
    if (!body || !body.type || !body.severity || !body.zoneId || !body.description) {
      return apiError('VALIDATION_ERROR', 'type, severity, zoneId, and description are required.');
    }
    if (!VALID_TYPES.includes(body.type)) return apiError('VALIDATION_ERROR', 'Invalid incident type.');
    if (!VALID_SEVERITIES.includes(body.severity)) return apiError('VALIDATION_ERROR', 'Invalid severity.');
    if (body.description.length > 500) return apiError('VALIDATION_ERROR', 'Description is too long.');

    const data = getDataProvider();
    const zone = await data.getZone(body.zoneId);
    if (!zone) return apiError('VALIDATION_ERROR', 'Unknown zone.');

    const incident = await data.createIncident({
      type: body.type,
      severity: body.severity,
      zoneId: body.zoneId,
      description: body.description
    });
    return apiSuccess(incident);
  });
}
