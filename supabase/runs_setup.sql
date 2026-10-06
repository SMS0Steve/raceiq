create table if not exists public.vehicle_runs (
 id uuid primary key default gen_random_uuid(),
 organisation_id uuid not null references public.organisations(id) on delete cascade,
 vehicle_id uuid not null references public.vehicles(id) on delete cascade,
 event_id uuid references public.events(id) on delete set null,
 source text not null default 'historical',
 run_date date not null,
 venue text,
 event_name text,
 run_type text,
 dial_in numeric,
 reaction_time numeric,
 sixty_ft numeric,
 three_thirty_ft numeric,
 eighth_et numeric,
 eighth_mph numeric,
 thousand_ft numeric,
 quarter_et numeric,
 quarter_mph numeric,
 temperature_c numeric,
 humidity_percent numeric,
 barometric_pressure numeric,
 density_altitude numeric,
 tyre_pressure_left numeric,
 tyre_pressure_right numeric,
 carburettor_jetting text,
 ballast_weight numeric,
 notes text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint vehicle_runs_source_check check (source in ('historical','raceiq'))
);
create index if not exists vehicle_runs_vehicle_idx on public.vehicle_runs(vehicle_id,run_date desc);
create index if not exists vehicle_runs_event_idx on public.vehicle_runs(event_id,run_date desc);
alter table public.vehicle_runs enable row level security;
drop policy if exists "vehicle runs team all" on public.vehicle_runs;
create policy "vehicle runs team all" on public.vehicle_runs for all to authenticated
using (exists (select 1 from public.organisation_members om join public.core_person_auth ca on ca.person_id=om.person_id where om.organisation_id=vehicle_runs.organisation_id and om.membership_status='active' and ca.auth_user_id=auth.uid()))
with check (exists (select 1 from public.organisation_members om join public.core_person_auth ca on ca.person_id=om.person_id where om.organisation_id=vehicle_runs.organisation_id and om.membership_status='active' and ca.auth_user_id=auth.uid()));
