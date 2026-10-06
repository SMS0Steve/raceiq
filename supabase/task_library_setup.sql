-- RaceIQ shared Task Library + Event Tasks

create table if not exists public.task_library_items (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  task_name text not null,
  category text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_tasks (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  task_library_item_id uuid references public.task_library_items(id) on delete set null,
  task_name text not null,
  assigned_to uuid references public.organisation_members(id) on delete set null,
  assigned_role text,
  is_completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists task_library_items_org_idx on public.task_library_items(organisation_id,is_active,sort_order);
create index if not exists event_tasks_event_idx on public.event_tasks(event_id,is_completed);

alter table public.task_library_items enable row level security;
alter table public.event_tasks enable row level security;

drop policy if exists "task library team all" on public.task_library_items;
create policy "task library team all" on public.task_library_items
for all to authenticated
using (exists (
 select 1 from public.organisation_members om
 join public.core_person_auth ca on ca.person_id=om.person_id
 where om.organisation_id=task_library_items.organisation_id
 and om.membership_status='active' and ca.auth_user_id=auth.uid()
))
with check (exists (
 select 1 from public.organisation_members om
 join public.core_person_auth ca on ca.person_id=om.person_id
 where om.organisation_id=task_library_items.organisation_id
 and om.membership_status='active' and ca.auth_user_id=auth.uid()
));

drop policy if exists "event tasks team all" on public.event_tasks;
create policy "event tasks team all" on public.event_tasks
for all to authenticated
using (exists (
 select 1 from public.organisation_members om
 join public.core_person_auth ca on ca.person_id=om.person_id
 where om.organisation_id=event_tasks.organisation_id
 and om.membership_status='active' and ca.auth_user_id=auth.uid()
))
with check (
 exists (
  select 1 from public.organisation_members om
  join public.core_person_auth ca on ca.person_id=om.person_id
  where om.organisation_id=event_tasks.organisation_id
  and om.membership_status='active' and ca.auth_user_id=auth.uid()
 )
 and exists (
  select 1 from public.events e
  where e.id=event_tasks.event_id and e.organisation_id=event_tasks.organisation_id
 )
);
