// Well-known named starting points for the Trip Planner's "From" selector.
// Unlike the surveyed layers in nashikLayers.ts, these are approximate
// landmark coordinates (standard publicly-known locations), not surveyed
// data — good enough for straight-line "which facility is closest" ranking,
// not for turn-by-turn navigation. Labelled honestly in the UI as approximate.
export interface Landmark {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export const NASHIK_LANDMARKS: Landmark[] = [
  { id: 'ramkund', name: 'Ramkund, Panchavati', lat: 20.0016, lng: 73.7889 },
  { id: 'trimbakeshwar', name: 'Trimbakeshwar Temple', lat: 19.9316, lng: 73.5306 },
  { id: 'nashik-road-station', name: 'Nashik Road Railway Station', lat: 19.9483, lng: 73.833 },
  { id: 'cbs', name: 'Nashik CBS (Central Bus Stand)', lat: 19.9958, lng: 73.7912 },
  { id: 'deolali-camp', name: 'Deolali Camp', lat: 19.9457, lng: 73.8306 },
  { id: 'sula-vineyards', name: 'Sula Vineyards, Gangapur', lat: 20.0367, lng: 73.7302 }
];
