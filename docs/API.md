# API Reference

All routes live under `src/app/api/**` and return the same envelope:

```json
{ "data": <T> | null, "error": { "category": "...", "message": "..." } | null, "meta": { "requestId": "...", "timestamp": "..." } }
```

Errors use the category → HTTP status mapping in `src/lib/http/apiResponse.ts` (`AUTH_ERROR` → 401, `FORBIDDEN` → 403,
`VALIDATION_ERROR` → 400, `NOT_FOUND` → 404, `RATE_LIMIT` → 429, `DATABASE_ERROR`/`API_ERROR`/`AI_ERROR`/`MAP_ERROR` →
502/503, `TIMEOUT` → 504, `CONFIGURATION_ERROR`/`UNKNOWN_ERROR` → 500). Client code never inspects raw HTTP status —
it reads `error.category` / `error.message` via `fetchJSON()`.

"Auth" below means `requireSession()` (any signed-in command-centre role) or `requireWriteAccess()` (all roles except
`VIEW_ONLY` and `VOLUNTEER`) from `lib/auth/rbac.ts`.

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/health` | GET | none | Per-dependency status: database/ai/maps/governmentSources |
| `/api/zones` | GET | none | All zones + computed Crowd Pressure Index |
| `/api/zones/[id]/predict` | GET | none | Zone + pressure + Crowd Prediction |
| `/api/infrastructure` | GET | none | All infrastructure assets |
| `/api/toilets` | GET | none | Toilets + per-cluster sanitation pressure |
| `/api/facilities` | GET | none | Public facility list (for maps/navigation) |
| `/api/events` | GET | none | Scheduled programme |
| `/api/announcements` | GET | none | Public announcements |
| `/api/data-sources` | GET | none | Data Transparency page content |
| `/api/water-quality` | GET | none | Publicly reported Ganga/Yamuna water-quality records (real, cited data — not simulated) |
| `/api/water-quality` | POST | write | Add a new water-quality record |
| `/api/water-quality/[id]` | PATCH | write | Edit any field of a water-quality record |
| `/api/water-quality/[id]` | DELETE | write | Remove a water-quality record |
| `/api/wristbands` | GET | session | Staff roster of all ID wristbands |
| `/api/wristbands` | POST | none | Create a printable ID wristband (public — any guardian) |
| `/api/wristbands/[id]` | GET | none, rate-limited | Look up one wristband by its printed/QR code (30 req/min/IP) |
| `/api/wristbands/[id]` | PATCH | write | Mark a wristband reunited/expired |
| `/api/incidents` | GET | session | List incidents |
| `/api/incidents` | POST | write | Create incident |
| `/api/incidents/[id]` | GET | session | Incident detail |
| `/api/incidents/[id]` | PATCH | write | Update status |
| `/api/incidents/[id]/dispatch` | GET | session | Compute (but don't apply) a dispatch recommendation |
| `/api/incidents/[id]/dispatch` | POST | write | Apply the recommendation (assign team/volunteer) — human-confirmed |
| `/api/volunteers` | GET | session | Volunteer roster |
| `/api/lost-found` | GET | none | Open Lost & Found cases (minimal fields, no PII beyond contact info) |
| `/api/lost-found` | POST | none | Submit a case (public) |
| `/api/lost-found/[id]` | PATCH | write | Advance case status (staff-only — human verification gate) |
| `/api/simulate` | POST | write | Run a Crowd Flow Simulator scenario against a zone |
| `/api/simulate` | GET | none | Recent simulation events |
| `/api/assistant` | POST | none | AI Assistant question → grounded answer |
| `/api/auth/login` | POST | none | Demo login, rate-limited (10/min/IP) |
| `/api/auth/logout` | POST | none | Clear session |
| `/api/auth/session` | GET | none | Current session (for UI) |

## Example

```bash
curl -X POST http://localhost:3000/api/simulate \
  -H "Content-Type: application/json" \
  -H "Cookie: kumbhos_session=<token>" \
  -d '{"type":"BRIDGE_CLOSURE","zoneId":"zone-1"}'
```

Without a valid session cookie this returns `401 AUTH_ERROR`; with a `VIEW_ONLY`/`VOLUNTEER` session it returns
`403 FORBIDDEN`.
