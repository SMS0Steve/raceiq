-- RaceIQ vehicle Media Library image link
alter table public.vehicles
add column if not exists image_asset_id uuid references public.media_assets(id) on delete set null;

create index if not exists vehicles_image_asset_id_idx
on public.vehicles(image_asset_id);
