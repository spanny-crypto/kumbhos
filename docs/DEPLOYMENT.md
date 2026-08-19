# Deployment

## Vercel (recommended)

1. Push this repo to GitHub.
2. Import it in Vercel. Framework preset: Next.js (auto-detected).
3. **You do not need to set any environment variables to deploy a working demo.** `DEMO_MODE` defaults to `true`.
4. Set `NEXT_PUBLIC_APP_URL` to your production URL (e.g. `https://kumbhos.vercel.app`) once you know it — used only
   for absolute links, never for secret data, so it's safe to leave as the default until then.
5. Deploy. `npm run build` is what Vercel runs; it's the exact command verified locally for this build.

To go live with real Supabase/AI backends later, set `DEMO_MODE=false` plus the Supabase and AI variables from
`.env.example` in the Vercel project settings, then redeploy — no code changes required (see `getDataProvider()` /
`isAiConfigured()`).

## Netlify

Next.js App Router (including Route Handlers and Middleware) is supported via the official Next.js Runtime, enabled
automatically when Netlify detects `next.config.js`. Same environment variable guidance as above. Build command:
`npm run build`; no `netlify.toml` is required for the default settings, but if you add one, do **not** override the
publish directory — let the Next.js Runtime manage it.

## What NOT to do (the mistakes this build was specifically briefed to avoid)

- Don't hard-code `http://localhost:3000` anywhere in server code — the app never does; all internal links are
  relative, and `NEXT_PUBLIC_APP_URL` is only used for display/metadata.
- Don't rely on a `.env.local` file existing in the deployment — it won't. Every variable is optional with a safe
  default (see `.env.example`'s comments) except `DEMO_MODE`, which itself defaults to `true` even if unset.
- Don't set `SUPABASE_SERVICE_ROLE_KEY` or `AI_API_KEY` with a `NEXT_PUBLIC_` prefix — they must stay server-only.
  `lib/config/env.ts` reads them without that prefix on purpose.
- After deploying, hit `/api/health` — it will tell you plainly whether the DB/AI/maps dependencies are `OK`,
  `DEGRADED`, `OFFLINE`, or intentionally `DEMO`. That endpoint is the fastest way to confirm a deployment is
  healthy before demoing.

## Post-deploy checklist

- [ ] `/` loads and shows real (synthetic) crowd data, not a blank page or spinner
- [ ] `/api/health` returns 200 with `mode: "DEMO"` (or `"LIVE"` if you configured Supabase)
- [ ] `/command` redirects to `/login` when signed out
- [ ] Sign in with a demo account, confirm the dashboard renders
- [ ] Run a Crowd Flow Simulator scenario and confirm before/after values change
- [ ] View source / devtools network tab: no Supabase service-role key or AI key anywhere in responses or JS bundles
