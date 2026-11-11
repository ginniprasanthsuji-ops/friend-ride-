-- FRIEND RIDE: secure TASKO / Laundry / service-provider KYC onboarding
-- Run once in Supabase SQL Editor. This does not store full Aadhaar numbers.
create table if not exists public.fr_service_provider_applications (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references auth.users(id) on delete cascade,
  service_category text not null check (service_category in (
    'TASKO / QUICKMATE Assistant','Laundry Partner','Home Services',
    'Catering Services','DJ – Sound & Lights','Beauty Makeover'
  )),
  full_name text not null,
  phone text not null check (phone ~ '^[0-9]{10}$'),
  business_name text,
  full_address text not null,
  profile_photo_path text not null,
  identity_document_path text not null,
  identity_document_type text not null default 'masked_government_id'
    check (identity_document_type = 'masked_government_id'),
  emergency_contact_name text not null,
  emergency_contact_phone text not null check (emergency_contact_phone ~ '^[0-9]{10}$'),
  reference_friend_name text,
  reference_friend_phone text check (reference_friend_phone is null or reference_friend_phone ~ '^[0-9]{10}$'),
  reference_friend_consent boolean not null default false,
  experience_years integer check (experience_years is null or experience_years between 0 and 60),
  service_details text,
  upi_id text,
  status text not null default 'pending'
    check (status in ('pending','under_review','approved','rejected','suspended')),
  admin_notes text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fr_provider_reference_consent_check check (
    (reference_friend_name is null and reference_friend_phone is null and reference_friend_consent = false)
    or
    (reference_friend_name is not null and reference_friend_phone is not null and reference_friend_consent = true)
  )
);

create index if not exists fr_provider_applications_owner_idx
  on public.fr_service_provider_applications(provider_id, created_at desc);
create index if not exists fr_provider_applications_review_idx
  on public.fr_service_provider_applications(status, service_category, created_at desc);

alter table public.fr_service_provider_applications enable row level security;
drop policy if exists "Providers submit own pending application" on public.fr_service_provider_applications;
create policy "Providers submit own pending application"
  on public.fr_service_provider_applications for insert to authenticated
  with check (provider_id = (select auth.uid()) and status = 'pending');
drop policy if exists "Providers read own applications" on public.fr_service_provider_applications;
create policy "Providers read own applications"
  on public.fr_service_provider_applications for select to authenticated
  using (provider_id = (select auth.uid()));
drop policy if exists "Admins read provider applications" on public.fr_service_provider_applications;
create policy "Admins read provider applications"
  on public.fr_service_provider_applications for select to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));
drop policy if exists "Admins review provider applications" on public.fr_service_provider_applications;
create policy "Admins review provider applications"
  on public.fr_service_provider_applications for update to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));
grant insert, select on public.fr_service_provider_applications to authenticated;
grant update on public.fr_service_provider_applications to authenticated;

-- Private bucket: never expose identity documents through public URLs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fr-provider-kyc','fr-provider-kyc',false,5242880,
  array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do update set public = false, file_size_limit = 5242880,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Providers upload own KYC files" on storage.objects;
create policy "Providers upload own KYC files"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'fr-provider-kyc'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
drop policy if exists "Providers read own KYC files" on storage.objects;
create policy "Providers read own KYC files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'fr-provider-kyc'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
drop policy if exists "Admins read provider KYC files" on storage.objects;
create policy "Admins read provider KYC files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'fr-provider-kyc'
    and exists (select 1 from public.admin_users a where a.user_id = (select auth.uid()))
  );

-- The reference friend is optional; collect it only when they have agreed to be contacted.
-- Never collect/store full Aadhaar numbers, OTPs, PINs or passwords in this application.
