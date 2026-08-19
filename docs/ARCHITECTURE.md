# Architecture

## Design principle

Every screen feeds one operational loop:

```
DATA → VALIDATION → CURRENT STATE → RISK ANALYSIS → PREDICTION → RECOMMENDATION → HUMAN DECISION → ACTION → OUTCOME
```

KumbhOS never auto-executes a real-world action (dispatch, reunification, etc.) — every recommendation ends with
`requiresHumanConfirmation: true` and a human clicking "Confirm."

## High-level system

```
                    USERS
                      |
          +-----------+-----------+
          |                       |
          v                       v
   PUBLIC EXPERIENCE       COMMAND CENTRE
   (/,/live-map,/crowd,…)  (/command/**, role-gated)
          |                       |
          +-----------+-----------+
                      |
                      v
             NEXT.JS APP ROUTER
                      |
                 /api/** ROUTE HANDLERS      <- the ONLY place that talks to
                      |                          the DB / AI backend / secrets
       +--------------+--------------+
       |              |              |
       v              v              v
  DataProvider     AIProvider    risk/* engines
  (Demo | Supabase) (Local | Fallback)  (pressureIndex, prediction,
                                          sanitationPressure, dispatch)
```

The browser **never** talks to Supabase, the AI backend, or any external API directly. Every data-driven component
calls `useApi()` → `fetchJSON()` → one of our own `/api/*` routes → `getDataProvider()` / `answerAssistantQuestion()`.
This is the direct fix for the "frontend directly attempting to access a private database" and "client-side secrets"
failure modes called out in the build brief.

## The DataProvider abstraction

`src/lib/data/provider.ts` defines the `DataProvider` interface. Two implementations exist:

- **`DemoDataProvider`** (`src/lib/data/demoProvider.ts`) — in-memory synthetic data generated once per server
  process (`src/lib/data/seed/generate.ts`), mutated by the Crowd Flow Simulator. This is what runs by default.
- **`SupabaseDataProvider`** (`src/lib/data/supabaseProvider.ts`) — real Postgres queries via the service-role key.
  Only constructed when `DEMO_MODE=false` **and** `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are both set.

`src/lib/data/index.ts` (`getDataProvider()`) is the only place that decides which one to use, and it **falls back to
demo data and logs a warning** if Supabase construction fails for any reason — a misconfigured or missing credential
degrades gracefully instead of crashing every page (the "Failed to fetch in production" failure mode this build was
explicitly briefed to avoid).

## The AIProvider abstraction

`src/lib/ai/index.ts` orchestrates: retrieve structured context from `DataProvider` first (`src/lib/ai/retrieval.ts`,
lightweight keyword-based intent detection — not full RAG, see "Out of scope" below), then hand that context to
either `LocalAIProvider` (an OpenAI-compatible `AI_BASE_URL`/`AI_MODEL`/`AI_API_KEY` — works with Ollama, vLLM, or a
compatible hosted endpoint) or `FallbackAIProvider` (returns the retrieved facts directly, no model call) if no AI
backend is configured or the call fails/times out. The AI is never allowed to answer outside the retrieved context —
see the system prompt in `localProvider.ts`.

## Risk engines (deterministic, documented as prototypes)

- `src/lib/risk/pressureIndex.ts` — **Crowd Pressure Index**, a transparent weighted formula (capacity utilization,
  density, movement conflict, growth, exit availability). Explicitly labeled "Prototype Risk Model" in the UI.
- `src/lib/risk/prediction.ts` — **Crowd Prediction**, linear extrapolation of net inflow/outflow against the same
  pressure formula to estimate minutes-to-threshold. Labeled "Prototype Prediction". Not a trained ML model — see
  spec principle "no fake machine learning": this is intentionally a simple, explainable placeholder a real model can
  later replace without changing its call sites.
- `src/lib/risk/sanitationPressure.ts` — toilet-cluster service-pressure projection.
- `src/lib/risk/dispatch.ts` — nearest-available-responder recommendation (haversine distance), used by both the
  Emergency Command Centre and Volunteer Coordination.

## Auth / RBAC

Defense in depth, three independent layers, documented in [SECURITY.md](SECURITY.md):

1. `src/middleware.ts` — Edge runtime, coarse cookie-presence redirect only.
2. `src/app/command/layout.tsx` — Server Component, re-verifies the signed session on every request.
3. `src/lib/auth/rbac.ts` (`requireSession()` / `requireWriteAccess()`) — every protected API route calls this
   independently; it never trusts what the client (or the other two layers) claims.

## Primary features (polished)

1. Live Crowd Map (`/live-map`, `/command/map`) — MapLibre + OpenStreetMap raster tiles, zone polygons colored by
   risk, facility clustering, incident markers.
2. Crowd Pressure Index (`/crowd`) — see above.
3. Crowd Prediction (`/api/zones/[id]/predict`, shown inline on `/crowd`) — see above.
4. Crowd Flow Simulator (`/command/simulator`) — operator triggers a scenario, sees before/after pressure and the
   updated recommendation. This is the single best demo of the "predict → recommend" loop.
5. Emergency Command Centre (`/command/incidents`) — incident lifecycle + dispatch recommendation, human-confirmed.
6. Live Billboard (`/billboard`, public, `/api/billboard`) — a dense, terminal-style feed merging every zone under
   elevated crowd pressure (with its prediction-derived recommended action), active high/critical incidents, and
   recent simulator events into one severity-sorted, auto-refreshing ticker + table. Deliberately styled distinct
   from the rest of the public portal (dark, monospace) as the "operational situational awareness" screen.

## Visual design

The public portal (`src/components/layout/AppShell.tsx`) uses a light "paper" theme — sidebar navigation, topbar
with a consent-gated "Enable live tracking" toggle (`LocationProvider`, browser Geolocation API, coordinates never
leave the browser except via the user's own explicit Share action), an EN/HI chrome-level language toggle
(`LanguageProvider` + `lib/i18n/dictionary.ts` — chrome strings only, not a full translation layer), and an SOS
button opening a modal with real `tel:112`/`tel:108` links and a Share Location action. The Command Centre keeps a
separate dark, denser "ops" theme (`ink` Tailwind color scale) — a deliberate register split between the public-
facing product and the staff tool, not an inconsistency.

## Secondary features (functional)

Infrastructure monitoring, predictive sanitation, volunteer coordination, Lost & Found (privacy-conscious, human
verification required, no facial recognition), AI Kumbh Assistant.

## Explicitly out of scope (documented, not faked)

- **BHASHINI / multilingual** — the assistant's retrieval-then-answer design is language-agnostic and could be wired
  to a translation layer, but no such integration exists in this build. English/Hindi UI copy only.
- **Live data.gov.in ingestion** — `docs/DATA-SOURCES.md` lists the target datasets (Prayagraj water & sanitation,
  solid waste) and their official URLs, but the fetch/normalize adapters are not implemented; the corresponding
  `data_sources` entries are marked `STUBBED`, not `ACTIVE`, and no demo figure claims to be that data.
  See `src/lib/data/seed/generate.ts:generateDataSources()`.
- **Full RAG / vector search** — `retrieval.ts` uses keyword matching over structured records, not embeddings.
- **Real emergency-service integration** — the Emergency page explicitly states KumbhOS is not connected to 112 or
  any government dispatch system.
