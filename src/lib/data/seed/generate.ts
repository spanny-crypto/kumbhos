import type {
  Announcement,
  AssetCategory,
  AssetStatus,
  DataSourceRecord,
  EventItem,
  Facility,
  GeoPoint,
  HomestayListing,
  Incident,
  InfrastructureAsset,
  LostFoundCase,
  ResponseTeam,
  Toilet,
  Volunteer,
  Zone
} from '@/lib/data/types';

// Deterministic pseudo-random generator so the demo dataset is stable across
// server restarts within a session but still varied-looking. Not
// cryptographic — this is purely for generating plausible demo numbers.
let seed = 42;
function rand(): number {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
}
function randInt(min: number, max: number): number {
  return Math.floor(min + rand() * (max - min + 1));
}
function pick<T>(items: T[]): T {
  return items[randInt(0, items.length - 1)] as T;
}

// Centre of the Nashik–Trimbakeshwar Kumbh Mela area (matches NASHIK_CENTER
// in components/map/nashikLayers.ts). Used only as a fallback default —
// each zone below carries its own real approximate coordinate instead of
// being algorithmically ringed around one point, since Nashik's actual
// pilgrim areas span a real ~28km spread (city ghats to Trimbakeshwar), not
// a single dense cluster the way Prayagraj's Sangam grounds are.
const CENTER: GeoPoint = { lat: 19.9975, lng: 73.7898 };

// Real Nashik–Trimbakeshwar locality/ghat names with real approximate
// coordinates (ghat positions cross-checked against the surveyed
// ghats.geojson layer in components/map/nashikLayers.ts; general localities
// are standard well-known Nashik-area coordinates). The crowd/capacity
// NUMBERS attached to each zone below remain entirely synthetic — there is
// no live sensor network — but the geography itself is now real Nashik,
// not a re-skinned Prayagraj layout.
const ZONE_LOCATIONS: { name: string; center: GeoPoint }[] = [
  { name: 'Ramkund', center: { lat: 20.0016, lng: 73.7889 } },
  { name: 'Panchavati', center: { lat: 20.0043, lng: 73.7898 } },
  { name: 'Trimbakeshwar', center: { lat: 19.9316, lng: 73.5306 } },
  { name: 'Kushavarta Kund, Trimbakeshwar', center: { lat: 19.9328, lng: 73.5298 } },
  { name: 'Someshwar Ghat', center: { lat: 19.9683, lng: 73.7652 } },
  { name: 'Kapila Sangam Ghat', center: { lat: 19.9984, lng: 73.8135 } },
  { name: 'Takali Sangam Ghat', center: { lat: 19.9876, lng: 73.8234 } },
  { name: 'Nandini Sangam', center: { lat: 19.9897, lng: 73.8252 } },
  { name: 'Lakshminarayan Ghat', center: { lat: 20.0002, lng: 73.8073 } },
  { name: 'Talkuteshwar', center: { lat: 20.0031, lng: 73.7977 } },
  { name: 'Tapovan', center: { lat: 20.0103, lng: 73.7783 } },
  { name: 'Anjaneri', center: { lat: 19.9187, lng: 73.5423 } },
  { name: 'Deolali Camp', center: { lat: 19.9457, lng: 73.8306 } },
  { name: 'Nashik Road', center: { lat: 19.9483, lng: 73.833 } },
  { name: 'CBS (Central Bus Stand)', center: { lat: 19.9958, lng: 73.7912 } },
  { name: 'Gangapur Road', center: { lat: 19.9989, lng: 73.7645 } },
  { name: 'Dwarka Circle', center: { lat: 19.977, lng: 73.8083 } },
  { name: 'College Road', center: { lat: 20.0071, lng: 73.7756 } },
  { name: 'Sula Vineyards Area, Gangapur', center: { lat: 20.0367, lng: 73.7302 } },
  { name: 'Ambad', center: { lat: 20.0104, lng: 73.7402 } }
];

function boundaryFor(center: GeoPoint, sizeDeg: number): GeoPoint[] {
  return [
    { lat: center.lat - sizeDeg, lng: center.lng - sizeDeg },
    { lat: center.lat - sizeDeg, lng: center.lng + sizeDeg },
    { lat: center.lat + sizeDeg, lng: center.lng + sizeDeg },
    { lat: center.lat + sizeDeg, lng: center.lng - sizeDeg }
  ];
}

export function generateZones(): Zone[] {
  const now = new Date().toISOString();
  return ZONE_LOCATIONS.map(({ name, center }, i) => {
    const capacity = randInt(15000, 90000);
    const utilization = rand() * 0.8 + (i < 3 ? 0.15 : 0); // first few sectors busier by default
    const currentPopulation = Math.round(capacity * utilization);
    const inflowPerMin = randInt(50, 900);
    const outflowPerMin = randInt(50, 900);
    return {
      id: `zone-${i + 1}`,
      name,
      sector: name,
      center,
      boundary: boundaryFor(center, 0.0035),
      capacity,
      currentPopulation,
      inflowPerMin,
      outflowPerMin,
      movementSpeedMps: Number((0.4 + rand() * 1.2).toFixed(2)),
      directionConflict: Number((rand() * 0.6).toFixed(2)),
      exitCapacityFactor: Number((0.5 + rand() * 0.5).toFixed(2)),
      growthRatePerMin: Number((((inflowPerMin - outflowPerMin) / Math.max(capacity, 1)) * 100).toFixed(3)),
      updatedAt: now,
      dataSource: 'SIMULATED' as const
    };
  });
}

const ASSET_CATEGORIES: AssetCategory[] = [
  'TOILET',
  'WATER_POINT',
  'ROAD',
  'BRIDGE',
  'GHAT',
  'LIGHTING',
  'MEDICAL',
  'POLICE',
  'FIRE',
  'PARKING',
  'WASTE_BIN',
  'INFO_DISPLAY'
];
const STATUS_WEIGHTS: AssetStatus[] = [
  'OPERATIONAL', 'OPERATIONAL', 'OPERATIONAL', 'OPERATIONAL', 'OPERATIONAL', 'OPERATIONAL', 'OPERATIONAL',
  'DEGRADED', 'DEGRADED',
  'CRITICAL',
  'OFFLINE'
];

export function generateInfrastructure(zones: Zone[]): InfrastructureAsset[] {
  const assets: InfrastructureAsset[] = [];
  for (let i = 0; i < 100; i++) {
    const zone = pick(zones);
    const category = pick(ASSET_CATEGORIES);
    const jitter = 0.0015;
    assets.push({
      id: `asset-${i + 1}`,
      category,
      name: `${category.replace('_', ' ')} ${i + 1} — ${zone.sector}`,
      zoneId: zone.id,
      location: { lat: zone.center.lat + (rand() - 0.5) * jitter, lng: zone.center.lng + (rand() - 0.5) * jitter },
      capacity: ['TOILET', 'PARKING', 'MEDICAL'].includes(category) ? randInt(20, 500) : null,
      status: pick(STATUS_WEIGHTS),
      lastInspection: new Date(Date.now() - randInt(1, 48) * 3600_000).toISOString(),
      assignedTeam: rand() > 0.5 ? `Team ${randInt(1, 12)}` : null,
      dataSource: 'SIMULATED'
    });
  }
  return assets;
}

export function generateToilets(zones: Zone[]): Toilet[] {
  const toilets: Toilet[] = [];
  let clusterCounter = 1;
  for (const zone of zones) {
    const clustersInZone = randInt(1, 3);
    for (let c = 0; c < clustersInZone; c++) {
      const clusterId = `toilet-cluster-${clusterCounter}`;
      const clusterName = `Toilet Cluster ${clusterCounter}`;
      const unitsInCluster = randInt(2, 5);
      for (let u = 0; u < unitsInCluster; u++) {
        toilets.push({
          id: `${clusterId}-unit-${u + 1}`,
          clusterId,
          clusterName,
          zoneId: zone.id,
          location: { lat: zone.center.lat + (rand() - 0.5) * 0.002, lng: zone.center.lng + (rand() - 0.5) * 0.002 },
          capacity: randInt(1, 4),
          accessible: rand() > 0.6,
          waterAvailable: rand() > 0.15,
          lastCleanedAt: new Date(Date.now() - randInt(5, 240) * 60_000).toISOString(),
          estimatedUsagePerHour: randInt(10, 120),
          complaints: randInt(0, 4),
          status: pick(['AVAILABLE', 'AVAILABLE', 'BUSY', 'NEEDS_CLEANING', 'OUT_OF_SERVICE']),
          dataSource: 'SIMULATED'
        });
      }
      clusterCounter++;
    }
  }
  return toilets;
}

export function generateResponseTeams(zones: Zone[]): ResponseTeam[] {
  const teams: ResponseTeam[] = [];
  const roles: ResponseTeam['role'][] = ['MEDICAL', 'POLICE', 'FIRE', 'SANITATION'];
  let id = 1;
  for (const role of roles) {
    const count = role === 'POLICE' ? 10 : 6;
    for (let i = 0; i < count; i++) {
      const zone = pick(zones);
      teams.push({
        id: `team-${id++}`,
        role,
        name: `${role.charAt(0)}${role === 'MEDICAL' ? 'ED' : role === 'POLICE' ? 'OL' : role === 'FIRE' ? 'IRE' : 'AN'}-${randInt(10, 99)}`,
        location: { lat: zone.center.lat + (rand() - 0.5) * 0.002, lng: zone.center.lng + (rand() - 0.5) * 0.002 },
        available: rand() > 0.2
      });
    }
  }
  return teams;
}

export function generateVolunteers(zones: Zone[]): Volunteer[] {
  const skills = ['first-aid', 'crowd-guidance', 'translation', 'child-support', 'elderly-support', 'navigation'];
  const languages = ['Hindi', 'English', 'Bhojpuri', 'Bengali', 'Marathi', 'Tamil'];
  const volunteers: Volunteer[] = [];
  for (let i = 0; i < 50; i++) {
    const zone = pick(zones);
    volunteers.push({
      id: `vol-${i + 1}`,
      name: `Volunteer ${String(i + 1).padStart(3, '0')}`,
      zoneId: zone.id,
      location: { lat: zone.center.lat + (rand() - 0.5) * 0.002, lng: zone.center.lng + (rand() - 0.5) * 0.002 },
      skills: [pick(skills), pick(skills)].filter((s, idx, arr) => arr.indexOf(s) === idx),
      languages: [pick(languages), pick(languages)].filter((s, idx, arr) => arr.indexOf(s) === idx),
      available: rand() > 0.35,
      currentAssignmentId: null
    });
  }
  return volunteers;
}

const INCIDENT_TYPES: Incident['type'][] = [
  'MEDICAL', 'FIRE', 'MISSING_PERSON', 'CROWD_SURGE', 'ACCIDENT', 'INFRASTRUCTURE_FAILURE', 'WATER_FLOOD', 'SECURITY', 'OTHER'
];
const SEVERITIES: Incident['severity'][] = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'];
const STATUSES: Incident['status'][] = ['NEW', 'ACKNOWLEDGED', 'DISPATCHED', 'RESPONDING', 'RESOLVED'];

const INCIDENT_DESCRIPTIONS: Record<Incident['type'], string[]> = {
  MEDICAL: ['Pilgrim reported fainting in crowd', 'Elderly visitor requiring assistance', 'Suspected heat exhaustion case'],
  FIRE: ['Small fire reported near cooking area', 'Smoke reported from camp tent'],
  MISSING_PERSON: ['Child separated from family', 'Elderly person disoriented and lost'],
  CROWD_SURGE: ['Sudden crowd surge reported at ghat entrance', 'Bottleneck forming near bridge access'],
  ACCIDENT: ['Minor slip-and-fall near water edge', 'Vehicle-pedestrian near-miss reported'],
  INFRASTRUCTURE_FAILURE: ['Barricade collapse reported', 'Lighting failure across section'],
  WATER_FLOOD: ['Water logging reported near ghat steps', 'Drainage overflow near camp area'],
  SECURITY: ['Suspicious unattended bag reported', 'Crowd altercation reported'],
  OTHER: ['General assistance requested', 'Public announcement request']
};

export function generateIncidents(zones: Zone[]): Incident[] {
  const now = Date.now();
  const incidents: Incident[] = [];
  for (let i = 0; i < 30; i++) {
    const zone = pick(zones);
    const type = pick(INCIDENT_TYPES);
    const reportedAt = new Date(now - randInt(1, 600) * 60_000).toISOString();
    const status = pick(STATUSES);
    incidents.push({
      id: `incident-${i + 1}`,
      type,
      severity: pick(SEVERITIES),
      status,
      zoneId: zone.id,
      location: { lat: zone.center.lat + (rand() - 0.5) * 0.002, lng: zone.center.lng + (rand() - 0.5) * 0.002 },
      description: pick(INCIDENT_DESCRIPTIONS[type]),
      reportedAt,
      updatedAt: reportedAt,
      assignedTeamId: status === 'NEW' ? null : `team-${randInt(1, 28)}`,
      assignedVolunteerId: null,
      dataSource: 'SIMULATED'
    });
  }
  return incidents.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
}

export function generateFacilities(assets: InfrastructureAsset[]): Facility[] {
  return assets
    .filter((a) => ['MEDICAL', 'POLICE', 'FIRE', 'TOILET', 'WATER_POINT', 'PARKING', 'INFO_DISPLAY'].includes(a.category))
    .map((a) => ({ id: `facility-${a.id}`, name: a.name, category: a.category, zoneId: a.zoneId, location: a.location }));
}

export function generateEvents(zones: Zone[]): EventItem[] {
  const titles = ['Main Snan Procession', 'Evening Aarti', 'Akhara Procession', 'Cultural Programme', 'Morning Bhajan Sandhya'];
  const now = Date.now();
  return titles.map((title, i) => {
    const start = now + i * 3 * 3600_000;
    return {
      id: `event-${i + 1}`,
      title,
      description: `${title} at the main ghat area. Expect elevated crowd density in adjoining sectors.`,
      startTime: new Date(start).toISOString(),
      endTime: new Date(start + 2 * 3600_000).toISOString(),
      zoneId: pick(zones).id
    };
  });
}

// A handful of example accommodation listings across real Nashik–
// Trimbakeshwar areas, so the Homestays board isn't empty on first launch.
// Clearly fictional (dataSource SIMULATED) — see HomestayListing's doc
// comment. Names/contacts are placeholders, not real businesses.
export function generateHomestayListings(): HomestayListing[] {
  const now = new Date().toISOString();
  const examples: Omit<HomestayListing, 'id' | 'createdAt' | 'dataSource'>[] = [
    {
      name: 'Godavari View Homestay',
      type: 'HOMESTAY',
      area: 'Panchavati',
      pricePerNightMin: 800,
      pricePerNightMax: 1500,
      capacity: 4,
      contactName: 'Sunita Deshmukh',
      contactPhone: '+91 90000 11111',
      amenities: ['Walking distance to Ramkund', 'Veg meals included', 'Fan rooms'],
      description: 'Family home, two rooms available during the Mela season.',
      photoDataUrl: null
    },
    {
      name: 'Trimbak Yatri Niwas',
      type: 'DHARAMSHALA',
      area: 'Trimbakeshwar',
      pricePerNightMin: 300,
      pricePerNightMax: 600,
      capacity: 6,
      contactName: 'Ramesh Joshi',
      contactPhone: '+91 90000 22222',
      amenities: ['Near Trimbakeshwar Temple', 'Shared bathrooms', 'Basic bedding provided'],
      description: 'Pilgrim rest-house, first-come-first-served during peak bathing days.',
      photoDataUrl: null
    },
    {
      name: 'Panchavati Comfort Rooms',
      type: 'GUESTHOUSE',
      area: 'Panchavati',
      pricePerNightMin: 1200,
      pricePerNightMax: 2200,
      capacity: 3,
      contactName: 'Anil Kale',
      contactPhone: '+91 90000 33333',
      amenities: ['AC available', 'Attached bathroom', 'Parking'],
      description: 'Comfortable rooms in the heart of Panchavati.',
      photoDataUrl: null
    },
    {
      name: 'Deolali Camp Guest House',
      type: 'GUESTHOUSE',
      area: 'Deolali Camp',
      pricePerNightMin: 900,
      pricePerNightMax: 1600,
      capacity: 5,
      contactName: 'Priya Shinde',
      contactPhone: '+91 90000 44444',
      amenities: ['Near Nashik Road station', 'Parking', 'Hot water'],
      description: 'Quieter option, about 20 min from the main ghats.',
      photoDataUrl: null
    },
    {
      name: 'Someshwar Riverside Stay',
      type: 'HOMESTAY',
      area: 'Someshwar',
      pricePerNightMin: 700,
      pricePerNightMax: 1300,
      capacity: 4,
      contactName: 'Vinod Patil',
      contactPhone: '+91 90000 55555',
      amenities: ['Riverside garden', 'Veg meals on request'],
      description: 'Peaceful riverside stay a short walk from Someshwar Ghat.',
      photoDataUrl: null
    },
    {
      name: 'CBS Budget Rooms',
      type: 'HOTEL',
      area: 'CBS (Central Bus Stand)',
      pricePerNightMin: 600,
      pricePerNightMax: 1000,
      capacity: 2,
      contactName: 'Manoj Rane',
      contactPhone: '+91 90000 66666',
      amenities: ['Walking distance to CBS', '24-hour check-in'],
      description: 'Simple budget rooms right by the bus stand.',
      photoDataUrl: null
    },
    {
      name: 'Anjaneri Hillside PG',
      type: 'PG',
      area: 'Anjaneri',
      pricePerNightMin: 400,
      pricePerNightMax: 800,
      capacity: 8,
      contactName: 'Sanjay More',
      contactPhone: '+91 90000 77777',
      amenities: ['Dormitory-style', 'Good for groups', 'Near trekking trail'],
      description: 'Best for groups travelling together.',
      photoDataUrl: null
    },
    {
      name: 'Tapovan Ashram Rooms',
      type: 'DHARAMSHALA',
      area: 'Tapovan',
      pricePerNightMin: 250,
      pricePerNightMax: 500,
      capacity: 4,
      contactName: 'Ashram Office',
      contactPhone: '+91 90000 88888',
      amenities: ['Near Akhara camps', 'Simple accommodation', 'Community kitchen access'],
      description: 'Simple ashram-style rooms near the Akhara camps.',
      photoDataUrl: null
    }
  ];

  return examples.map((e, i) => ({
    ...e,
    id: `homestay-${i + 1}`,
    createdAt: now,
    dataSource: 'SIMULATED' as const
  }));
}

export function generateAnnouncements(): Announcement[] {
  return [
    {
      id: 'announce-1',
      title: 'Welcome to KumbhOS',
      body: 'This public portal shows live-style crowd, facility, and safety information for the gathering area.',
      severity: 'INFO',
      createdAt: new Date().toISOString()
    },
    {
      id: 'announce-2',
      title: 'Demo / Simulation Data',
      body: 'This deployment is running in demo mode. All crowd, incident, and infrastructure figures are synthetic prototype data, not live government feeds.',
      severity: 'WARNING',
      createdAt: new Date().toISOString()
    }
  ];
}

export function generateLostFoundCases(zones: Zone[]): LostFoundCase[] {
  const cases: LostFoundCase[] = [];
  const types: LostFoundCase['type'][] = ['LOST_PERSON', 'FOUND_PERSON', 'LOST_ITEM', 'FOUND_ITEM'];
  const descriptions: Record<LostFoundCase['type'], string[]> = {
    LOST_PERSON: ['8-year-old boy, wearing yellow kurta, last seen near ghat steps', 'Elderly woman, grey saree, disoriented'],
    FOUND_PERSON: ['Young girl found near information centre, unable to state address', 'Elderly man found near parking, awaiting family'],
    LOST_ITEM: ['Blue backpack with medication inside', 'Mobile phone lost near market area'],
    FOUND_ITEM: ['Set of keys found near bridge', 'Wallet found near bus terminal']
  };
  for (let i = 0; i < 12; i++) {
    const type = pick(types);
    cases.push({
      id: `case-${i + 1}`,
      type,
      status: pick(['OPEN', 'OPEN', 'POTENTIAL_MATCH', 'VERIFIED', 'REUNITED']),
      approximateZoneId: pick(zones).id,
      description: pick(descriptions[type]),
      reportedAt: new Date(Date.now() - randInt(5, 500) * 60_000).toISOString(),
      contactInfo: 'Reported to nearest help centre',
      dataSource: 'SIMULATED'
    });
  }
  return cases;
}

export function generateDataSources(): DataSourceRecord[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'ds-1',
      dataset: 'KumbhOS Synthetic Demo Dataset',
      publisher: 'KumbhOS Prototype',
      sourceUrl: 'internal://demo-seed',
      license: 'N/A — prototype demonstration data',
      dateObtained: now,
      lastUpdated: now,
      refreshFrequency: 'Generated per server session; mutated by the Crowd Flow Simulator',
      dataType: 'SIMULATED',
      status: 'ACTIVE'
    },
    {
      id: 'ds-2',
      dataset: 'Water & Sanitation — Prayagraj (baseline reference)',
      publisher: 'Government of India — Open Government Data Platform',
      sourceUrl: 'https://sandbox.data.gov.in/catalog/water-and-sanitation-prayagraj',
      license: 'Government Open Data License – India',
      dateObtained: 'Not yet imported',
      lastUpdated: 'Not yet imported',
      refreshFrequency: 'Planned: adapter not yet connected in this build',
      dataType: 'GOVERNMENT_OPEN_DATA',
      status: 'STUBBED'
    },
    {
      id: 'ds-3',
      dataset: 'Solid Waste Segregation — Prayagraj (2018, historical)',
      publisher: 'data.gov.in',
      sourceUrl: 'https://www.data.gov.in/resource/solid-waste-segregation-prayagraj-2018',
      license: 'Government Open Data License – India',
      dateObtained: 'Not yet imported',
      lastUpdated: '2018 (historical)',
      refreshFrequency: 'Planned: adapter not yet connected in this build',
      dataType: 'GOVERNMENT_OPEN_DATA',
      status: 'STUBBED'
    },
    {
      id: 'ds-4',
      dataset: 'OpenStreetMap base map tiles',
      publisher: 'OpenStreetMap contributors',
      sourceUrl: 'https://www.openstreetmap.org/copyright',
      license: 'Open Database License (ODbL)',
      dateObtained: now,
      lastUpdated: 'Live tile service',
      refreshFrequency: 'Live',
      dataType: 'LIVE',
      status: 'ACTIVE'
    },
    {
      id: 'ds-5',
      dataset: 'Ganga/Yamuna bathing-water quality reports — Maha Kumbh 2025, Kumbh 2021, Ardh Kumbh 2019',
      publisher: 'Central Pollution Control Board (CPCB) / UP Pollution Control Board, via NGT filings and press reporting',
      sourceUrl: 'https://www.tribuneindia.com/news/india/cpcb-takes-u-turn-on-maha-kumbh-water-quality',
      license: 'Public government reporting / press coverage — see individual record citations on the Water Quality page',
      dateObtained: now,
      lastUpdated: now,
      refreshFrequency: 'Manually curated by Command Centre staff as new official reports are published — see /command/water-quality',
      dataType: 'GOVERNMENT_OPEN_DATA',
      status: 'ACTIVE'
    },
    {
      id: 'ds-6',
      dataset: 'CPCB Primary Water Quality Criteria for Bathing Water (Class B)',
      publisher: 'Central Pollution Control Board (CPCB), India',
      sourceUrl: 'https://cpcb.nic.in/wqm/',
      license: 'Public government standard',
      dateObtained: now,
      lastUpdated: now,
      refreshFrequency: 'Static reference standard',
      dataType: 'GOVERNMENT_OPEN_DATA',
      status: 'ACTIVE'
    }
  ];
}
