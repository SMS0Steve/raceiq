-- RaceIQ Event Member Availability RLS
-- Allows authenticated members of an organisation to read and manage
-- event availability records belonging to that same organisation.

alter table public.event_member_availability enable row level security;

drop policy if exists "event availability team read" on public.event_member_availability;
drop policy if exists "event availability team insert" on public.event_member_availability;
drop policy if exists "event availability team update" on public.event_member_availability;
drop policy if exists "event availability team delete" on public.event_member_availability;

create policy "event availability team read"
on public.event_member_availability
for select
to authenticated
using (
  exists (
    select 1
    from public.organisation_members target
    join public.organisation_members actor
      on actor.organisation_id = target.organisation_id
    join public.core_person_auth authmap
      on authmap.person_id = actor.person_id
    where target.id = event_member_availability.organisation_member_id
      and authmap.auth_user_id = auth.uid()
      and actor.membership_status = 'active'
  )
);

create policy "event availability team insert"
on public.event_member_availability
for insert
to authenticated
with check (
  exists (
    select 1
    from public.organisation_members target
    join public.organisation_members actor
      on actor.organisation_id = target.organisation_id
    join public.core_person_auth authmap
      on authmap.person_id = actor.person_id
    join public.events e
      on e.id = event_member_availability.event_id
     and e.organisation_id = target.organisation_id
    where target.id = event_member_availability.organisation_member_id
      and authmap.auth_user_id = auth.uid()
      and actor.membership_status = 'active'
  )
);

create policy "event availability team update"
on public.event_member_availability
for update
to authenticated
using (
  exists (
    select 1
    from public.organisation_members target
    join public.organisation_members actor
      on actor.organisation_id = target.organisation_id
    join public.core_person_auth authmap
      on authmap.person_id = actor.person_id
    where target.id = event_member_availability.organisation_member_id
      and authmap.auth_user_id = auth.uid()
      and actor.membership_status = 'active'
  )
)
with check (
  exists (
    select 1
    from public.organisation_members target
    join public.organisation_members actor
      on actor.organisation_id = target.organisation_id
    join public.core_person_auth authmap
      on authmap.person_id = actor.person_id
    join public.events e
      on e.id = event_member_availability.event_id
     and e.organisation_id = target.organisation_id
    where target.id = event_member_availability.organisation_member_id
      and authmap.auth_user_id = auth.uid()
      and actor.membership_status = 'active'
  )
);

create policy "event availability team delete"
on public.event_member_availability
for delete
to authenticated
using (
  exists (
    select 1
    from public.organisation_members target
    join public.organisation_members actor
      on actor.organisation_id = target.organisation_id
    join public.core_person_auth authmap
      on authmap.person_id = actor.person_id
    where target.id = event_member_availability.organisation_member_id
      and authmap.auth_user_id = auth.uid()
      and actor.membership_status = 'active'
  )
);
