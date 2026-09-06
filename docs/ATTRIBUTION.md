# Attribution

## Nashik Monitor — infrastructure map layers

The "Nashik infrastructure" view on `/live-map` (`src/components/map/NashikInfraMap.tsx`,
`src/components/map/nashikLayers.ts`) and the GeoJSON files in `public/mapdata/` come from:

**Nashik Monitor** — https://github.com/tanmayk1234/nashik-monitor-v2
Author: Tanmay K. An initiative by the **Kumbhathon Innovation Foundation**.
Licensed **AGPL-3.0-only** (itself inherited from
[koala73/worldmonitor](https://github.com/koala73/worldmonitor)).

Used here with the author's permission.

### What was taken

- 18 of the project's 36 GeoJSON layers (ghats, hospitals, police, fire, ambulance points,
  blood banks, toilets, parking, holding/staging areas, congestion points, emergency routes,
  ring road, bus depots, petrol pumps, markets, labs, malls). The larger layers (CCTV,
  mandirs, waste routes/zones, bus stops — ~4.5 MB combined) were left out to keep the
  Android APK small, not for any other reason.
- The rendering approach: one source per layer with `fill` / `line` / `point` sublayers
  filtered on `geometry-type`, so files holding mixed geometry need no special-casing.

### What was preserved on purpose

The upstream project is unusually careful about **which positions are actually surveyed**,
and that care is the most valuable thing in it. Every feature keeps its original
`locationConfidence` / `geocodeConfidence` property, and the popup translates it into plain
language rather than presenting every dot as a surveyed location:

- `verified` → confirmed against an independent source
- `locality-match` → placed by matching address text to a locality centroid
- `approximate` → near the city centre only
- `indicative` → not an inventory
- `HIGH` / `MEDIUM` / `LOW` → the hospital layer's own upstream grading, none of which is a
  surveyed position

Layer-level caveats from the upstream `descriptions.ts` (e.g. that "congestion points" is the
source build script's own label for leftover polygons, and that hospital positions are graded
rather than surveyed) are carried on the layer toggles.

### Licence implications

AGPL-3.0 is a network-copyleft licence. Incorporating this code into KumbhOS — which is
deployed as a web application — means the combined work is subject to AGPL-3.0, including the
obligation to offer its complete corresponding source to users of the deployed service. The
source is public at https://github.com/6falconbusiness-maker/kumbhos.

## Other data and services

- **Base map tiles**: OpenStreetMap contributors (ODbL). No API key.
- **Water quality figures**: CPCB / state Pollution Control Board reports, NGT filings and
  published sampling studies — each record carries its own citation. See
  `src/lib/data/seed/waterQuality.ts`.
- **Everything else** (zones, incidents, volunteers, toilets, events, announcements) is
  synthetic prototype data, labelled as such throughout the UI.
