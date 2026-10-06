alter table public.events
add column if not exists status text not null default 'upcoming';

update public.events
set status = 'upcoming'
where status is null;

alter table public.events
drop constraint if exists events_status_check;

alter table public.events
add constraint events_status_check
check (status in ('upcoming','active','completed'));

create index if not exists events_status_idx
on public.events (organisation_id, status, starts_at);
