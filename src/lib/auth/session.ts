import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { env } from '@/lib/config/env';
import type { Role } from '@/lib/data/types';

export const SESSION_COOKIE = 'kumbhos_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

export interface SessionPayload {
  sub: string;
  name: string;
  role: Role;
  iat: number;
  exp: number;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url');
}

function sign(payload: string): string {
  return base64url(createHmac('sha256', env.auth.sessionSecret).update(payload).digest());
}

/**
 * Minimal signed-cookie session for the demo command-centre login. This is
 * NOT a general-purpose auth system — it exists so RBAC can be demonstrated
 * end-to-end without provisioning real Supabase Auth. Swap for Supabase Auth
 * (see docs/SECURITY.md) before handling real user accounts or PII.
 */
export function createSessionToken(payload: Omit<SessionPayload, 'iat' | 'exp'>): string {
  const now = Date.now();
  const full: SessionPayload = { ...payload, iat: now, exp: now + SESSION_TTL_MS };
  const body = base64url(JSON.stringify(full));
  const signature = sign(body);
  return `${body}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;

  const expected = sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Server-only helper for Server Components / Route Handlers (Node runtime). */
export function getSession(): SessionPayload | null {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}
