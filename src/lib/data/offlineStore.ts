'use client';

// The offline (Android app) data source.
//
// The web build fetches every screen's data from /api/* route handlers. In
// the packaged Android app there is no server at all — so instead of
// fetching, the whole dataset is computed here, in the browser, once at
// module load. Every seed generator and risk engine is pure TypeScript with
// only type-level imports (no next/headers, no Supabase client), so they run
// identically client-side.
//
// The point of this is that data is *already there* on first paint: no
// spinner, no network wait, no refetch loop. useApi() reads straight out of
// this snapshot synchronously when NEXT_PUBLIC_OFFLINE_APP is set.
import {
  generateAnnouncements,
  generateDataSources,
  generateEvents,
  generateFacilities,
  generateIncidents,
  generateInfrastructure,
  generateLostFoundCases,
  generateToilets,
  generateVolunteers,
  generateZones
} from './seed/generate';
import { generateWaterQualityRecords } from './seed/waterQuality';
import { computeCrowdPressure } from '@/lib/risk/pressureIndex';
import { predictCrowdPressure } from '@/lib/risk/prediction';
import { computeSanitationPressure } from '@/lib/risk/sanitationPressure';
import type { AssetStatus, IncidentSeverity, InfrastructureAsset, RiskLevel, Toilet, WristbandProfile } from './types';
import type { BillboardEntry, BillboardSeverity } from './billboardTypes';

export const IS_OFFLINE_APP = process.env.NEXT_PUBLIC_OFFLINE_APP === 'true';

const WRISTBAND_STORAGE_KEY = 'kumbhos-offline-wristbands';

// Built once, eagerly, at module load — this is a few milliseconds of pure
// computation over ~20 zones and their derived assets.
function buildSnapshot() {
  const zones = generateZones();
  const infrastructure = generateInfrastructure(zones);
  const toilets = generateToilets(zones);
  const incidents = generateIncidents(zones);
  const volunteers = generateVolunteers(zones);
  const lostFound = generateLostFoundCases(zones);
  const facilities = generateFacilities(infrastructure);
  const events = generateEvents(zones);
  const announcements = generateAnnouncements();
  const dataSources = generateDataSources();
  const waterQuality = generateWaterQualityRecords();

  const zonesWithPressure = zones.map((zone) => ({ zone, pressure: computeCrowdPressure(zone) }));

  const byCluster = new Map<string, Toilet[]>();
  for (const t of toilets) {
    const list = byCluster.get(t.clusterId) ?? [];
    list.push(t);
    byCluster.set(t.clusterId, list);
  }
  const sanitationPressure = Array.from(byCluster.entries()).map(([clusterId, list]) =>
    computeSanitationPressure({ clusterId, toilets: list })
  );

  return {
    zones,
    zonesWithPressure,
    infrastructure,
    toilets,
    sanitationPressure,
    incidents,
    volunteers,
    lostFound,
    facilities,
    events,
    announcements,
    dataSources,
    waterQuality
  };
}

const snapshot = buildSnapshot();

type Status = 'SAFE' | 'MODERATE' | 'CRITICAL';

function assetGroupStatus(assets: InfrastructureAsset[]): Status {
  if (assets.some((a) => a.status === 'OFFLINE' || a.status === 'CRITICAL')) return 'CRITICAL';
  if (assets.some((a) => a.status === 'DEGRADED')) return 'MODERATE';
  return 'SAFE';
}
function operationalCount(assets: InfrastructureAsset[]): number {
  return assets.filter((a: { status: AssetStatus }) => a.status === 'OPERATIONAL').length;
}

function buildDashboardSummary() {
  const { zonesWithPressure, infrastructure, toilets, sanitationPressure, incidents, volunteers, lostFound } = snapshot;

  const criticalZones = zonesWithPressure.filter((z) => z.pressure.level === 'CRITICAL' || z.pressure.level === 'INTERVENTION').length;
  const buildingZones = zonesWithPressure.filter((z) => z.pressure.level === 'BUILDING').length;
  const crowdStatus: Status = criticalZones > 0 ? 'CRITICAL' : buildingZones > 0 ? 'MODERATE' : 'SAFE';

  const byCategory = (cat: string | string[]) => {
    const cats = Array.isArray(cat) ? cat : [cat];
    return infrastructure.filter((a) => cats.includes(a.category));
  };
  const parking = byCategory('PARKING');
  const water = byCategory('WATER_POINT');
  const hospitals = byCategory('MEDICAL');
  const roadsBridges = byCategory(['ROAD', 'BRIDGE']);

  const sanitationStatus: Status = sanitationPressure.some((p) => p.pressure === 'CRITICAL')
    ? 'CRITICAL'
    : sanitationPressure.some((p) => p.pressure === 'HIGH' || p.pressure === 'WATCH')
      ? 'MODERATE'
      : 'SAFE';
  const availableToilets = toilets.filter((t) => t.status === 'AVAILABLE').length;

  const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED');
  const criticalIncidents = activeIncidents.filter((i) => i.severity === 'CRITICAL' || i.severity === 'HIGH').length;
  const incidentStatus: Status = criticalIncidents > 0 ? 'CRITICAL' : activeIncidents.length > 0 ? 'MODERATE' : 'SAFE';

  const availableVolunteers = volunteers.filter((v) => v.available).length;
  const openLostFound = lostFound.filter((c) => c.status !== 'REUNITED' && c.status !== 'CLOSED').length;

  return {
    crowd: { status: crowdStatus, criticalZones, totalZones: snapshot.zones.length },
    parking: { status: assetGroupStatus(parking), operational: operationalCount(parking), total: parking.length },
    water: { status: assetGroupStatus(water), operational: operationalCount(water), total: water.length },
    hospitals: { status: assetGroupStatus(hospitals), operational: operationalCount(hospitals), total: hospitals.length },
    roadsBridges: { status: assetGroupStatus(roadsBridges), operational: operationalCount(roadsBridges), total: roadsBridges.length },
    sanitation: { status: sanitationStatus, available: availableToilets, total: toilets.length },
    incidents: { status: incidentStatus, active: activeIncidents.length, total: incidents.length },
    volunteers: { status: availableVolunteers > 0 ? 'SAFE' : 'MODERATE', available: availableVolunteers, total: volunteers.length },
    lostFound: { status: openLostFound > 3 ? 'MODERATE' : 'SAFE', open: openLostFound, total: lostFound.length }
  };
}

const ZONE_LEVEL_SEVERITY: Record<RiskLevel, BillboardSeverity | null> = {
  NORMAL: null,
  BUILDING: 'WATCH',
  CRITICAL: 'WARNING',
  INTERVENTION: 'CRITICAL'
};
const INCIDENT_SEVERITY: Record<IncidentSeverity, BillboardSeverity | null> = {
  LOW: null,
  MODERATE: 'WATCH',
  HIGH: 'WARNING',
  CRITICAL: 'CRITICAL'
};
const SEVERITY_RANK: Record<BillboardSeverity, number> = { CRITICAL: 3, WARNING: 2, WATCH: 1, INFO: 0 };

function buildBillboard(): BillboardEntry[] {
  const entries: BillboardEntry[] = [];
  const zoneNameById = new Map(snapshot.zones.map((z) => [z.id, z.name]));

  for (const { zone, pressure } of snapshot.zonesWithPressure) {
    const severity = ZONE_LEVEL_SEVERITY[pressure.level];
    if (!severity) continue;
    entries.push({
      id: `zone-${zone.id}`,
      severity,
      category: 'CROWD',
      zoneName: zone.name,
      headline: `${zone.name.toUpperCase()} — ${pressure.level} — SCORE ${pressure.score}`,
      detail: predictCrowdPressure(zone).recommendation,
      timestamp: pressure.computedAt
    });
  }

  for (const incident of snapshot.incidents) {
    if (incident.status === 'RESOLVED') continue;
    const severity = INCIDENT_SEVERITY[incident.severity];
    if (!severity) continue;
    const zoneName = zoneNameById.get(incident.zoneId) ?? incident.zoneId;
    entries.push({
      id: `incident-${incident.id}`,
      severity,
      category: 'INCIDENT',
      zoneName,
      headline: `${zoneName.toUpperCase()} — ${incident.type.replace('_', ' ')} — ${incident.severity}`,
      detail: incident.description,
      timestamp: incident.updatedAt
    });
  }

  entries.sort((a, b) => {
    const rankDiff = SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity];
    if (rankDiff !== 0) return rankDiff;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return entries.slice(0, 40);
}

// Wristbands are the one thing users create inside the app, so they persist
// to localStorage rather than living in the read-only snapshot.
function readStoredWristbands(): WristbandProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WRISTBAND_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WristbandProfile[]) : [];
  } catch {
    return [];
  }
}

export function saveOfflineWristband(profile: WristbandProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WRISTBAND_STORAGE_KEY, JSON.stringify([profile, ...readStoredWristbands()]));
  } catch {
    // Storage blocked — the band still works for this session via the QR the
    // user already printed; nothing else to do here.
  }
}

export function findOfflineWristband(id: string): WristbandProfile | null {
  return readStoredWristbands().find((w) => w.id.toUpperCase() === id.toUpperCase()) ?? null;
}

/**
 * Maps an /api/* URL to its already-computed local result. Returns
 * `undefined` for anything not served offline, so callers can fall back.
 */
export function resolveOffline(url: string): unknown | undefined {
  const path = url.split('?')[0] ?? url;

  switch (path) {
    case '/api/zones':
      return snapshot.zonesWithPressure;
    case '/api/dashboard-summary':
      return buildDashboardSummary();
    case '/api/infrastructure':
      return snapshot.infrastructure;
    case '/api/toilets':
      return { toilets: snapshot.toilets, pressure: snapshot.sanitationPressure };
    case '/api/facilities':
      return snapshot.facilities;
    case '/api/events':
      return snapshot.events;
    case '/api/announcements':
      return snapshot.announcements;
    case '/api/data-sources':
      return snapshot.dataSources;
    case '/api/water-quality':
      return snapshot.waterQuality;
    case '/api/lost-found':
      return snapshot.lostFound;
    case '/api/billboard':
      return buildBillboard();
    case '/api/wristbands':
      return readStoredWristbands();
    default:
      break;
  }

  const wristbandMatch = path.match(/^\/api\/wristbands\/([^/]+)$/);
  if (wristbandMatch) {
    const found = findOfflineWristband(wristbandMatch[1]!);
    if (!found) throw new Error('No wristband found with that code.');
    return found;
  }

  return undefined;
}

export const offlineSnapshot = snapshot;
