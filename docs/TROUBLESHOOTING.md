# Troubleshooting

## `TypeError: Failed to fetch`

This should not happen anywhere in KumbhOS — every client fetch goes through `fetchJSON()`
(`src/lib/http/fetchClient.ts`), which catches network errors and turns them into a friendly, categorized message
rendered by `AsyncState` with a Retry button. If you see the raw error text anyway:

1. Check the browser Network tab: is the request going to a relative `/api/...` path, or did something hard-code an
   absolute `http://localhost:3000` URL? It shouldn't — grep the codebase for `localhost` if so.
2. Check `/api/health` — confirm the deployment's own API routes are reachable at all.
3. Check the server logs (Vercel/Netlify function logs) for the actual error — `withApiErrors()`
   (`src/lib/http/guard.ts`) logs full stack traces server-side and only ever returns a sanitized message to the
   client, so the real cause is in the logs, not the response.

## 401 Unauthorized on a `/command` page or `/api/*` call

Your session cookie is missing or expired (8-hour TTL). Sign in again at `/login`. If this happens immediately after
a fresh sign-in, check that `AUTH_SESSION_SECRET` is set consistently — if it changes between deploys, existing
cookies stop verifying.

## 403 Forbidden

Your role doesn't have write access. `VIEW_ONLY` and `VOLUNTEER` accounts can view the command centre but cannot
create/update incidents, confirm dispatch, run simulator scenarios, or advance Lost & Found cases — sign in as
`command`, `admin`, `police`, `medical`, `fire`, or `sanitation` instead. See `docs/SECURITY.md`.

## 429 Too Many Requests on login

The demo login route rate-limits to 10 attempts/minute/IP. Wait a minute and retry.

## Database errors / `mode: "DEMO"` in `/api/health` when you expected live data

`getDataProvider()` only uses Supabase when `DEMO_MODE=false` **and** `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
are both set and the client constructs successfully. If any of that is missing or Supabase is unreachable, it logs a
warning server-side and **falls back to demo data** rather than crashing. Check:

- `DEMO_MODE` is actually set to `false` (not just unset)
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are set with no extra whitespace or quotes
- The Supabase project isn't paused
- `supabase/schema.sql` has actually been applied (missing tables will throw on first query)

## AI Assistant always says "no AI backend configured"

That's the expected fallback state with no `AI_BASE_URL`/`AI_MODEL` set — the assistant still works, answering from
retrieved app data via `FallbackAIProvider`. To use a real model, set `AI_BASE_URL` (OpenAI-compatible, e.g. a local
Ollama server's `/v1` endpoint), `AI_MODEL`, and optionally `AI_API_KEY`. If the AI backend errors or times out
(12s), the app automatically falls back to the same grounded-context response — check server logs for
`[KumbhOS] AI provider failed, falling back to grounded context: ...`.

## Map doesn't render / blank tile area

MapLibre needs WebGL; check the browser console for a WebGL-related error (rare, usually a headless/sandboxed
browser issue, not an app bug). Tiles come from `tile.openstreetmap.org` with no API key — if that host is blocked
by your network, zone polygons/labels still render since they're vector layers drawn on top, only the base raster
tiles will be missing.

## Missing environment variable

Nothing is required to run in demo mode. If you intentionally set `DEMO_MODE=false` without also setting the
Supabase variables, you'll see the DB fall back to demo mode (see above) rather than an error — by design, per the
build brief's "fail gracefully if an optional API key is missing" requirement.

## Expired session / stuck on `/login`

Cookies are `httpOnly`, `sameSite: lax`, 8-hour expiry. If you're testing across `http://localhost` and a deployed
HTTPS URL in the same browser, note cookies don't carry over between origins — sign in separately on each.

## Direct protected URL access

Visiting `/command/**` while signed out redirects to `/login?next=<path>` and returns you there after a successful
sign-in. Hitting a `/api/**` command-centre route directly without a session returns a `401 AUTH_ERROR` JSON body,
never partial data.
