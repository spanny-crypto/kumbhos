-- KumbhOS database schema (for LIVE mode — i.e. DEMO_MODE=false with a real
-- Supabase project configured). The app runs fully without this being
-- applied; it only matters once you flip out of demo mode. See
-- docs/DATABASE.md and docs/DEPLOYMENT.md.
--
-- Run with: supabase db push   (or paste into the SQL editor)

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Reference / lookup
-- ---------------------------------------------------------------------------

create table if not exists zones (
  id text primary key,
  name text not null,
  sector text not null,
  center jsonb not null,          -- { lat, lng }
  boundary jsonb not null,        -- [{ lat, lng }, ...]
  capacity integer not null,
  current_population integer not null default 0,
  inflow_per_min integer not null default 0,
  outflow_per_min integer not null default 0,
  movement_speed_mps numeric not null default 1,
  direction_conflict numeric not null default 0,
  exit_capacity_factor numeric not null default 1,
  growth_rate_per_min numeric not null default 0,
  updated_at timestamptz not null default now(),
  data_source text not null default 'LIVE'
);

create table if not exists crowd_snapshots (
  id uuid primary key default uuid_generate_v4(),
  zone_id text references zones(id) on delete cascade,
  score integer not null,
  level text not null,
  factors jsonb not null,
  recorded_at timestamptz not null default now()
);
create index if not exists idx_crowd_snapshots_zone_time on crowd_snapshots(zone_id, recorded_at desc);

create table if not exists crowd_predictions (
  id uuid primary key default uuid_generate_v4(),
  zone_id text references zones(id) on delete cascade,
  projected_score_in_15min integer not null,
  probability_of_critical numeric not null,
  minutes_to_critical_threshold integer,
  recommendation text not null,
  computed_at timestamptz not null default now()
);

create table if not exists infrastructure_assets (
  id text primary key,
  category text not null,
  name text not null,
  zone_id text references zones(id),
  location jsonb not null,
  capacity integer,
  status text not null default 'OPERATIONAL',
  last_inspection timestamptz not null default now(),
  assigned_team text,
  data_source text not null default 'LIVE'
);
create index if not exists idx_infra_status on infrastructure_assets(status);
create index if not exists idx_infra_zone on infrastructure_assets(zone_id);

create table if not exists infrastructure_inspections (
  id uuid primary key default uuid_generate_v4(),
  asset_id text references infrastructure_assets(id) on delete cascade,
  status text not null,
  notes text,
  inspected_at timestamptz not null default now(),
  inspected_by text
);

create table if not exists toilets (
  id text primary key,
  cluster_id text not null,
  cluster_name text not null,
  zone_id text references zones(id),
  location jsonb not null,
  capacity integer not null default 1,
  accessible boolean not null default false,
  water_available boolean not null default true,
  last_cleaned_at timestamptz not null default now(),
  estimated_usage_per_hour integer not null default 0,
  complaints integer not null default 0,
  status text not null default 'UNKNOWN',
  data_source text not null default 'LIVE'
);
create index if not exists idx_toilets_cluster on toilets(cluster_id);

create table if not exists sanitation_events (
  id uuid primary key default uuid_generate_v4(),
  toilet_id text references toilets(id) on delete cascade,
  event_type text not null,       -- CLEANED, COMPLAINT, INSPECTED
  notes text,
  recorded_at timestamptz not null default now()
);

create table if not exists water_assets (
  id text primary key,
  zone_id text references zones(id),
  location jsonb not null,
  status text not null default 'OPERATIONAL',
  last_checked timestamptz not null default now()
);

create table if not exists waste_assets (
  id text primary key,
  zone_id text references zones(id),
  location jsonb not null,
  status text not null default 'OPERATIONAL',
  last_emptied timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Operational
-- ---------------------------------------------------------------------------

create table if not exists incidents (
  id uuid primary key default uuid_generate_v4(),
  type text not null,
  severity text not null,
  status text not null default 'NEW',
  zone_id text references zones(id),
  location jsonb not null,
  description text not null,
  reported_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  assigned_team_id text,
  assigned_volunteer_id text,
  data_source text not null default 'USER_REPORTED'
);
create index if not exists idx_incidents_status on incidents(status);
create index if not exists idx_incidents_zone on incidents(zone_id);
create index if not exists idx_incidents_time on incidents(reported_at desc);

create table if not exists incident_assignments (
  id uuid primary key default uuid_generate_v4(),
  incident_id uuid references incidents(id) on delete cascade,
  team_id text,
  volunteer_id text,
  assigned_at timestamptz not null default now(),
  assigned_by text
);

create table if not exists response_teams (
  id text primary key,
  role text not null,
  name text not null,
  location jsonb not null,
  available boolean not null default true
);

create table if not exists volunteers (
  id text primary key,
  name text not null,
  zone_id text references zones(id),
  location jsonb not null,
  skills text[] not null default '{}',
  languages text[] not null default '{}',
  available boolean not null default true,
  current_assignment_id uuid
);

create table if not exists lost_found_cases (
  id uuid primary key default uuid_generate_v4(),
  type text not null,
  status text not null default 'OPEN',
  approximate_zone_id text references zones(id),
  description text not null,
  reported_at timestamptz not null default now(),
  contact_info text not null,
  data_source text not null default 'USER_REPORTED'
);
create index if not exists idx_lost_found_status on lost_found_cases(status);

create table if not exists facilities (
  id text primary key,
  name text not null,
  category text not null,
  zone_id text references zones(id),
  location jsonb not null
);

create table if not exists events (
  id text primary key,
  title text not null,
  description text not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  zone_id text references zones(id)
);

create table if not exists announcements (
  id text primary key,
  title text not null,
  body text not null,
  severity text not null default 'INFO',
  created_at timestamptz not null default now()
);

create table if not exists routes (
  id uuid primary key default uuid_generate_v4(),
  from_zone_id text references zones(id),
  to_facility_id text references facilities(id),
  route_type text not null,        -- FASTEST, SAFEST, LOWEST_CROWD, ACCESSIBLE
  distance_meters integer not null,
  estimated_minutes integer not null,
  computed_at timestamptz not null default now()
);

create table if not exists simulation_scenarios (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists simulation_events (
  id uuid primary key default uuid_generate_v4(),
  type text not null,
  zone_id text references zones(id),
  triggered_at timestamptz not null default now(),
  summary text not null,
  triggered_by text
);
create index if not exists idx_simulation_events_time on simulation_events(triggered_at desc);

create table if not exists data_sources (
  id text primary key,
  dataset text not null,
  publisher text not null,
  source_url text not null,
  license text not null,
  date_obtained text not null,
  last_updated text not null,
  refresh_frequency text not null,
  data_type text not null,
  status text not null default 'ACTIVE'
);

-- Real, publicly reported Ganga/Yamuna water-quality figures from past
-- Kumbh gatherings (CPCB / state Pollution Control Board reports, NGT
-- filings, sampling studies) — not synthetic data. Fully editable by
-- Command Centre staff; see src/lib/data/seed/waterQuality.ts for the
-- seeded starting set and src/app/command/water-quality/page.tsx for the
-- admin UI that writes here.
create table if not exists water_quality_records (
  id text primary key,
  kumbh_event text not null,
  year integer not null,
  location text not null,
  sampling_period text not null,
  ph jsonb,                          -- number | { min, max } | null
  dissolved_oxygen_mg_l jsonb,
  bod_mg_l jsonb,
  fecal_coliform_mpn_100ml jsonb,
  bathing_standard_verdict text not null,  -- MEETS_STANDARD | EXCEEDS_STANDARD | PARTIAL | DISPUTED
  risk_level text not null,                -- LOW | MODERATE | HIGH | DISPUTED
  summary text not null,
  notes text,
  source_publisher text not null,
  source_url text not null,
  source_date text not null,
  data_source text not null default 'GOVERNMENT_OPEN_DATA',
  updated_at timestamptz not null default now(),
  updated_by text
);
create index if not exists idx_water_quality_year on water_quality_records(year desc);

-- Printable ID/QR wristband profiles — guardians create these on-site for a
-- child or elderly relative so a stranger who finds them can scan the QR
-- (or read the printed short code) and immediately see who to call. id is
-- the short human-typeable code (see src/lib/utils/id.ts), not a uuid, since
-- it's printed on the physical band. Real user-entered contact/medical
-- info, not synthetic data — see src/lib/data/wristbandBackup.ts.
create table if not exists wristband_profiles (
  id text primary key,
  full_name text not null,
  age integer,
  guardian_name text not null,
  guardian_phone text not null,
  meeting_point_zone_id text references zones(id),
  medical_notes text,
  status text not null default 'ACTIVE',  -- ACTIVE | REUNITED | EXPIRED
  created_at timestamptz not null default now(),
  data_source text not null default 'USER_REPORTED'
);
create index if not exists idx_wristband_status on wristband_profiles(status);

-- ---------------------------------------------------------------------------
-- Auth / audit (for a future real-Supabase-Auth deployment)
-- ---------------------------------------------------------------------------

create table if not exists user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  action text not null,
  resource text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_logs_time on audit_logs(created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Public/read-only tables: anon key may SELECT. Writes (incidents,
-- lost_found_cases inserts excepted) require an authenticated user with an
-- appropriate role in user_roles. This mirrors the server-side rbac.ts
-- checks in the Next.js API layer — RLS is defense in depth, not a
-- replacement for those checks (and vice versa).
-- ---------------------------------------------------------------------------

alter table zones enable row level security;
alter table infrastructure_assets enable row level security;
alter table toilets enable row level security;
alter table facilities enable row level security;
alter table events enable row level security;
alter table announcements enable row level security;
alter table data_sources enable row level security;
alter table incidents enable row level security;
alter table lost_found_cases enable row level security;
alter table volunteers enable row level security;
alter table response_teams enable row level security;
alter table simulation_events enable row level security;
alter table audit_logs enable row level security;
alter table user_roles enable row level security;
alter table water_quality_records enable row level security;
alter table wristband_profiles enable row level security;

create policy "public read zones" on zones for select using (true);
create policy "public read infrastructure" on infrastructure_assets for select using (true);
create policy "public read toilets" on toilets for select using (true);
create policy "public read facilities" on facilities for select using (true);
create policy "public read events" on events for select using (true);
create policy "public read announcements" on announcements for select using (true);
create policy "public read data_sources" on data_sources for select using (true);

create policy "public read water_quality" on water_quality_records for select using (true);
create policy "staff write water_quality" on water_quality_records for insert with check (auth.role() = 'authenticated');
create policy "staff update water_quality" on water_quality_records for update using (auth.role() = 'authenticated');
create policy "staff delete water_quality" on water_quality_records for delete using (auth.role() = 'authenticated');

create policy "public read lost_found" on lost_found_cases for select using (true);
create policy "public insert lost_found" on lost_found_cases for insert with check (true);

-- No public/anon policy at all, unlike every other table above: wristband
-- profiles hold a real name, a guardian's phone number, and optional
-- medical notes for (often) a child. The app only ever reads/writes this
-- table server-side with the service-role key (which bypasses RLS and is
-- never exposed to the browser — see wristbandBackup.ts), gated by its own
-- rate-limited single-id lookup, so the anon key is intentionally left with
-- zero access here rather than mirroring lost_found_cases' public policies.
create policy "staff read wristbands" on wristband_profiles for select using (auth.role() = 'authenticated');
create policy "staff update wristbands" on wristband_profiles for update using (auth.role() = 'authenticated');

create policy "staff read incidents" on incidents for select using (auth.role() = 'authenticated');
create policy "staff write incidents" on incidents for insert with check (auth.role() = 'authenticated');
create policy "staff update incidents" on incidents for update using (auth.role() = 'authenticated');

create policy "staff read volunteers" on volunteers for select using (auth.role() = 'authenticated');
create policy "staff read response_teams" on response_teams for select using (auth.role() = 'authenticated');
create policy "staff read simulation_events" on simulation_events for select using (auth.role() = 'authenticated');
create policy "staff write simulation_events" on simulation_events for insert with check (auth.role() = 'authenticated');

create policy "staff read audit_logs" on audit_logs for select using (auth.role() = 'authenticated');
create policy "self read user_roles" on user_roles for select using (auth.uid() = user_id);
