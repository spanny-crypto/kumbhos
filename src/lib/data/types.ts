// Core domain types shared by the demo and Supabase data providers, the risk
// engines, and every API route / component. Keeping one shared shape means
// the UI never needs to know which provider served the data.

export type DataSource = 'SIMULATED' | 'LIVE' | 'GOVERNMENT_OPEN_DATA' | 'DERIVED' | 'USER_REPORTED';

export type RiskLevel = 'NORMAL' | 'BUILDING' | 'CRITICAL' | 'INTERVENTION';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Zone {
  id: string;
  name: string;
  sector: string;
  center: GeoPoint;
  boundary: GeoPoint[];
  capacity: number;
  currentPopulation: number;
  inflowPerMin: number;
  outflowPerMin: number;
  movementSpeedMps: number;
  directionConflict: number; // 0-1, how much crowd flow crosses itself
  exitCapacityFactor: number; // 0-1, available exit capacity relative to normal
  growthRatePerMin: number; // derived, % population change per minute
  updatedAt: string;
  dataSource: DataSource;
}

export interface CrowdPressure {
  zoneId: string;
  score: number; // 0-100
  level: RiskLevel;
  reason: string;
  factors: {
    capacityUtilization: number;
    densityScore: number;
    movementConflict: number;
    growthScore: number;
    exitAvailability: number;
  };
  computedAt: string;
}

export interface CrowdPrediction {
  zoneId: string;
  projectedScoreIn15Min: number;
  probabilityOfCritical: number; // 0-1
  minutesToCriticalThreshold: number | null;
  recommendation: string;
  computedAt: string;
}

export type AssetCategory =
  | 'TOILET'
  | 'WATER_POINT'
  | 'ROAD'
  | 'BRIDGE'
  | 'GHAT'
  | 'LIGHTING'
  | 'MEDICAL'
  | 'POLICE'
  | 'FIRE'
  | 'PARKING'
  | 'WASTE_BIN'
  | 'INFO_DISPLAY';

export type AssetStatus = 'OPERATIONAL' | 'DEGRADED' | 'CRITICAL' | 'OFFLINE';

export interface InfrastructureAsset {
  id: string;
  category: AssetCategory;
  name: string;
  zoneId: string;
  location: GeoPoint;
  capacity: number | null;
  status: AssetStatus;
  lastInspection: string;
  assignedTeam: string | null;
  dataSource: DataSource;
}

export type ToiletStatus = 'AVAILABLE' | 'BUSY' | 'NEEDS_CLEANING' | 'OUT_OF_SERVICE' | 'UNKNOWN';

export interface Toilet {
  id: string;
  clusterId: string;
  clusterName: string;
  zoneId: string;
  location: GeoPoint;
  capacity: number;
  accessible: boolean;
  waterAvailable: boolean;
  lastCleanedAt: string;
  estimatedUsagePerHour: number;
  complaints: number;
  status: ToiletStatus;
  dataSource: DataSource;
}

export interface SanitationPressure {
  clusterId: string;
  clusterName: string;
  pressure: 'NORMAL' | 'WATCH' | 'HIGH' | 'CRITICAL';
  minutesToServiceThreshold: number | null;
  recommendation: string;
  computedAt: string;
}

export type IncidentType =
  | 'MEDICAL'
  | 'FIRE'
  | 'MISSING_PERSON'
  | 'CROWD_SURGE'
  | 'ACCIDENT'
  | 'INFRASTRUCTURE_FAILURE'
  | 'WATER_FLOOD'
  | 'SECURITY'
  | 'OTHER';

export type IncidentSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type IncidentStatus = 'NEW' | 'ACKNOWLEDGED' | 'DISPATCHED' | 'RESPONDING' | 'RESOLVED';

export interface Incident {
  id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  zoneId: string;
  location: GeoPoint;
  description: string;
  reportedAt: string;
  updatedAt: string;
  assignedTeamId: string | null;
  assignedVolunteerId: string | null;
  dataSource: DataSource;
}

export type ResponderRole = 'MEDICAL' | 'POLICE' | 'FIRE' | 'SANITATION';

export interface ResponseTeam {
  id: string;
  role: ResponderRole;
  name: string;
  location: GeoPoint;
  available: boolean;
}

export interface DispatchRecommendation {
  incidentId: string;
  team: { id: string; name: string; role: ResponderRole; distanceMeters: number } | null;
  facility: { id: string; name: string; category: AssetCategory; distanceMeters: number } | null;
  volunteer: { id: string; name: string; distanceMeters: number } | null;
  suggestedRouteNote: string;
  recommendationText: string;
  requiresHumanConfirmation: true;
}

export interface Volunteer {
  id: string;
  name: string;
  zoneId: string;
  location: GeoPoint;
  skills: string[];
  languages: string[];
  available: boolean;
  currentAssignmentId: string | null;
}

export type LostFoundCaseType = 'LOST_PERSON' | 'FOUND_PERSON' | 'LOST_ITEM' | 'FOUND_ITEM';
export type LostFoundStatus = 'OPEN' | 'POTENTIAL_MATCH' | 'VERIFIED' | 'REUNITED' | 'CLOSED';

export interface LostFoundCase {
  id: string;
  type: LostFoundCaseType;
  status: LostFoundStatus;
  approximateZoneId: string;
  description: string;
  reportedAt: string;
  contactInfo: string;
  dataSource: DataSource;
}

export interface Facility {
  id: string;
  name: string;
  category: AssetCategory;
  zoneId: string;
  location: GeoPoint;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  zoneId: string | null;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  createdAt: string;
}

export type ScenarioType =
  | 'CROWD_INFLUX'
  | 'CROWD_DECREASE'
  | 'BRIDGE_CLOSURE'
  | 'ROAD_CLOSURE'
  | 'GHAT_CLOSURE'
  | 'TRAIN_ARRIVAL'
  | 'PARKING_OVERFLOW'
  | 'TOILET_OVERLOAD'
  | 'WATER_FAILURE'
  | 'MEDICAL_EMERGENCY'
  | 'FIRE_INCIDENT'
  | 'WEATHER_DISRUPTION'
  | 'EVENT_COMPLETION';

export interface SimulationEvent {
  id: string;
  type: ScenarioType;
  zoneId: string;
  triggeredAt: string;
  summary: string;
}

export interface DataSourceRecord {
  id: string;
  dataset: string;
  publisher: string;
  sourceUrl: string;
  license: string;
  dateObtained: string;
  lastUpdated: string;
  refreshFrequency: string;
  dataType: DataSource;
  status: 'ACTIVE' | 'STUBBED' | 'PLANNED';
}

// A numeric reading is sometimes a single value, sometimes a reported
// range (different sampling locations/dates gave different results) —
// keeping both shapes honest rather than collapsing a range into one
// misleadingly-precise number.
export type ReadingValue = number | { min: number; max: number } | null;

export type BathingStandardVerdict = 'MEETS_STANDARD' | 'EXCEEDS_STANDARD' | 'PARTIAL' | 'DISPUTED';
export type WaterQualityRiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'DISPUTED';

// Real, publicly reported Ganga/Yamuna water-quality figures from past
// Kumbh gatherings (CPCB/state Pollution Control Board reports, NGT
// filings, peer-reviewed sampling studies) — NOT simulated data, unlike
// most of the rest of this app. Every record carries its own source
// citation so each individual figure is independently checkable, on top
// of the app-wide /data-sources transparency page. Fully editable by
// Command Centre staff (requireWriteAccess) so figures can be corrected
// or extended as new official reports come out — see docs/DATABASE.md.
export interface WaterQualityRecord {
  id: string;
  kumbhEvent: string; // e.g. "Maha Kumbh 2025 — Prayagraj"
  year: number;
  location: string; // e.g. "Sangam (Ganga–Yamuna confluence)"
  samplingPeriod: string; // e.g. "12 Jan – 22 Feb 2025"
  ph: ReadingValue;
  dissolvedOxygenMgL: ReadingValue;
  bodMgL: ReadingValue;
  fecalColiformMpn100ml: ReadingValue;
  bathingStandardVerdict: BathingStandardVerdict;
  riskLevel: WaterQualityRiskLevel;
  summary: string;
  notes: string | null; // caveats, disputes, methodology notes
  sourcePublisher: string;
  sourceUrl: string;
  sourceDate: string; // publication date of the cited report/article
  dataSource: DataSource;
  updatedAt: string;
  updatedBy: string | null; // command-centre username, once edited by staff
}

export type WristbandStatus = 'ACTIVE' | 'REUNITED' | 'EXPIRED';

// A printable QR/ID card a guardian creates on-site for a child, elderly
// relative, or anyone who could get separated in the crowd. The id doubles
// as the short code printed on the physical band (see generateShortCode)
// and the path segment of the QR's URL (/wristband/[id]) — a stranger who
// finds the wearer scans it and immediately sees who to call, no app or
// login required. Deliberately minimal: no photo, no facial data, no
// address — just enough to reunite quickly. See docs/SECURITY.md.
export interface WristbandProfile {
  id: string;
  fullName: string;
  age: number | null;
  guardianName: string;
  guardianPhone: string;
  meetingPointZoneId: string | null;
  medicalNotes: string | null;
  status: WristbandStatus;
  createdAt: string;
  dataSource: DataSource;
}

export type Role =
  | 'SUPER_ADMIN'
  | 'COMMAND_CENTER'
  | 'POLICE'
  | 'MEDICAL'
  | 'FIRE'
  | 'SANITATION'
  | 'VOLUNTEER'
  | 'VIEW_ONLY';
