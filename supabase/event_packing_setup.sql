-- RaceIQ per-event Packing Checklist
create table if not exists public.event_packing_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  packing_list_item_id uuid not null references public.packing_list_items(id) on delete cascade,
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  item_name text not null,
  category text,
  assigned_to uuid references public.organisation_members(id) on delete set null,
  is_packed boolean not null default false,
  packed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(event_id, packing_list_item_id)
);

create index if not exists event_packing_items_event_idx on public.event_packing_items(event_id, is_packed);
alter table public.event_packing_items enable row level security;

drop policy if exists "event packing team read" on public.event_packing_items;
drop policy if exists "event packing team insert" on public.event_packing_items;
drop policy if exists "event packing team update" on public.event_packing_items;
drop policy if exists "event packing team delete" on public.event_packing_items;

create policy "event packing team read" on public.event_packing_items for select to authenticated using (
 exists (select 1 from public.organisation_members om join public.core_person_auth ca on ca.person_id=om.person_id where om.organisation_id=event_packing_items.organisation_id and om.membership_status='active' and ca.auth_user_id=auth.uid())
);
create policy "event packing team insert" on public.event_packing_items for insert to authenticated with check (
 exists (select 1 from public.organisation_members om join public.core_person_auth ca on ca.person_id=om.person_id where om.organisation_id=event_packing_items.organisation_id and om.membership_status='active' and ca.auth_user_id=auth.uid())
 and exists (select 1 from public.events e where e.id=event_packing_items.event_id and e.organisation_id=event_packing_items.organisation_id)
);
create policy "event packing team update" on public.event_packing_items for update to authenticated using (
 exists (select 1 from public.organisation_members om join public.core_person_auth ca on ca.person_id=om.person_id where om.organisation_id=event_packing_items.organisation_id and om.membership_status='active' and ca.auth_user_id=auth.uid())
) with check (
 exists (select 1 from public.organisation_members om join public.core_person_auth ca on ca.person_id=om.person_id where om.organisation_id=event_packing_items.organisation_id and om.membership_status='active' and ca.auth_user_id=auth.uid())
);
create policy "event packing team delete" on public.event_packing_items for delete to authenticated using (
 exists (select 1 from public.organisation_members om join public.core_person_auth ca on ca.person_id=om.person_id where om.organisation_id=event_packing_items.organisation_id and om.membership_status='active' and ca.auth_user_id=auth.uid())
);
