import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env, isSupabaseLostFoundConfigured } from '@/lib/config/env';
import type { LostFoundCase } from './types';
import type { CreateLostFoundInput } from './provider';

// Backs ONLY the Lost & Found feature with real, persistent Supabase
// storage — every other feature in KumbhOS (zones, incidents, volunteers,
// etc.) intentionally stays on the in-memory demo provider. This keeps the
// flashy real-time demo features (crowd map, simulator) 100% reliable for
// a live audience while still proving out real database persistence where
// it matters least to break: lost-person and lost-item reports.
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

function rowToCase(row: LostFoundRow): LostFoundCase {
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

export const lostFoundBackup = {
  isConfigured: isSupabaseLostFoundConfigured,

  async list(): Promise<LostFoundCase[] | null> {
    if (!isSupabaseLostFoundConfigured()) return null;
    try {
      const { data, error } = await getClient().from('lost_found_cases').select('*').order('reported_at', { ascending: false });
      if (error) throw error;
      return (data as LostFoundRow[]).map(rowToCase);
    } catch (err) {
      console.error('[KumbhOS] Supabase Lost & Found read failed, falling back to demo data:', err instanceof Error ? err.message : err);
      return null;
    }
  },

  async create(input: CreateLostFoundInput): Promise<LostFoundCase | null> {
    if (!isSupabaseLostFoundConfigured()) return null;
    try {
      const { data, error } = await getClient()
        .from('lost_found_cases')
        .insert({
          type: input.type,
          status: 'OPEN',
          approximate_zone_id: input.approximateZoneId,
          description: input.description,
          contact_info: input.contactInfo,
          data_source: 'USER_REPORTED'
        })
        .select('*')
        .single();
      if (error) throw error;
      return rowToCase(data as LostFoundRow);
    } catch (err) {
      console.error('[KumbhOS] Supabase Lost & Found write failed, falling back to demo data:', err instanceof Error ? err.message : err);
      return null;
    }
  },

  async updateStatus(id: string, status: LostFoundCase['status']): Promise<LostFoundCase | null> {
    if (!isSupabaseLostFoundConfigured()) return null;
    try {
      const { data, error } = await getClient().from('lost_found_cases').update({ status }).eq('id', id).select('*').maybeSingle();
      if (error) throw error;
      return data ? rowToCase(data as LostFoundRow) : null;
    } catch (err) {
      console.error('[KumbhOS] Supabase Lost & Found update failed, falling back to demo data:', err instanceof Error ? err.message : err);
      return null;
    }
  }
};
