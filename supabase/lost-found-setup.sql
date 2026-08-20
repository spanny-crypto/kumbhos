-- Run this once in your Supabase project's SQL Editor to set up storage for
-- Lost & Found reports. This creates just the one table KumbhOS needs for
-- this feature — nothing else in the app touches your Supabase database.
--
-- How to run it: Supabase dashboard -> SQL Editor (left sidebar) -> New query
-- -> paste this whole file -> click "Run".

create extension if not exists "uuid-ossp";

create table if not exists lost_found_cases (
  id uuid primary key default uuid_generate_v4(),
  type text not null,
  status text not null default 'OPEN',
  approximate_zone_id text,
  description text not null,
  reported_at timestamptz not null default now(),
  contact_info text not null,
  data_source text not null default 'USER_REPORTED'
);

create index if not exists idx_lost_found_status on lost_found_cases(status);

alter table lost_found_cases enable row level security;

-- KumbhOS's server talks to this table with your service-role key, which
-- bypasses RLS entirely — these policies only matter if you ever query this
-- table with the public/anon key directly from a browser in the future.
create policy "public read lost_found" on lost_found_cases for select using (true);
create policy "public insert lost_found" on lost_found_cases for insert with check (true);
create policy "public update lost_found" on lost_found_cases for update using (true);
