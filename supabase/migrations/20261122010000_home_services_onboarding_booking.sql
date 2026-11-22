-- PROJECT ARJUNA: Home Services provider onboarding + booking foundation (QA migration)
create table if not exists public.fr_home_service_applications (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 profession text not null,
 full_name text not null,
 phone text not null,
 experience_years integer not null default 0 check (experience_years>=0),
 address text not null,
 aadhaar_last4 text not null check (aadhaar_last4 ~ '^[0-9]{4}$'),
 phonepe_number text not null,
 upi_id text,
 profile_photo_path text not null,
 aadhaar_file_path text not null,
 upi_qr_path text,
 status text not null default 'pending' check (status in ('pending','approved','rejected')),
 admin_note text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.fr_home_service_bookings (
 id uuid primary key default gen_random_uuid(),
 customer_id uuid not null references auth.users(id) on delete cascade,
 provider_id uuid references auth.users(id) on delete set null,
 profession text not null,
 address text not null,
 work_details text not null,
 preferred_date date not null,
 preferred_time time not null,
 advance_required numeric(10,2) not null default 50 check (advance_required>=50),
 payment_status text not null default 'unpaid' check (payment_status in ('unpaid','paid','failed','refunded')),
 status text not null default 'pending_payment' check (status in ('pending_payment','requested','accepted','rejected','assigned','started','completed','cancelled')),
 provider_note text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists fr_hs_apps_user_idx on public.fr_home_service_applications(user_id,created_at desc);
create index if not exists fr_hs_book_customer_idx on public.fr_home_service_bookings(customer_id,created_at desc);
create index if not exists fr_hs_book_provider_idx on public.fr_home_service_bookings(provider_id,created_at desc);
alter table public.fr_home_service_applications enable row level security;
alter table public.fr_home_service_bookings enable row level security;
drop policy if exists "hs applications owner read" on public.fr_home_service_applications;
create policy "hs applications owner read" on public.fr_home_service_applications for select to authenticated using (user_id=auth.uid() or (auth.jwt()->'app_metadata'->>'role'='admin'));
drop policy if exists "hs applications owner insert" on public.fr_home_service_applications;
create policy "hs applications owner insert" on public.fr_home_service_applications for insert to authenticated with check (user_id=auth.uid() and status='pending');
drop policy if exists "hs applications admin update" on public.fr_home_service_applications;
create policy "hs applications admin update" on public.fr_home_service_applications for update to authenticated using (auth.jwt()->'app_metadata'->>'role'='admin') with check (auth.jwt()->'app_metadata'->>'role'='admin');
drop policy if exists "hs bookings customer read" on public.fr_home_service_bookings;
create policy "hs bookings customer read" on public.fr_home_service_bookings for select to authenticated using (customer_id=auth.uid() or provider_id=auth.uid() or auth.jwt()->'app_metadata'->>'role'='admin');
drop policy if exists "hs bookings customer insert" on public.fr_home_service_bookings;
create policy "hs bookings customer insert" on public.fr_home_service_bookings for insert to authenticated with check (customer_id=auth.uid() and status='pending_payment' and payment_status='unpaid');
drop policy if exists "hs provider status update" on public.fr_home_service_bookings;
create policy "hs provider status update" on public.fr_home_service_bookings for update to authenticated using (provider_id=auth.uid() and exists(select 1 from public.fr_home_service_applications a where a.user_id=auth.uid() and a.status='approved')) with check (provider_id=auth.uid() and exists(select 1 from public.fr_home_service_applications a where a.user_id=auth.uid() and a.status='approved'));
drop policy if exists "hs admin booking update" on public.fr_home_service_bookings;
create policy "hs admin booking update" on public.fr_home_service_bookings for update to authenticated using (auth.jwt()->'app_metadata'->>'role'='admin') with check (auth.jwt()->'app_metadata'->>'role'='admin');
-- Private KYC bucket: no public access. User can upload only within their UID folder.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('home-service-private','home-service-private',false,3145728,array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict(id) do update set public=false,file_size_limit=3145728,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "hs private owner upload" on storage.objects;
create policy "hs private owner upload" on storage.objects for insert to authenticated with check (bucket_id='home-service-private' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "hs private owner read" on storage.objects;
create policy "hs private owner read" on storage.objects for select to authenticated using (bucket_id='home-service-private' and ((storage.foldername(name))[1]=auth.uid()::text or auth.jwt()->'app_metadata'->>'role'='admin'));
