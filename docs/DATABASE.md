# Database

## Two backends, one interface

The app talks to data exclusively through the `DataProvider` interface (`src/lib/data/provider.ts`). Which
implementation is active is decided once, in `src/lib/data/index.ts`:

- **Demo (default)** — `DemoDataProvider`, in-memory, no database required at all.
- **Live** — `SupabaseDataProvider`, real Postgres via Supabase, only used when `DEMO_MODE=false` and both
  `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set and reachable.

## Applying the live schema

`supabase/schema.sql` contains the full table set, indexes, and Row Level Security policies. It is **not required**
to run the app in demo mode — only apply it if you're standing up a real Supabase project:

```bash
# via Supabase CLI, from the project root
supabase db push
# or paste the file contents into the Supabase SQL editor
```

## Tables

| Table | Purpose |
|---|---|
| `zones` | The 20 demo sectors; capacity, population, flow rates — the input to the Crowd Pressure Index |
| `crowd_snapshots` / `crowd_predictions` | Historical pressure/prediction records (for trend charts — not surfaced yet) |
| `infrastructure_assets` / `infrastructure_inspections` | Toilets, roads, bridges, ghats, medical/police/fire posts, parking, etc. |
| `toilets` / `sanitation_events` | Sanitation-specific detail feeding `sanitationPressure.ts` |
| `water_assets` / `waste_assets` | Reserved for future water/waste modules (not yet surfaced in the UI) |
| `incidents` / `incident_assignments` | Emergency Command Centre |
| `response_teams` / `volunteers` | Dispatch recommendation inputs |
| `lost_found_cases` | Lost & Found |
| `facilities` / `events` / `announcements` | Public-facing informational content |
| `routes` | Reserved for persisting computed navigation suggestions (currently computed on the fly, not stored) |
| `simulation_scenarios` / `simulation_events` | Crowd Flow Simulator log |
| `data_sources` | Data Transparency page |
| `user_roles` / `audit_logs` | For a future real-Supabase-Auth deployment (see SECURITY.md) — not used while the app runs its demo-mode session auth |

Indexes are defined on the columns the app actually queries by: `zone_id`, `status`, `reported_at` / `triggered_at`
(descending, for recent-first lists).

## Row Level Security

Read access on public reference tables (`zones`, `infrastructure_assets`, `toilets`, `facilities`, `events`,
`announcements`, `data_sources`, `lost_found_cases`) is open to the anon key. Writes to operational tables
(`incidents`, `simulation_events`, etc.) require `auth.role() = 'authenticated'`. This mirrors — but does not
replace — the server-side `requireSession()` / `requireWriteAccess()` checks in `lib/auth/rbac.ts`. Both layers must
independently agree before a write succeeds; see SECURITY.md.
