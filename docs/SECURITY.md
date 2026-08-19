# Security

## Authentication & authorization

KumbhOS ships a **demo-mode session system**, not a production auth provider. It exists so role-based access control
can be demonstrated end-to-end without provisioning real Supabase Auth for a hackathon judge to test:

- `src/lib/auth/demoAccounts.ts` — a fixed, publicly-documented list of demo credentials (also shown on the login
  page and in `docs/DEMO.md`). **Do not add real accounts or real passwords to this file.**
- `src/lib/auth/session.ts` — an HMAC-signed cookie (`kumbhos_session`), 8-hour expiry, verified with
  `crypto.timingSafeEqual`. The signing secret is `AUTH_SESSION_SECRET`; the `.env.example` placeholder must be
  replaced with a random 32+ character string before any real deployment.
- `src/lib/auth/rbac.ts` — `requireSession()` and `requireWriteAccess()`, called independently inside every protected
  API route.

**Before handling real user accounts or PII, replace this with Supabase Auth** (`supabase/schema.sql` already has a
`user_roles` table and RLS policies shaped for that migration) — see `docs/DATABASE.md`.

## Defense in depth (three independent checks)

The spec this app was built against explicitly warns against `if (user.role === 'admin') showAdmin()` as the only
gate. KumbhOS checks authorization **three separate times**, and none of them trusts the others:

1. `src/middleware.ts` — Edge runtime. Redirects to `/login` if the session cookie is merely *absent*. Cannot verify
   the signature (no Node `crypto` on the Edge runtime) — this is a UX convenience only.
2. `src/app/command/layout.tsx` — Server Component (Node runtime). Calls `getSession()`, which fully verifies the
   HMAC signature and expiry, and redirects if invalid.
3. Every route under `src/app/api/**` that touches command-centre data calls `requireSession()` /
   `requireWriteAccess()` directly — this is what actually matters, since API routes can be hit directly (curl,
   another client) without ever loading the layout.

## Secrets never reach the browser

- `src/lib/config/env.ts` is the only module that reads `process.env`. Server-only values (`SUPABASE_SERVICE_ROLE_KEY`,
  `AI_API_KEY`, `AUTH_SESSION_SECRET`) are read via getters that are never imported into a `'use client'` file.
- `SupabaseDataProvider` and `LocalAIProvider` are only ever imported from Route Handlers (`src/app/api/**`), and the
  Supabase/AI modules are lazily `require()`'d in `getDataProvider()` so they're never even bundled when demo mode is
  active.
- Verified for this build: `grep -r "SERVICE_ROLE_KEY\|AI_API_KEY" .next/static` returns no matches after a
  production build.

## RBAC roles

`SUPER_ADMIN`, `COMMAND_CENTER`, `POLICE`, `MEDICAL`, `FIRE`, `SANITATION`, `VOLUNTEER`, `VIEW_ONLY`. All eight can
reach the command centre; only the first six can perform write actions (create/update incidents, confirm dispatch,
run simulator scenarios, advance Lost & Found cases). See `WRITE_ROLES` in `lib/auth/rbac.ts`.

## Rate limiting

`/api/auth/login` applies a simple in-memory rate limit (10 attempts/minute/IP) to slow down credential guessing.
This resets on server restart and doesn't work across multiple server instances — acceptable for a single-instance
demo, not sufficient for production (use a shared store, e.g. Redis, behind a real deployment).

## Privacy

- Lost & Found collects only what's needed to reunite people/items (type, approximate zone, free-text description,
  reporter contact) — no photos, no facial recognition, no biometric data.
- Every status change past `OPEN` on a Lost & Found case requires a signed-in staff account (`requireWriteAccess()`),
  i.e. a human verifies any match before it's marked resolved.
- No precise device geolocation is collected anywhere in this build.

## Public vs. private surfaces

- `public/robots.txt` disallows `/command`.
- `next.config.js` sets `X-Robots-Tag: noindex, nofollow` on all `/command/**` responses; `middleware.ts` also sets
  it as a defense-in-depth belt-and-suspenders header.
- **Neither of those is a security control** — they only ask well-behaved crawlers not to index the page. The actual
  protection is the three-layer auth check above. This is stated explicitly because the build brief calls out
  "robots.txt is not security" as a common mistake to avoid.

## Known accepted risk: Next.js 14.2.x advisories

`npm audit` flags several Next.js CVEs that are only fully resolved in Next 15/16 (a breaking major-version upgrade —
async `cookies()`/`headers()`/route `params` — out of scope for tonight's build). The remaining advisories concern
`next/image` optimization, custom servers, and i18n middleware — **none of which this app uses**. Package.json pins
the latest available `14.2.x` patch (`14.2.35`). Upgrading to Next 15/16 is recommended before any real production
deployment; track it as a follow-up, not a blocker for this prototype.
