-- RaceIQ team branding persistence
-- Run once in Supabase SQL Editor after media_library_setup.sql.

alter table public.organisations
  add column if not exists logo_asset_id uuid references public.media_assets(id) on delete set null,
  add column if not exists hero_asset_id uuid references public.media_assets(id) on delete set null;

create index if not exists organisations_logo_asset_id_idx on public.organisations(logo_asset_id);
create index if not exists organisations_hero_asset_id_idx on public.organisations(hero_asset_id);
