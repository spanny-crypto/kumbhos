import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '@/lib/config/env';
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
  Zone
} from './types';
import type { CreateIncidentInput, CreateLostFoundInput, CreateWristbandInput, DataProvider, WaterQualityInput } from './provider';
import { generateShortCode } from '@/lib/utils/id';

// Real Postgres-backed implementation of DataProvider. Only instantiated
// when isDemoMode() is false (see index.ts), i.e. when a Supabase project
// URL + service-role key are actually configured. The service-role key is
// read from lib/config/env.ts, which only ever runs server-side — this
// module must never be imported from a Client Component.
//
// Table shapes correspond to supabase/schema.sql and use snake_case column
// names; every domain type in ./types.ts is camelCase. supabase-js returns
// whatever column names the table has, so each method below maps rows
// to/from the camelCase shape explicitly (mirroring the rowToProfile /
// rowToCase pattern in wristbandBackup.ts / lostFoundBackup.ts) rather than
// casting raw rows directly to the camelCase type.
//
// This provider intentionally mirrors DemoDataProvider's method contracts
// exactly so API routes are agnostic to which one is active.

interface ZoneRow {
  id: string;
  name: string;
  sector: string;
  center: Zone['center'];
  boundary: Zone['boundary'];
  capacity: number;
  current_population: number;
  inflow_per_min: number;
  outflow_per_min: number;
  movement_speed_mps: number;
  direction_conflict: number;
  exit_capacity_factor: number;
  growth_rate_per_min: number;
  updated_at: string;
  data_source: Zone['dataSource'];
}

function toZone(row: ZoneRow): Zone {
  return {
    id: row.id,
    name: row.name,
    sector: row.sector,
    center: row.center,
    boundary: row.boundary,
    capacity: row.capacity,
    currentPopulation: row.current_population,
    inflowPerMin: row.inflow_per_min,
    outflowPerMin: row.outflow_per_min,
    movementSpeedMps: row.movement_speed_mps,
    directionConflict: row.direction_conflict,
    exitCapacityFactor: row.exit_capacity_factor,
    growthRatePerMin: row.growth_rate_per_min,
    updatedAt: row.updated_at,
    dataSource: row.data_source
  };
}

interface InfrastructureAssetRow {
  id: string;
  category: InfrastructureAsset['category'];
  name: string;
  zone_id: string;
  location: InfrastructureAsset['location'];
  capacity: number | null;
  status: InfrastructureAsset['status'];
  last_inspection: string;
  assigned_team: string | null;
  data_source: InfrastructureAsset['dataSource'];
}

function toInfrastructureAsset(row: InfrastructureAssetRow): InfrastructureAsset {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    zoneId: row.zone_id,
    location: row.location,
    capacity: row.capacity,
    status: row.status,
    lastInspection: row.last_inspection,
    assignedTeam: row.assigned_team,
    dataSource: row.data_source
  };
}

interface ToiletRow {
  id: string;
  cluster_id: string;
  cluster_name: string;
  zone_id: string;
  location: Toilet['location'];
  capacity: number;
  accessible: boolean;
  water_available: boolean;
  last_cleaned_at: string;
  estimated_usage_per_hour: number;
  complaints: number;
  status: Toilet['status'];
  data_source: Toilet['dataSource'];
}

function toToilet(row: ToiletRow): Toilet {
  return {
    id: row.id,
    clusterId: row.cluster_id,
    clusterName: row.cluster_name,
    zoneId: row.zone_id,
    location: row.location,
    capacity: row.capacity,
    accessible: row.accessible,
    waterAvailable: row.water_available,
    lastCleanedAt: row.last_cleaned_at,
    estimatedUsagePerHour: row.estimated_usage_per_hour,
    complaints: row.complaints,
    status: row.status,
    dataSource: row.data_source
  };
}

interface IncidentRow {
  id: string;
  type: Incident['type'];
  severity: Incident['severity'];
  status: Incident['status'];
  zone_id: string;
  location: Incident['location'];
  description: string;
  reported_at: string;
  updated_at: string;
  assigned_team_id: string | null;
  assigned_volunteer_id: string | null;
  data_source: Incident['dataSource'];
}

function toIncident(row: IncidentRow): Incident {
  return {
    id: row.id,
    type: row.type,
    severity: row.severity,
    status: row.status,
    zoneId: row.zone_id,
    location: row.location,
    description: row.description,
    reportedAt: row.reported_at,
    updatedAt: row.updated_at,
    assignedTeamId: row.assigned_team_id,
    assignedVolunteerId: row.assigned_volunteer_id,
    dataSource: row.data_source
  };
}

interface VolunteerRow {
  id: string;
  name: string;
  zone_id: string;
  location: Volunteer['location'];
  skills: string[];
  languages: string[];
  available: boolean;
  current_assignment_id: string | null;
}

function toVolunteer(row: VolunteerRow): Volunteer {
  return {
    id: row.id,
    name: row.name,
    zoneId: row.zone_id,
    location: row.location,
    skills: row.skills,
    languages: row.languages,
    available: row.available,
    currentAssignmentId: row.current_assignment_id
  };
}

interface LostFoundRow {
  id: string;
  type: LostFoundCase['type'];
  status: LostFoundCase['status'];
  approximate_zone_id: string;
  description: string;
  reported_at: string;
  contact_info: string;
  data_source: LostFoundCase['dataSource'];
}

function toLostFoundCase(row: LostFoundRow): LostFoundCase {
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    approximateZoneId: row.approximate_zone_id,
    description: row.description,
    reportedAt: row.reported_at,
    contactInfo: row.contact_info,
    dataSource: row.data_source
  };
}

interface FacilityRow {
  id: string;
  name: string;
  category: Facility['category'];
  zone_id: string;
  location: Facility['location'];
}

function toFacility(row: FacilityRow): Facility {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    zoneId: row.zone_id,
    location: row.location
  };
}

interface EventRow {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  zone_id: string | null;
}

function toEventItem(row: EventRow): EventItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    startTime: row.start_time,
    endTime: row.end_time,
    zoneId: row.zone_id
  };
}

interface AnnouncementRow {
  id: string;
  title: string;
  body: string;
  severity: Announcement['severity'];
  created_at: string;
}

function toAnnouncement(row: AnnouncementRow): Announcement {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    severity: row.severity,
    createdAt: row.created_at
  };
}

interface DataSourceRow {
  id: string;
  dataset: string;
  publisher: string;
  source_url: string;
  license: string;
  date_obtained: string;
  last_updated: string;
  refresh_frequency: string;
  data_type: DataSourceRecord['dataType'];
  status: DataSourceRecord['status'];
}

function toDataSourceRecord(row: DataSourceRow): DataSourceRecord {
  return {
    id: row.id,
    dataset: row.dataset,
    publisher: row.publisher,
    sourceUrl: row.source_url,
    license: row.license,
    dateObtained: row.date_obtained,
    lastUpdated: row.last_updated,
    refreshFrequency: row.refresh_frequency,
    dataType: row.data_type,
    status: row.status
  };
}

interface WaterQualityRow {
  id: string;
  kumbh_event: string;
  year: number;
  location: string;
  sampling_period: string;
  ph: WaterQualityRecord['ph'];
  dissolved_oxygen_mg_l: WaterQualityRecord['dissolvedOxygenMgL'];
  bod_mg_l: WaterQualityRecord['bodMgL'];
  fecal_coliform_mpn_100ml: WaterQualityRecord['fecalColiformMpn100ml'];
  bathing_standard_verdict: WaterQualityRecord['bathingStandardVerdict'];
  risk_level: WaterQualityRecord['riskLevel'];
  summary: string;
  notes: string | null;
  source_publisher: string;
  source_url: string;
  source_date: string;
  data_source: WaterQualityRecord['dataSource'];
  updated_at: string;
  updated_by: string | null;
}

function toWaterQualityRecord(row: WaterQualityRow): WaterQualityRecord {
  return {
    id: row.id,
    kumbhEvent: row.kumbh_event,
    year: row.year,
    location: row.location,
    samplingPeriod: row.sampling_period,
    ph: row.ph,
    dissolvedOxygenMgL: row.dissolved_oxygen_mg_l,
    bodMgL: row.bod_mg_l,
    fecalColiformMpn100ml: row.fecal_coliform_mpn_100ml,
    bathingStandardVerdict: row.bathing_standard_verdict,
    riskLevel: row.risk_level,
    summary: row.summary,
    notes: row.notes,
    sourcePublisher: row.source_publisher,
    sourceUrl: row.source_url,
    sourceDate: row.source_date,
    dataSource: row.data_source,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by
  };
}

// Only maps fields actually present, so it works for both full inserts and
// partial updates (Partial<WaterQualityInput>).
function waterQualityInputToRow(input: Partial<WaterQualityInput>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.kumbhEvent !== undefined) row.kumbh_event = input.kumbhEvent;
  if (input.year !== undefined) row.year = input.year;
  if (input.location !== undefined) row.location = input.location;
  if (input.samplingPeriod !== undefined) row.sampling_period = input.samplingPeriod;
  if (input.ph !== undefined) row.ph = input.ph;
  if (input.dissolvedOxygenMgL !== undefined) row.dissolved_oxygen_mg_l = input.dissolvedOxygenMgL;
  if (input.bodMgL !== undefined) row.bod_mg_l = input.bodMgL;
  if (input.fecalColiformMpn100ml !== undefined) row.fecal_coliform_mpn_100ml = input.fecalColiformMpn100ml;
  if (input.bathingStandardVerdict !== undefined) row.bathing_standard_verdict = input.bathingStandardVerdict;
  if (input.riskLevel !== undefined) row.risk_level = input.riskLevel;
  if (input.summary !== undefined) row.summary = input.summary;
  if (input.notes !== undefined) row.notes = input.notes;
  if (input.sourcePublisher !== undefined) row.source_publisher = input.sourcePublisher;
  if (input.sourceUrl !== undefined) row.source_url = input.sourceUrl;
  if (input.sourceDate !== undefined) row.source_date = input.sourceDate;
  if (input.dataSource !== undefined) row.data_source = input.dataSource;
  return row;
}

interface WristbandRow {
  id: string;
  full_name: string;
  age: number | null;
  guardian_name: string;
  guardian_phone: string;
  meeting_point_zone_id: string | null;
  medical_notes: string | null;
  status: WristbandProfile['status'];
  created_at: string;
  data_source: WristbandProfile['dataSource'];
}

function toWristbandProfile(row: WristbandRow): WristbandProfile {
  return {
    id: row.id,
    fullName: row.full_name,
    age: row.age,
    guardianName: row.guardian_name,
    guardianPhone: row.guardian_phone,
    meetingPointZoneId: row.meeting_point_zone_id,
    medicalNotes: row.medical_notes,
    status: row.status,
    createdAt: row.created_at,
    dataSource: row.data_source
  };
}

interface SimulationEventRow {
  id: string;
  type: ScenarioType;
  zone_id: string;
  triggered_at: string;
  summary: string;
}

function toSimulationEvent(row: SimulationEventRow): SimulationEvent {
  return {
    id: row.id,
    type: row.type,
    zoneId: row.zone_id,
    triggeredAt: row.triggered_at,
    summary: row.summary
  };
}

export class SupabaseDataProvider implements DataProvider {
  readonly source = 'LIVE' as const;
  private client: SupabaseClient;

  constructor() {
    if (!env.supabase.url || !env.supabase.serviceRoleKey) {
      throw new Error('SupabaseDataProvider constructed without SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
    }
    this.client = createClient(env.supabase.url, env.supabase.serviceRoleKey, {
      auth: { persistSession: false }
    });
  }

  private async selectAll<Row, T>(table: string, mapRow: (row: Row) => T): Promise<T[]> {
    const { data, error } = await this.client.from(table).select('*');
    if (error) throw new Error(`Supabase query failed on ${table}: ${error.message}`);
    return ((data ?? []) as Row[]).map(mapRow);
  }

  async getZones() {
    return this.selectAll<ZoneRow, Zone>('zones', toZone);
  }
  async getZone(id: string) {
    const { data, error } = await this.client.from('zones').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toZone(data as ZoneRow) : null;
  }

  async getInfrastructure() {
    return this.selectAll<InfrastructureAssetRow, InfrastructureAsset>('infrastructure_assets', toInfrastructureAsset);
  }
  async getToilets() {
    return this.selectAll<ToiletRow, Toilet>('toilets', toToilet);
  }

  async getIncidents() {
    return this.selectAll<IncidentRow, Incident>('incidents', toIncident);
  }
  async getIncident(id: string) {
    const { data, error } = await this.client.from('incidents').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toIncident(data as IncidentRow) : null;
  }
  async createIncident(input: CreateIncidentInput) {
    const { data, error } = await this.client
      .from('incidents')
      .insert({
        type: input.type,
        severity: input.severity,
        zone_id: input.zoneId,
        description: input.description,
        status: 'NEW',
        data_source: 'USER_REPORTED'
      })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return toIncident(data as IncidentRow);
  }
  async updateIncidentStatus(id: string, status: IncidentStatus) {
    const { data, error } = await this.client.from('incidents').update({ status }).eq('id', id).select('*').maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toIncident(data as IncidentRow) : null;
  }
  async assignIncident(id: string, teamId: string | null, volunteerId: string | null) {
    const { data, error } = await this.client
      .from('incidents')
      .update({ assigned_team_id: teamId, assigned_volunteer_id: volunteerId, status: 'DISPATCHED' })
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toIncident(data as IncidentRow) : null;
  }

  async getResponseTeams() {
    return this.selectAll<ResponseTeam, ResponseTeam>('response_teams', (row) => row);
  }
  async getVolunteers() {
    return this.selectAll<VolunteerRow, Volunteer>('volunteers', toVolunteer);
  }

  async getLostFoundCases() {
    return this.selectAll<LostFoundRow, LostFoundCase>('lost_found_cases', toLostFoundCase);
  }
  async createLostFoundCase(input: CreateLostFoundInput) {
    const { data, error } = await this.client
      .from('lost_found_cases')
      .insert({
        type: input.type,
        approximate_zone_id: input.approximateZoneId,
        description: input.description,
        contact_info: input.contactInfo,
        status: 'OPEN',
        data_source: 'USER_REPORTED'
      })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return toLostFoundCase(data as LostFoundRow);
  }
  async updateLostFoundStatus(id: string, status: LostFoundCase['status']) {
    const { data, error } = await this.client.from('lost_found_cases').update({ status }).eq('id', id).select('*').maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toLostFoundCase(data as LostFoundRow) : null;
  }

  async getFacilities() {
    return this.selectAll<FacilityRow, Facility>('facilities', toFacility);
  }
  async getEvents() {
    return this.selectAll<EventRow, EventItem>('events', toEventItem);
  }
  async getAnnouncements() {
    return this.selectAll<AnnouncementRow, Announcement>('announcements', toAnnouncement);
  }

  async getDataSources() {
    return this.selectAll<DataSourceRow, DataSourceRecord>('data_sources', toDataSourceRecord);
  }

  async getWaterQualityRecords() {
    const { data, error } = await this.client.from('water_quality_records').select('*').order('year', { ascending: false });
    if (error) throw new Error(error.message);
    return ((data ?? []) as WaterQualityRow[]).map(toWaterQualityRecord);
  }
  async createWaterQualityRecord(input: WaterQualityInput, updatedBy: string) {
    const { data, error } = await this.client
      .from('water_quality_records')
      .insert({
        ...waterQualityInputToRow(input),
        id: generateShortCode(),
        updated_by: updatedBy,
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return toWaterQualityRecord(data as WaterQualityRow);
  }
  async updateWaterQualityRecord(id: string, input: Partial<WaterQualityInput>, updatedBy: string) {
    const { data, error } = await this.client
      .from('water_quality_records')
      .update({
        ...waterQualityInputToRow(input),
        updated_by: updatedBy,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toWaterQualityRecord(data as WaterQualityRow) : null;
  }
  async deleteWaterQualityRecord(id: string) {
    const { error, count } = await this.client.from('water_quality_records').delete({ count: 'exact' }).eq('id', id);
    if (error) throw new Error(error.message);
    return (count ?? 0) > 0;
  }

  async getWristbandProfiles() {
    const { data, error } = await this.client.from('wristband_profiles').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return ((data ?? []) as WristbandRow[]).map(toWristbandProfile);
  }
  async getWristbandProfile(id: string) {
    const { data, error } = await this.client.from('wristband_profiles').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toWristbandProfile(data as WristbandRow) : null;
  }
  async createWristbandProfile(input: CreateWristbandInput) {
    const { data, error } = await this.client
      .from('wristband_profiles')
      .insert({
        id: generateShortCode(),
        full_name: input.fullName,
        age: input.age,
        guardian_name: input.guardianName,
        guardian_phone: input.guardianPhone,
        meeting_point_zone_id: input.meetingPointZoneId,
        medical_notes: input.medicalNotes,
        status: 'ACTIVE',
        data_source: 'USER_REPORTED'
      })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return toWristbandProfile(data as WristbandRow);
  }
  async updateWristbandStatus(id: string, status: WristbandProfile['status']) {
    const { data, error } = await this.client.from('wristband_profiles').update({ status }).eq('id', id).select('*').maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toWristbandProfile(data as WristbandRow) : null;
  }

  async applyScenario(type: ScenarioType, zoneId: string) {
    const { data, error } = await this.client
      .from('simulation_events')
      .insert({ type, zone_id: zoneId, triggered_at: new Date().toISOString(), summary: `${type} simulated for zone ${zoneId}` })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return toSimulationEvent(data as SimulationEventRow);
  }
  async getRecentSimulationEvents() {
    const { data, error } = await this.client
      .from('simulation_events')
      .select('*')
      .order('triggered_at', { ascending: false })
      .limit(30);
    if (error) throw new Error(error.message);
    return ((data ?? []) as SimulationEventRow[]).map(toSimulationEvent);
  }
}
