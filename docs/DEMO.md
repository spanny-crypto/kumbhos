# Demo Guide

## Credentials

All command-centre accounts (also shown on the `/login` page itself):

| Username | Password | Role |
|---|---|---|
| `admin` | `kumbhos-admin` | SUPER_ADMIN |
| `command` | `kumbhos-command` | COMMAND_CENTER |
| `police` | `kumbhos-police` | POLICE |
| `medical` | `kumbhos-medical` | MEDICAL |
| `fire` | `kumbhos-fire` | FIRE |
| `sanitation` | `kumbhos-sanitation` | SANITATION |
| `volunteer` | `kumbhos-volunteer` | VOLUNTEER (view-only, cannot dispatch) |
| `viewer` | `kumbhos-viewer` | VIEW_ONLY |

These are intentionally public for judging/demo purposes — see `docs/SECURITY.md` for why this must not be reused
as-is in a real deployment.

## Suggested walkthrough (5–7 minutes)

1. **Home (`/`)** — the dashboard's stat cards (Crowd Density, Parking, Water, Hospitals, Roads & Bridges,
   Sanitation, Alerts, Lost & Found) are all computed from real demo data, not hardcoded. Try the SOS button (top
   right) and the हिंदी language toggle.
2. **Live Billboard (`/billboard`)** — the Bloomberg-terminal-style feed: every zone under elevated pressure, active
   incidents, and recent simulator events, merged and sorted by severity, auto-refreshing every 8s. This is the best
   single screen to show "what needs attention right now."
3. **Live Map (`/live-map`)** — zones colored by risk; click one to see its score.
3. **Crowd (`/crowd`)** — sorted by pressure; expand the top zone to see the Prototype Prediction card
   ("projected to reach the next risk threshold in N minutes").
4. **Sign in** (`/login`, `command` / `kumbhos-command`).
5. **Flow Simulator (`/command/simulator`)** — pick a busy zone, run **Bridge closure**. Watch the Before/After
   pressure score and population change, and the recommended action update live. This is the single best feature to
   demo the "predict → recommend" loop the whole platform is built around.
6. **Incidents (`/command/incidents`)** — open any incident, look at the auto-computed dispatch recommendation
   (nearest team/volunteer/facility with real distances), and click **Confirm dispatch** — note the "requires human
   confirmation" note; nothing dispatches automatically.
7. **Sanitation (`/command/sanitation`)** — predictive service-pressure per toilet cluster, not just a static
   "dirty/clean" flag.
8. **AI Assistant (`/assistant`)** — ask "Where is the nearest medical facility?" — note the grounded answer and the
   "grounded answer · no AI backend configured" tag, demonstrating the app works fully with zero AI credentials. If
   you configure `AI_BASE_URL`/`AI_MODEL`, the same question gets the same underlying facts phrased by a real model.
9. **Data Sources (`/data-sources`)** — the transparency page: what's simulated, what's genuinely live (OSM tiles),
   and what's a stubbed future government-data integration.

## Resetting demo state

The simulator mutates in-memory zone state for the life of the server process. Restart `npm run dev` (or redeploy)
to reset to the original generated dataset.
