import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env, isSupabaseConfigured } from '@/lib/config/env';
import type { WristbandProfile, WristbandStatus } from './types';
import type { CreateWristbandInput } from './provider';
import { generateShortCode } from '@/lib/utils/id';

// Backs the ID Wristband feature with real, persistent Supabase storage —
// same pattern as lostFoundBackup.ts. This one matters even more than Lost
// & Found: a wristband is created once (at a kiosk, in a hurry) and then
// looked up by a stranger who scans it hours later, quite possibly after
// the demo provider's in-memory state has been wiped by a serverless cold
// start. Falls back to demo data (and a console warning) if Supabase isn't
// configured, so the feature still works for local/demo use — it just
// won't survive a restart in that mode.
//
// Server-only module — the service-role key here must never reach a
// Client Component. Only src/lib/data/demoProvider.ts imports this.

let client: SupabaseClient | null = null;
function getClient(): SupabaseClient {
  if (!client) {
    client = createClient(env.supabase.url!, env.supabase.serviceRoleKey!, { auth: { persistSession: false } });
  }
  return client;
}

interface WristbandRow {
  id: string;
  full_name: string;
  age: number | null;
  guardian_name: string;
  guardian_phone: string;
  meeting_point_zone_id: string | null;
  medical_notes: string | null;
  status: WristbandStatus;
  created_at: string;
  data_source: WristbandProfile['dataSource'];
}

function rowToProfile(row: WristbandRow): WristbandProfile {
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

export const wristbandBackup = {
  isConfigured: isSupabaseConfigured,

  async list(): Promise<WristbandProfile[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await getClient().from('wristband_profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data as WristbandRow[]).map(rowToProfile);
    } catch (err) {
      console.error('[KumbhOS] Supabase Wristband read failed, falling back to demo data:', err instanceof Error ? err.message : err);
      return null;
    }
  },

  async get(id: string): Promise<WristbandProfile | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await getClient().from('wristband_profiles').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data ? rowToProfile(data as WristbandRow) : null;
    } catch (err) {
      console.error('[KumbhOS] Supabase Wristband read failed, falling back to demo data:', err instanceof Error ? err.message : err);
      return null;
    }
  },

  async create(input: CreateWristbandInput): Promise<WristbandProfile | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await getClient()
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
      if (error) throw error;
      return rowToProfile(data as WristbandRow);
    } catch (err) {
      console.error('[KumbhOS] Supabase Wristband write failed, falling back to demo data:', err instanceof Error ? err.message : err);
      return null;
    }
  },

  async updateStatus(id: string, status: WristbandStatus): Promise<WristbandProfile | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await getClient().from('wristband_profiles').update({ status }).eq('id', id).select('*').maybeSingle();
      if (error) throw error;
      return data ? rowToProfile(data as WristbandRow) : null;
    } catch (err) {
      console.error('[KumbhOS] Supabase Wristband update failed, falling back to demo data:', err instanceof Error ? err.message : err);
      return null;
    }
  }
};
