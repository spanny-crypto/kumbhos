import { getDataProvider } from '@/lib/data';
import { apiSuccess, apiError } from '@/lib/http/apiResponse';
import { withApiErrors } from '@/lib/http/guard';
import type { CreateLostFoundInput } from '@/lib/data/provider';

export const dynamic = 'force-dynamic';

const VALID_TYPES = ['LOST_PERSON', 'FOUND_PERSON', 'LOST_ITEM', 'FOUND_ITEM'];

// Publicly readable so the public Lost & Found page can show open cases for
// community awareness, but records are minimal (no photos/facial data) by
// design — see docs/SECURITY.md. Staff verification/reunification happens
// in the command centre.
export async function GET() {
  return withApiErrors(async () => {
    const data = getDataProvider();
    const cases = await data.getLostFoundCases();
    return apiSuccess(cases);
  });
}

export async function POST(req: Request) {
  return withApiErrors(async () => {
    const body = (await req.json().catch(() => null)) as Partial<CreateLostFoundInput> | null;
    if (!body || !body.type || !body.approximateZoneId || !body.description || !body.contactInfo) {
      return apiError('VALIDATION_ERROR', 'type, approximateZoneId, description, and contactInfo are required.');
    }
    if (!VALID_TYPES.includes(body.type)) return apiError('VALIDATION_ERROR', 'Invalid case type.');
    if (body.description.length > 500 || body.contactInfo.length > 200) {
      return apiError('VALIDATION_ERROR', 'Description or contact info is too long.');
    }

    const data = getDataProvider();
    const zone = await data.getZone(body.approximateZoneId);
    if (!zone) return apiError('VALIDATION_ERROR', 'Unknown zone.');

    const created = await data.createLostFoundCase({
      type: body.type,
      approximateZoneId: body.approximateZoneId,
      description: body.description,
      contactInfo: body.contactInfo
    });
    return apiSuccess(created);
  });
}
