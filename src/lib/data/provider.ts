import type {
  Announcement,
  DataSourceRecord,
  EventItem,
  Facility,
  Incident,
  IncidentStatus,
  InfrastructureAsset,
  LostFoundCase,
  ResponseTeam,
  ScenarioType,
  SimulationEvent,
  Toilet,
  Volunteer,
  WaterQualityRecord,
  WristbandProfile,
  WristbandStatus,
  Zone
} from './types';

export interface CreateIncidentInput {
  type: Incident['type'];
  severity: Incident['severity'];
  zoneId: string;
  description: string;
}

export interface CreateLostFoundInput {
  type: LostFoundCase['type'];
  approximateZoneId: string;
  description: string;
  contactInfo: string;
}

// Every field is editable by Command Centre staff — see
// src/app/command/water-quality/page.tsx and docs/DATABASE.md.
export type WaterQualityInput = Omit<WaterQualityRecord, 'id' | 'updatedAt' | 'updatedBy'>;

export interface CreateWristbandInput {
  fullName: string;
  age: number | null;
  guardianName: string;
  guardianPhone: string;
  meetingPointZoneId: string | null;
  medicalNotes: string | null;
}

/**
 * Everything the app needs from a data backend. DemoDataProvider implements
 * this over in-memory synthetic data; SupabaseDataProvider implements it
 * over real Postgres. API routes depend only on this interface, never on a
 * concrete provider, so swapping backends never touches route/component code.
 */
export interface DataProvider {
  readonly source: 'SIMULATED' | 'LIVE';

  getZones(): Promise<Zone[]>;
  getZone(id: string): Promise<Zone | null>;

  getInfrastructure(): Promise<InfrastructureAsset[]>;
  getToilets(): Promise<Toilet[]>;

  getIncidents(): Promise<Incident[]>;
  getIncident(id: string): Promise<Incident | null>;
  createIncident(input: CreateIncidentInput): Promise<Incident>;
  updateIncidentStatus(id: string, status: IncidentStatus): Promise<Incident | null>;
  assignIncident(id: string, teamId: string | null, volunteerId: string | null): Promise<Incident | null>;

  getResponseTeams(): Promise<ResponseTeam[]>;
  getVolunteers(): Promise<Volunteer[]>;

  getLostFoundCases(): Promise<LostFoundCase[]>;
  createLostFoundCase(input: CreateLostFoundInput): Promise<LostFoundCase>;
  updateLostFoundStatus(id: string, status: LostFoundCase['status']): Promise<LostFoundCase | null>;

  getFacilities(): Promise<Facility[]>;
  getEvents(): Promise<EventItem[]>;
  getAnnouncements(): Promise<Announcement[]>;

  getDataSources(): Promise<DataSourceRecord[]>;

  getWaterQualityRecords(): Promise<WaterQualityRecord[]>;
  createWaterQualityRecord(input: WaterQualityInput, updatedBy: string): Promise<WaterQualityRecord>;
  updateWaterQualityRecord(id: string, input: Partial<WaterQualityInput>, updatedBy: string): Promise<WaterQualityRecord | null>;
  deleteWaterQualityRecord(id: string): Promise<boolean>;

  getWristbandProfiles(): Promise<WristbandProfile[]>;
  getWristbandProfile(id: string): Promise<WristbandProfile | null>;
  createWristbandProfile(input: CreateWristbandInput): Promise<WristbandProfile>;
  updateWristbandStatus(id: string, status: WristbandStatus): Promise<WristbandProfile | null>;

  applyScenario(type: ScenarioType, zoneId: string): Promise<SimulationEvent>;
  getRecentSimulationEvents(): Promise<SimulationEvent[]>;
}
