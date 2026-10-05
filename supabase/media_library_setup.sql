-- RaceIQ central Media Library setup
-- Run once in the Supabase SQL Editor.

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  name text not null,
  asset_type text not null default 'Photo',
  storage_path text not null,
  mime_type text,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.media_assets enable row level security;

insert into storage.buckets (id,name,public)
values ('media-library','media-library',true)
on conflict (id) do update set public = excluded.public;

-- Authenticated RaceIQ users can read assets belonging to organisations they belong to.
drop policy if exists "media_assets_select_org_members" on public.media_assets;
create policy "media_assets_select_org_members" on public.media_assets
for select to authenticated
using (
  exists (
    select 1
    from public.core_person_auth cpa
    join public.organisation_members om on om.person_id = cpa.person_id
    where cpa.auth_user_id = auth.uid()
      and om.organisation_id = media_assets.organisation_id
      and om.membership_status = 'active'
  )
);

drop policy if exists "media_assets_insert_org_members" on public.media_assets;
create policy "media_assets_insert_org_members" on public.media_assets
for insert to authenticated
with check (
  created_by = auth.uid()
  and exists (
    select 1
    from public.core_person_auth cpa
    join public.organisation_members om on om.person_id = cpa.person_id
    where cpa.auth_user_id = auth.uid()
      and om.organisation_id = media_assets.organisation_id
      and om.membership_status = 'active'
  )
);

drop policy if exists "media_assets_update_org_members" on public.media_assets;
create policy "media_assets_update_org_members" on public.media_assets
for update to authenticated
using (
  exists (
    select 1 from public.core_person_auth cpa
    join public.organisation_members om on om.person_id = cpa.person_id
    where cpa.auth_user_id = auth.uid()
      and om.organisation_id = media_assets.organisation_id
      and om.membership_status = 'active'
  )
)
with check (
  exists (
    select 1 from public.core_person_auth cpa
    join public.organisation_members om on om.person_id = cpa.person_id
    where cpa.auth_user_id = auth.uid()
      and om.organisation_id = media_assets.organisation_id
      and om.membership_status = 'active'
  )
);

-- Files are stored as: organisation-id/random-file-name.ext
-- Storage policies validate that the first folder is an organisation the user belongs to.
drop policy if exists "media_library_select_org_members" on storage.objects;
create policy "media_library_select_org_members" on storage.objects
for select to authenticated
using (
  bucket_id = 'media-library'
  and exists (
    select 1 from public.core_person_auth cpa
    join public.organisation_members om on om.person_id = cpa.person_id
    where cpa.auth_user_id = auth.uid()
      and om.organisation_id::text = (storage.foldername(name))[1]
      and om.membership_status = 'active'
  )
);

drop policy if exists "media_library_insert_org_members" on storage.objects;
create policy "media_library_insert_org_members" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'media-library'
  and exists (
    select 1 from public.core_person_auth cpa
    join public.organisation_members om on om.person_id = cpa.person_id
    where cpa.auth_user_id = auth.uid()
      and om.organisation_id::text = (storage.foldername(name))[1]
      and om.membership_status = 'active'
  )
);
