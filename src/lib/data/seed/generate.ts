import type {
  Announcement,
  AssetCategory,
  AssetStatus,
  DataSourceRecord,
  EventItem,
  Facility,
  GeoPoint,
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

// Approximate centre of the Kumbh Mela grounds at the Sangam, Prayagraj.
const CENTER: GeoPoint = { lat: 25.4305, lng: 81.8809 };

const SECTOR_NAMES = [
  'Sangam Nose',
  'Sector 1 — Jhunsi',
  'Sector 2 — Arail',
  'Sector 3 — Parade Ground',
  'Sector 4 — Kydganj',
  'Sector 5 — Naini Approach',
  'Sector 6 — Daraganj',
  'Sector 7 — Ram Ghat',
  'Sector 8 — Central Market',
  'Sector 9 — Old GT Road',
  'Sector 10 — Railway Approach',
  'Sector 11 — Civil Lines',
  'Sector 12 — Akhara Camps',
  'Sector 13 — VIP Ghat',
  'Sector 14 — Bus Terminal',
  'Sector 15 — Parking North',
  'Sector 16 — Parking South',
  'Sector 17 — Chatnag Road',
  'Sector 18 — Kali Ghat',
  'Sector 19 — Medical Camp Zone'
];

function offset(index: number): GeoPoint {
  const ring = Math.floor(index / 6);
  const angle = ((index % 6) / 6) * 2 * Math.PI;
  const radiusDeg = 0.008 + ring * 0.009;
  return {
    lat: CENTER.lat + Math.sin(angle) * radiusDeg,
    lng: CENTER.lng + Math.cos(angle) * radiusDeg * 1.1
  };
}

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
  return SECTOR_NAMES.map((name, i) => {
    const center = offset(i);
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
