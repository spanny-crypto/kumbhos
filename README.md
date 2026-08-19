# KumbhOS

**Predictive Crowd & Infrastructure Intelligence Platform**

> See the pressure before it becomes a problem.

KumbhOS is a prototype decision-intelligence layer for large-scale gatherings (Kumbh-scale events). It doesn't replace
the surveillance, GIS, and command-centre infrastructure already deployed at events like Maha Kumbh 2025 — it turns
those kinds of signals into a predictive layer that answers four questions:

1. What is happening?
2. Where is it happening?
3. What is likely to happen next?
4. What should the operator do now?

The five flagship features: a live crowd-pressure map, a transparent **Crowd Pressure Index**, short-horizon
**crowd prediction**, a **Crowd Flow Simulator** for scenario planning, and an **Emergency Command Centre** with
dispatch recommendations. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full feature list and what's
explicitly out of scope for this build.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000. **No environment variables are required** — the app runs entirely on a generated
synthetic dataset (`DEMO_MODE=true` by default). Sign in to the Command Centre at `/login` with any of the demo
accounts listed there (also in [docs/DEMO.md](docs/DEMO.md)).

## Documentation

| Doc | Covers |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, data flow, what's in/out of scope |
| [docs/DATABASE.md](docs/DATABASE.md) | Schema, demo vs. live data providers |
| [docs/API.md](docs/API.md) | Every `/api/*` route, auth requirements, response envelope |
| [docs/DATA-SOURCES.md](docs/DATA-SOURCES.md) | Provenance of every dataset used |
| [docs/SECURITY.md](docs/SECURITY.md) | AuthN/AuthZ model, secrets handling, known limitations |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Deploying to Vercel/Netlify, env var setup |
| [docs/DEMO.md](docs/DEMO.md) | Demo credentials and a suggested walkthrough script |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Fixes for common errors, including "Failed to fetch" |

## Project status

This is a hackathon prototype (built for Kumbhathon). It runs fully in demo mode with synthetic data — every
simulated figure is labeled **SIMULATION / DEMO DATA** in the UI and via a `dataSource` field in every API response.
Nothing simulated is ever presented as a live government feed. See [docs/DATA-SOURCES.md](docs/DATA-SOURCES.md) for
exactly what is simulated vs. real (OpenStreetMap tiles) vs. stubbed for future government open-data integration.
