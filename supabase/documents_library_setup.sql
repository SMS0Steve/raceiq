-- RaceIQ central Documents Library
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  document_name text not null,
  category text,
  storage_path text,
  file_name text,
  mime_type text,
  event_id uuid references public.events(id) on delete set null,
  organisation_member_id uuid references public.organisation_members(id) on delete set null,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists documents_org_idx on public.documents(organisation_id,created_at desc);
create index if not exists documents_event_idx on public.documents(event_id,created_at desc);
alter table public.documents enable row level security;
drop policy if exists "documents team all" on public.documents;
create policy "documents team all" on public.documents for all to authenticated
using (exists (
 select 1 from public.organisation_members om
 join public.core_person_auth ca on ca.person_id=om.person_id
 where om.organisation_id=documents.organisation_id
 and om.membership_status='active' and ca.auth_user_id=auth.uid()
))
with check (exists (
 select 1 from public.organisation_members om
 join public.core_person_auth ca on ca.person_id=om.person_id
 where om.organisation_id=documents.organisation_id
 and om.membership_status='active' and ca.auth_user_id=auth.uid()
));
