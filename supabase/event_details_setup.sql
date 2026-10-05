-- RaceIQ Event Details V1
-- Run in the Supabase SQL Editor for the active RaceIQ project.

alter table public.events
  add column if not exists pit_allocation text,
  add column if not exists vehicle_id uuid references public.vehicles(id) on delete set null,
  add column if not exists schedule jsonb not null default '[]'::jsonb;

comment on column public.events.pit_allocation is 'Simple team pit/bay allocation displayed directly on Event Details.';
comment on column public.events.vehicle_id is 'Vehicle selected from the organisation Garage for this event.';
comment on column public.events.schedule is 'Ordered event schedule entries displayed as a scrollable list. Each entry may contain time, title and notes.';
