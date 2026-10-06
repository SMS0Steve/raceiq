-- RaceIQ Team member management permissions
alter table public.organisation_members enable row level security;

drop policy if exists "team members update" on public.organisation_members;
create policy "team members update"
on public.organisation_members
for update
to authenticated
using (
  exists (
    select 1
    from public.organisation_members manager
    join public.core_person_auth ca on ca.person_id = manager.person_id
    where manager.organisation_id = organisation_members.organisation_id
      and manager.membership_status = 'active'
      and ca.auth_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.organisation_members manager
    join public.core_person_auth ca on ca.person_id = manager.person_id
    where manager.organisation_id = organisation_members.organisation_id
      and manager.membership_status = 'active'
      and ca.auth_user_id = auth.uid()
  )
);

drop policy if exists "team members delete" on public.organisation_members;
create policy "team members delete"
on public.organisation_members
for delete
to authenticated
using (
  exists (
    select 1
    from public.organisation_members manager
    join public.core_person_auth ca on ca.person_id = manager.person_id
    where manager.organisation_id = organisation_members.organisation_id
      and manager.membership_status = 'active'
      and ca.auth_user_id = auth.uid()
  )
);
