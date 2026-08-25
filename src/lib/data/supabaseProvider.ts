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
  Zone
} from './types';
import type { CreateIncidentInput, CreateLostFoundInput, DataProvider, WaterQualityInput } from './provider';

// Real Postgres-backed implementation of DataProvider. Only instantiated
// when isDemoMode() is false (see index.ts), i.e. when a Supabase project
// URL + service-role key are actually configured. The service-role key is
// read from lib/config/env.ts, which only ever runs server-side — this
// module must never be imported from a Client Component.
//
// Table shapes correspond to supabase/schema.sql. This provider intentionally
// mirrors DemoDataProvider's method contracts exactly so API routes are
// agnostic to which one is active.
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

  private async selectAll<T>(table: string): Promise<T[]> {
    const { data, error } = await this.client.from(table).select('*');
    if (error) throw new Error(`Supabase query failed on ${table}: ${error.message}`);
    return (data ?? []) as T[];
  }

  async getZones() {
    return this.selectAll<Zone>('zones');
  }
  async getZone(id: string) {
    const { data, error } = await this.client.from('zones').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(error.message);
    return (data as Zone) ?? null;
  }

  async getInfrastructure() {
    return this.selectAll<InfrastructureAsset>('infrastructure_assets');
  }
  async getToilets() {
    return this.selectAll<Toilet>('toilets');
  }

  async getIncidents() {
    return this.selectAll<Incident>('incidents');
  }
  async getIncident(id: string) {
    const { data, error } = await this.client.from('incidents').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(error.message);
    return (data as Incident) ?? null;
  }
  async createIncident(input: CreateIncidentInput) {
    const { data, error } = await this.client
      .from('incidents')
      .insert({ ...input, status: 'NEW', data_source: 'USER_REPORTED' })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data as Incident;
  }
  async updateIncidentStatus(id: string, status: IncidentStatus) {
    const { data, error } = await this.client.from('incidents').update({ status }).eq('id', id).select('*').maybeSingle();
    if (error) throw new Error(error.message);
    return (data as Incident) ?? null;
  }
  async assignIncident(id: string, teamId: string | null, volunteerId: string | null) {
    const { data, error } = await this.client
      .from('incidents')
      .update({ assigned_team_id: teamId, assigned_volunteer_id: volunteerId, status: 'DISPATCHED' })
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as Incident) ?? null;
  }

  async getResponseTeams() {
    return this.selectAll<ResponseTeam>('response_teams');
  }
  async getVolunteers() {
    return this.selectAll<Volunteer>('volunteers');
  }

  async getLostFoundCases() {
    return this.selectAll<LostFoundCase>('lost_found_cases');
  }
  async createLostFoundCase(input: CreateLostFoundInput) {
    const { data, error } = await this.client
      .from('lost_found_cases')
      .insert({ ...input, status: 'OPEN', data_source: 'USER_REPORTED' })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data as LostFoundCase;
  }
  async updateLostFoundStatus(id: string, status: LostFoundCase['status']) {
    const { data, error } = await this.client.from('lost_found_cases').update({ status }).eq('id', id).select('*').maybeSingle();
    if (error) throw new Error(error.message);
    return (data as LostFoundCase) ?? null;
  }

  async getFacilities() {
    return this.selectAll<Facility>('facilities');
  }
  async getEvents() {
    return this.selectAll<EventItem>('events');
  }
  async getAnnouncements() {
    return this.selectAll<Announcement>('announcements');
  }

  async getDataSources() {
    return this.selectAll<DataSourceRecord>('data_sources');
  }

  async getWaterQualityRecords() {
    const { data, error } = await this.client.from('water_quality_records').select('*').order('year', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as WaterQualityRecord[];
  }
  async createWaterQualityRecord(input: WaterQualityInput, updatedBy: string) {
    const { data, error } = await this.client
      .from('water_quality_records')
      .insert({ ...input, updated_by: updatedBy, updated_at: new Date().toISOString() })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data as WaterQualityRecord;
  }
  async updateWaterQualityRecord(id: string, input: Partial<WaterQualityInput>, updatedBy: string) {
    const { data, error } = await this.client
      .from('water_quality_records')
      .update({ ...input, updated_by: updatedBy, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as WaterQualityRecord) ?? null;
  }
  async deleteWaterQualityRecord(id: string) {
    const { error, count } = await this.client.from('water_quality_records').delete({ count: 'exact' }).eq('id', id);
    if (error) throw new Error(error.message);
    return (count ?? 0) > 0;
  }

  async applyScenario(type: ScenarioType, zoneId: string) {
    const { data, error } = await this.client
      .from('simulation_events')
      .insert({ type, zone_id: zoneId, triggered_at: new Date().toISOString(), summary: `${type} simulated for zone ${zoneId}` })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data as SimulationEvent;
  }
  async getRecentSimulationEvents() {
    const { data, error } = await this.client
      .from('simulation_events')
      .select('*')
      .order('triggered_at', { ascending: false })
      .limit(30);
    if (error) throw new Error(error.message);
    return (data ?? []) as SimulationEvent[];
  }
}
