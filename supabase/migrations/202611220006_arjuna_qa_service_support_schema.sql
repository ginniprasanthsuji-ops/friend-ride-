-- Project Arjuna QA-only service/support schema parity.
create table if not exists public.fr_bank_enquiries (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 service_type text not null, full_name text not null, phone text not null check(phone ~ '^[6-9][0-9]{9}$'),
 area text not null, status text not null default 'new' check(status in ('new','in_review','contacted','resolved','closed')),
 admin_note text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.fr_service_bookings (
 id uuid primary key default gen_random_uuid(), customer_id uuid not null references auth.users(id) on delete cascade,
 service_type text not null, category text not null, subcategory text, preferred_helper_gender text not null default 'not_applicable',
 service_date date not null, service_time time not null, pickup_address text not null, notes text,
 status text not null default 'pending', assigned_provider_id uuid references auth.users(id), quoted_amount numeric,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 actual_hours numeric, final_amount numeric, payment_status text not null default 'not_due',
 payment_reference text, payment_submitted_at timestamptz, payment_verified_at timestamptz, payment_verified_by uuid,
 laundry_unit text, laundry_quantity numeric, laundry_unit_price numeric
);
create table if not exists public.fr_service_provider_applications (
 id uuid primary key default gen_random_uuid(), provider_id uuid not null references auth.users(id) on delete cascade,
 service_category text not null, full_name text not null, phone text not null, business_name text, full_address text not null,
 profile_photo_path text not null, identity_document_path text not null, identity_document_type text not null default 'masked_government_id',
 emergency_contact_name text not null, emergency_contact_phone text not null check(emergency_contact_phone ~ '^[0-9]{10}$'),
 reference_friend_name text, reference_friend_phone text, reference_friend_consent boolean not null default false,
 experience_years integer, service_details text, upi_id text, status text not null default 'pending',
 admin_notes text, reviewed_by uuid references auth.users(id), reviewed_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), provider_gender text
);
create table if not exists public.fr_support_feedback (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 user_role text not null, kind text not null check(kind in ('complaint','feedback')), ride_id uuid references public.rides(id) on delete set null,
 rating smallint, message text not null, status text not null default 'new',
 show_on_homepage boolean not null default false, admin_note text, created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(), submitter_name text, submitter_phone text
);
alter table public.fr_bank_enquiries enable row level security;
alter table public.fr_service_bookings enable row level security;
alter table public.fr_service_provider_applications enable row level security;
alter table public.fr_support_feedback enable row level security;
drop policy if exists qa_bank_insert_own on public.fr_bank_enquiries;
create policy qa_bank_insert_own on public.fr_bank_enquiries for insert to authenticated with check(user_id=auth.uid() and status='new' and admin_note is null);
drop policy if exists qa_bank_read_own_admin on public.fr_bank_enquiries;
create policy qa_bank_read_own_admin on public.fr_bank_enquiries for select to authenticated using(user_id=auth.uid() or exists(select 1 from public.admin_users a where a.user_id=auth.uid()));
drop policy if exists qa_bank_admin_update on public.fr_bank_enquiries;
create policy qa_bank_admin_update on public.fr_bank_enquiries for update to authenticated using(exists(select 1 from public.admin_users a where a.user_id=auth.uid())) with check(exists(select 1 from public.admin_users a where a.user_id=auth.uid()));
drop policy if exists qa_service_booking_customer_insert on public.fr_service_bookings;
create policy qa_service_booking_customer_insert on public.fr_service_bookings for insert to authenticated with check(customer_id=auth.uid() and status='pending' and payment_status='not_due');
drop policy if exists qa_service_booking_read_parties_admin on public.fr_service_bookings;
create policy qa_service_booking_read_parties_admin on public.fr_service_bookings for select to authenticated using(customer_id=auth.uid() or assigned_provider_id=auth.uid() or exists(select 1 from public.admin_users a where a.user_id=auth.uid()));
drop policy if exists qa_service_booking_admin_update on public.fr_service_bookings;
create policy qa_service_booking_admin_update on public.fr_service_bookings for update to authenticated using(exists(select 1 from public.admin_users a where a.user_id=auth.uid())) with check(exists(select 1 from public.admin_users a where a.user_id=auth.uid()));
drop policy if exists qa_provider_application_insert_own on public.fr_service_provider_applications;
create policy qa_provider_application_insert_own on public.fr_service_provider_applications for insert to authenticated with check(provider_id=auth.uid() and status='pending');
drop policy if exists qa_provider_application_read_own_admin on public.fr_service_provider_applications;
create policy qa_provider_application_read_own_admin on public.fr_service_provider_applications for select to authenticated using(provider_id=auth.uid() or exists(select 1 from public.admin_users a where a.user_id=auth.uid()));
drop policy if exists qa_provider_application_admin_update on public.fr_service_provider_applications;
create policy qa_provider_application_admin_update on public.fr_service_provider_applications for update to authenticated using(exists(select 1 from public.admin_users a where a.user_id=auth.uid())) with check(exists(select 1 from public.admin_users a where a.user_id=auth.uid()));
drop policy if exists qa_feedback_insert_own on public.fr_support_feedback;
create policy qa_feedback_insert_own on public.fr_support_feedback for insert to authenticated with check(user_id=auth.uid() and show_on_homepage=false and status='new' and admin_note is null);
drop policy if exists qa_feedback_read_own_admin on public.fr_support_feedback;
create policy qa_feedback_read_own_admin on public.fr_support_feedback for select to authenticated using(user_id=auth.uid() or exists(select 1 from public.admin_users a where a.user_id=auth.uid()));
drop policy if exists qa_feedback_admin_update on public.fr_support_feedback;
create policy qa_feedback_admin_update on public.fr_support_feedback for update to authenticated using(exists(select 1 from public.admin_users a where a.user_id=auth.uid())) with check(exists(select 1 from public.admin_users a where a.user_id=auth.uid()));
grant select,insert,update on public.fr_bank_enquiries,public.fr_service_bookings,public.fr_service_provider_applications,public.fr_support_feedback to authenticated;
