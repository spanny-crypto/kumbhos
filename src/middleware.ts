import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE = 'kumbhos_session';

// Coarse, edge-runtime gate: redirects to /login if no session cookie is
// present at all. This is a UX convenience only — it does NOT verify the
// cookie's signature (that requires Node's crypto module, unavailable on
// the Edge runtime). Real verification + per-role authorization happens
// again, independently, in src/app/command/layout.tsx and in every
// src/app/api/** route via lib/auth/rbac.ts. Never rely on this file alone.
export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');

  const hasCookie = Boolean(req.cookies.get(SESSION_COOKIE)?.value);
  if (!hasCookie) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('next', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return res;
}

export const config = {
  matcher: ['/command/:path*']
};
