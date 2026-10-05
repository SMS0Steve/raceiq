-- RaceIQ master Packing List
create table if not exists public.packing_list_items (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  item_name text not null,
  category text,
  default_assignee text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists packing_list_items_organisation_idx
  on public.packing_list_items (organisation_id, is_active, sort_order);

alter table public.packing_list_items enable row level security;

drop policy if exists "packing list team read" on public.packing_list_items;
drop policy if exists "packing list team insert" on public.packing_list_items;
drop policy if exists "packing list team update" on public.packing_list_items;
drop policy if exists "packing list team delete" on public.packing_list_items;

create policy "packing list team read"
on public.packing_list_items for select to authenticated
using (
  exists (
    select 1 from public.organisation_members om
    join public.core_person_auth ca on ca.person_id = om.person_id
    where om.organisation_id = packing_list_items.organisation_id
      and om.membership_status = 'active'
      and ca.auth_user_id = auth.uid()
  )
);

create policy "packing list team insert"
on public.packing_list_items for insert to authenticated
with check (
  exists (
    select 1 from public.organisation_members om
    join public.core_person_auth ca on ca.person_id = om.person_id
    where om.organisation_id = packing_list_items.organisation_id
      and om.membership_status = 'active'
      and ca.auth_user_id = auth.uid()
  )
);

create policy "packing list team update"
on public.packing_list_items for update to authenticated
using (
  exists (
    select 1 from public.organisation_members om
    join public.core_person_auth ca on ca.person_id = om.person_id
    where om.organisation_id = packing_list_items.organisation_id
      and om.membership_status = 'active'
      and ca.auth_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.organisation_members om
    join public.core_person_auth ca on ca.person_id = om.person_id
    where om.organisation_id = packing_list_items.organisation_id
      and om.membership_status = 'active'
      and ca.auth_user_id = auth.uid()
  )
);

create policy "packing list team delete"
on public.packing_list_items for delete to authenticated
using (
  exists (
    select 1 from public.organisation_members om
    join public.core_person_auth ca on ca.person_id = om.person_id
    where om.organisation_id = packing_list_items.organisation_id
      and om.membership_status = 'active'
      and ca.auth_user_id = auth.uid()
  )
);
