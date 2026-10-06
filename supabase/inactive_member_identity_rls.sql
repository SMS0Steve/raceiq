-- RaceIQ - allow active team members to read Core People identities
-- for both active and inactive members of their organisation.

alter table public.core_people enable row level security;

drop policy if exists "team can read member identities" on public.core_people;
create policy "team can read member identities"
on public.core_people
for select
to authenticated
using (
  exists (
    select 1
    from public.organisation_members target_membership
    where target_membership.person_id = core_people.id
      and exists (
        select 1
        from public.organisation_members viewer_membership
        join public.core_person_auth ca
          on ca.person_id = viewer_membership.person_id
        where viewer_membership.organisation_id = target_membership.organisation_id
          and viewer_membership.membership_status = 'active'
          and ca.auth_user_id = auth.uid()
      )
  )
);
