import { getDataProvider } from '@/lib/data';
import { apiSuccess, apiError } from '@/lib/http/apiResponse';
import { withApiErrors } from '@/lib/http/guard';
import { requireWriteAccess } from '@/lib/auth/rbac';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['ACTIVE', 'REUNITED', 'EXPIRED'];

// Rudimentary in-memory rate limiting on the public lookup, same pattern as
// /api/auth/login — this endpoint is intentionally unauthenticated (anyone
// who finds a lost child needs to scan and see contact info immediately),
// so the short printed/QR code is the only real barrier. Slowing down
// automated guessing of that code is the point here, not blocking genuine
// one-off scans.
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 30;

function rateLimited(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return withApiErrors(async () => {
    const ip = req.headers.get('x-forwarded-for') ?? 'local';
    if (rateLimited(ip)) return apiError('RATE_LIMIT', 'Too many lookups from this connection. Please wait a minute and try again.');

    const data = getDataProvider();
    const profile = await data.getWristbandProfile(params.id);
    if (!profile) return apiError('NOT_FOUND', 'No wristband found with that code.');
    return apiSuccess(profile);
  });
}

// Only staff can mark a case resolved/expired — human confirmation before a
// reunited child's wristband is closed out.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return withApiErrors(async () => {
    requireWriteAccess();
    const body = (await req.json().catch(() => null)) as { status?: string } | null;
    if (!body?.status || !VALID_STATUSES.includes(body.status)) {
      return apiError('VALIDATION_ERROR', 'A valid status is required.');
    }
    const data = getDataProvider();
    const updated = await data.updateWristbandStatus(params.id, body.status as never);
    if (!updated) return apiError('NOT_FOUND', 'That wristband could not be found.');
    return apiSuccess(updated);
  });
}
