import { getDataProvider } from '@/lib/data';
import { apiSuccess, apiError } from '@/lib/http/apiResponse';
import { withApiErrors } from '@/lib/http/guard';
import { requireSession } from '@/lib/auth/rbac';
import type { CreateWristbandInput } from '@/lib/data/provider';

export const dynamic = 'force-dynamic';

const PHONE_PATTERN = /^[0-9+()\-\s]{7,20}$/;

// Only staff can browse the full roster (mirrors /api/incidents) — a public
// list would defeat the point of requiring the specific printed/scanned id
// to look someone up. See /api/wristbands/[id] for the public single-record
// lookup a QR scan actually uses.
export async function GET() {
  return withApiErrors(async () => {
    requireSession();
    const data = getDataProvider();
    const profiles = await data.getWristbandProfiles();
    return apiSuccess(profiles);
  });
}

// Public and unauthenticated on purpose — any guardian at the event should
// be able to create a wristband from their own phone with zero sign-in, the
// same way the public Lost & Found report works.
export async function POST(req: Request) {
  return withApiErrors(async () => {
    const body = (await req.json().catch(() => null)) as Partial<CreateWristbandInput> | null;
    if (!body || !body.fullName || !body.guardianName || !body.guardianPhone) {
      return apiError('VALIDATION_ERROR', 'fullName, guardianName, and guardianPhone are required.');
    }
    if (body.fullName.length > 100 || body.guardianName.length > 100) {
      return apiError('VALIDATION_ERROR', 'Name is too long.');
    }
    if (!PHONE_PATTERN.test(body.guardianPhone)) {
      return apiError('VALIDATION_ERROR', 'Enter a valid guardian phone number.');
    }
    if (body.age !== null && body.age !== undefined && (typeof body.age !== 'number' || body.age < 0 || body.age > 120)) {
      return apiError('VALIDATION_ERROR', 'Age must be a number between 0 and 120.');
    }
    if (body.medicalNotes && body.medicalNotes.length > 500) {
      return apiError('VALIDATION_ERROR', 'Medical notes are too long.');
    }

    if (body.meetingPointZoneId && body.meetingPointZoneId.length > 100) {
      return apiError('VALIDATION_ERROR', 'Meeting point is too long.');
    }

    // meetingPointZoneId is a free-text place name (e.g. a real Nashik
    // landmark picked from NASHIK_LANDMARKS), not a foreign key — the field
    // keeps its original name to avoid a wider rename, but nothing looks it
    // up against the zones dataset anymore.
    const data = getDataProvider();
    const created = await data.createWristbandProfile({
      fullName: body.fullName,
      age: body.age ?? null,
      guardianName: body.guardianName,
      guardianPhone: body.guardianPhone,
      meetingPointZoneId: body.meetingPointZoneId ?? null,
      medicalNotes: body.medicalNotes ?? null
    });
    return apiSuccess(created);
  });
}
