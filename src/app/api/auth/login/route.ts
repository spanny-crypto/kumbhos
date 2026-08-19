import { cookies } from 'next/headers';
import { DEMO_ACCOUNTS } from '@/lib/auth/demoAccounts';
import { createSessionToken, SESSION_COOKIE } from '@/lib/auth/session';
import { apiSuccess, apiError } from '@/lib/http/apiResponse';
import { withApiErrors } from '@/lib/http/guard';

export const dynamic = 'force-dynamic';

// Rudimentary in-memory rate limiting to slow down credential guessing on
// this demo login. Not a substitute for a real auth provider in production.
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 10;

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

export async function POST(req: Request) {
  return withApiErrors(async () => {
    const ip = req.headers.get('x-forwarded-for') ?? 'local';
    if (rateLimited(ip)) return apiError('RATE_LIMIT', 'Too many attempts. Please wait a minute and try again.');

    const body = (await req.json().catch(() => null)) as { username?: string; password?: string } | null;
    if (!body?.username || !body?.password) return apiError('VALIDATION_ERROR', 'Username and password are required.');

    const account = DEMO_ACCOUNTS.find((a) => a.username === body.username && a.password === body.password);
    if (!account) return apiError('AUTH_ERROR', 'Invalid username or password.');

    const token = createSessionToken({ sub: account.username, name: account.name, role: account.role });
    cookies().set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60
    });

    return apiSuccess({ name: account.name, role: account.role });
  });
}
