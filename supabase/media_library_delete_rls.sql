-- RaceIQ Media Library delete policies
-- Allows authenticated active team members to remove Media Library records
-- and files belonging to their organisation.

alter table public.media_assets enable row level security;

drop policy if exists "media assets team delete" on public.media_assets;
create policy "media assets team delete"
on public.media_assets
for delete
to authenticated
using (
  exists (
    select 1
    from public.organisation_members om
    join public.core_person_auth ca on ca.person_id = om.person_id
    where om.organisation_id = media_assets.organisation_id
      and om.membership_status = 'active'
      and ca.auth_user_id = auth.uid()
  )
);

drop policy if exists "media library storage delete" on storage.objects;
create policy "media library storage delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'media-library'
  and exists (
    select 1
    from public.organisation_members om
    join public.core_person_auth ca on ca.person_id = om.person_id
    where om.organisation_id::text = (storage.foldername(name))[1]
      and om.membership_status = 'active'
      and ca.auth_user_id = auth.uid()
  )
);
