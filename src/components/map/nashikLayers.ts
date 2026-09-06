// Real Nashik–Trimbakeshwar / Kumbh Mela 2027 infrastructure layers.
//
// Data and layer concept come from the Nashik Monitor project by Tanmay K
// (github.com/tanmayk1234/nashik-monitor-v2), an initiative of the Kumbhathon
// Innovation Foundation, used here with the author's permission. That project
// is AGPL-3.0-only; see LICENSE and docs/ATTRIBUTION.md.
//
// This is the one part of the map that is NOT synthetic: these are surveyed
// or officially-sourced positions (KML/KMZ masters, RTI replies, CPCB/NMC
// documents), and the upstream project is scrupulous about which points are
// verified vs. locality-matched. That distinction is preserved: features
// carry their original `locationConfidence` / `geocodeConfidence` properties,
// and the popup surfaces them rather than presenting every dot as surveyed.

export interface NashikLayer {
  id: string;
  file: string;
  label: string;
  emoji: string;
  color: string;
  /** Shown on the layer toggle so a reader knows what the data can't tell them. */
  caveat?: string;
}

export const NASHIK_LAYERS: NashikLayer[] = [
  { id: 'ghats', file: 'ghats.geojson', label: 'Ghats', emoji: '🛕', color: '#0e7490' },
  { id: 'hospitals', file: 'hospitals.geojson', label: 'Hospitals', emoji: '🏥', color: '#dc2626', caveat: 'Positions are graded, not surveyed — many share a coordinate.' },
  { id: 'police-stations', file: 'police-stations.geojson', label: 'Police', emoji: '🚓', color: '#2563eb' },
  { id: 'fire-stations', file: 'fire-stations.geojson', label: 'Fire', emoji: '🚒', color: '#ea580c' },
  { id: 'ambulances', file: 'ambulances.geojson', label: 'Ambulance points', emoji: '🚑', color: '#e11d48' },
  { id: 'blood-banks', file: 'blood-banks.geojson', label: 'Blood banks', emoji: '🩸', color: '#be123c' },
  { id: 'public-toilets', file: 'public-toilets.geojson', label: 'Toilets', emoji: '🚻', color: '#0891b2' },
  { id: 'parking-zones', file: 'parking-zones.geojson', label: 'Parking', emoji: '🅿️', color: '#7c3aed' },
  { id: 'holding-areas', file: 'holding-areas.geojson', label: 'Holding areas', emoji: '👥', color: '#b45309' },
  { id: 'staging-areas', file: 'staging-areas.geojson', label: 'Staging areas', emoji: '📦', color: '#a16207' },
  { id: 'congestion-points', file: 'congestion-points.geojson', label: 'Congestion points', emoji: '⚠️', color: '#dc2626', caveat: '“Congestion” is the source build script’s own label for leftover polygons.' },
  { id: 'emergency-routes', file: 'emergency-routes.geojson', label: 'Emergency routes', emoji: '🚨', color: '#b91c1c' },
  { id: 'ring-road', file: 'ring-road.geojson', label: 'Ring road', emoji: '🛣️', color: '#525252' },
  { id: 'bus-depots', file: 'bus-depots.geojson', label: 'Bus depots', emoji: '🚌', color: '#15803d' },
  { id: 'petrol-pumps', file: 'petrol-pumps.geojson', label: 'Petrol pumps', emoji: '⛽', color: '#4d7c0f' },
  { id: 'vegetable-markets', file: 'vegetable-markets.geojson', label: 'Markets', emoji: '🥬', color: '#65a30d' },
  { id: 'diagnostic-labs', file: 'diagnostic-labs.geojson', label: 'Labs', emoji: '🔬', color: '#9333ea' },
  { id: 'malls', file: 'malls.geojson', label: 'Malls', emoji: '🏬', color: '#c026d3' }
];

/** Nashik–Trimbakeshwar, where this data actually is (the synthetic demo zones are Prayagraj). */
export const NASHIK_CENTER = { lat: 19.9975, lng: 73.7898 };

const cache = new Map<string, unknown>();

export async function loadNashikLayer(layer: NashikLayer): Promise<unknown> {
  const cached = cache.get(layer.id);
  if (cached) return cached;
  const res = await fetch(`/mapdata/${layer.file}`);
  if (!res.ok) throw new Error(`Could not load ${layer.label}`);
  const data = await res.json();
  cache.set(layer.id, data);
  return data;
}
