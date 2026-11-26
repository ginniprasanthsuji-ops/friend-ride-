-- Project Arjuna QA-only foundational schema parity. No production changes.
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text, phone text, role text not null default 'customer' check(role in ('customer','driver','partner','admin')),
 created_at timestamptz not null default now(), vehicle_type text, vehicle_company text, vehicle_model text, vehicle_registration text,
 driving_experience_years integer, driving_license_number text, driving_license_document_path text,
 driver_approval_status text not null default 'pending' check(driver_approval_status in ('pending','approved','rejected','revoked')),
 address text, partner_approval_status text not null default 'pending' check(partner_approval_status in ('pending','approved','rejected','revoked')),
 business_name text, partner_category text, gstin text, upi_id text, phonepe_number text,
 driver_aadhaar_number text, driver_license_number text, vehicle_number text, partner_qr_path text,
 driver_profile_photo_path text, driver_aadhaar_document_path text, vehicle_rc_document_path text,
 partner_profile_photo_path text, business_latitude double precision, business_longitude double precision,
 provider_qr_path text, whatsapp_phone text, customer_profile_photo_path text,
 customer_avatar_gender text not null default 'male' check(customer_avatar_gender in ('male','female'))
);
create table if not exists public.driver_locations (
 driver_id uuid primary key references auth.users(id) on delete cascade, latitude double precision not null,
 longitude double precision not null, is_online boolean not null default false, updated_at timestamptz not null default now()
);
create table if not exists public.ride_live_locations (
 ride_id uuid not null references public.rides(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade,
 latitude double precision not null, longitude double precision not null, updated_at timestamptz default now(),
 primary key(ride_id,user_id)
);
create table if not exists public.fr_app_notifications (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 notification_type text not null default 'general', title text not null check(length(btrim(title))>0),
 body text not null check(length(btrim(body))>0), action_url text, related_order_id uuid, related_ride_id uuid,
 dedupe_key text, is_read boolean not null default false, read_at timestamptz, created_at timestamptz not null default now()
);
create index if not exists qa_driver_locations_online_idx on public.driver_locations(is_online,updated_at);
create index if not exists qa_ride_live_locations_ride_idx on public.ride_live_locations(ride_id,updated_at);
create index if not exists qa_fr_app_notifications_user_idx on public.fr_app_notifications(user_id,created_at desc);
alter table public.profiles enable row level security;
alter table public.driver_locations enable row level security;
alter table public.ride_live_locations enable row level security;
alter table public.fr_app_notifications enable row level security;
drop policy if exists qa_profiles_select_own on public.profiles;
create policy qa_profiles_select_own on public.profiles for select to authenticated using(id=auth.uid());
drop policy if exists qa_profiles_insert_own on public.profiles;
create policy qa_profiles_insert_own on public.profiles for insert to authenticated with check(id=auth.uid() and role in ('customer','driver','partner'));
drop policy if exists qa_profiles_update_own on public.profiles;
create policy qa_profiles_update_own on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
drop policy if exists qa_driver_locations_own on public.driver_locations;
create policy qa_driver_locations_own on public.driver_locations for all to authenticated using(driver_id=auth.uid())
with check(driver_id=auth.uid() and (not is_online or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='driver' and p.driver_approval_status='approved')));
drop policy if exists qa_live_locations_read_participants on public.ride_live_locations;
create policy qa_live_locations_read_participants on public.ride_live_locations for select to authenticated
using(exists(select 1 from public.rides r where r.id=ride_id and (r.customer_id=auth.uid() or r.driver_id=auth.uid())));
drop policy if exists qa_live_locations_insert_participants on public.ride_live_locations;
create policy qa_live_locations_insert_participants on public.ride_live_locations for insert to authenticated
with check(user_id=auth.uid() and exists(select 1 from public.rides r where r.id=ride_id and (r.customer_id=auth.uid() or r.driver_id=auth.uid())));
drop policy if exists qa_live_locations_update_participants on public.ride_live_locations;
create policy qa_live_locations_update_participants on public.ride_live_locations for update to authenticated
using(user_id=auth.uid() and exists(select 1 from public.rides r where r.id=ride_id and (r.customer_id=auth.uid() or r.driver_id=auth.uid())))
with check(user_id=auth.uid() and exists(select 1 from public.rides r where r.id=ride_id and (r.customer_id=auth.uid() or r.driver_id=auth.uid())));
drop policy if exists qa_notifications_read_own on public.fr_app_notifications;
create policy qa_notifications_read_own on public.fr_app_notifications for select to authenticated using(user_id=auth.uid());
drop policy if exists qa_notifications_update_own on public.fr_app_notifications;
create policy qa_notifications_update_own on public.fr_app_notifications for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant select,insert,update on public.profiles to authenticated;
grant select,insert,update,delete on public.driver_locations to authenticated;
grant select,insert,update on public.ride_live_locations to authenticated;
grant select,update on public.fr_app_notifications to authenticated;
