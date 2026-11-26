-- Project Arjuna QA-only notification, SOS, emergency contact, and KYC metadata tables.
create table if not exists public.fr_emergency_contacts (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 contact_name text not null, phone_e164 text not null check(phone_e164 ~ '^\\+[1-9][0-9]{7,14}$'),
 priority smallint not null default 1 check(priority between 1 and 2), created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(), unique(user_id,priority)
);
create table if not exists public.fr_push_subscriptions (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 endpoint text not null unique, p256dh text not null, auth_key text not null, user_agent text,
 is_active boolean not null default true, created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(), last_success_at timestamptz
);
create table if not exists public.fr_ride_notifications (
 id bigserial primary key, user_id uuid not null references auth.users(id) on delete cascade,
 ride_id uuid references public.rides(id) on delete cascade, title text not null, message text not null,
 created_at timestamptz not null default now(), read_at timestamptz, is_read boolean not null default false
);
create table if not exists public.fr_ride_sos (
 id bigserial primary key, ride_id uuid references public.rides(id) on delete set null,
 sender_id uuid not null references auth.users(id) on delete cascade, latitude double precision, longitude double precision,
 message text, created_at timestamptz not null default now()
);
create table if not exists public.fr_driver_documents (
 id uuid primary key default gen_random_uuid(), driver_id uuid not null references public.profiles(id) on delete cascade,
 owner_id uuid not null references auth.users(id) on delete cascade,
 document_type text not null check(document_type in ('aadhaar','driving_license','vehicle_rc')),
 storage_path text not null unique, verification_status text not null default 'pending' check(verification_status in ('pending','verified','rejected')),
 review_note text, reviewed_by uuid references auth.users(id), reviewed_at timestamptz, created_at timestamptz not null default now(),
 unique(driver_id,document_type)
);
create index if not exists qa_fr_ride_notifications_user_idx on public.fr_ride_notifications(user_id,created_at desc);
alter table public.fr_emergency_contacts enable row level security;
alter table public.fr_push_subscriptions enable row level security;
alter table public.fr_ride_notifications enable row level security;
alter table public.fr_ride_sos enable row level security;
alter table public.fr_driver_documents enable row level security;
drop policy if exists qa_emergency_contacts_manage_own on public.fr_emergency_contacts;
create policy qa_emergency_contacts_manage_own on public.fr_emergency_contacts for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
drop policy if exists qa_push_manage_own on public.fr_push_subscriptions;
create policy qa_push_manage_own on public.fr_push_subscriptions for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
drop policy if exists qa_ride_notifications_read_own on public.fr_ride_notifications;
create policy qa_ride_notifications_read_own on public.fr_ride_notifications for select to authenticated using(user_id=auth.uid());
drop policy if exists qa_ride_notifications_update_own on public.fr_ride_notifications;
create policy qa_ride_notifications_update_own on public.fr_ride_notifications for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
drop policy if exists qa_sos_insert_own on public.fr_ride_sos;
create policy qa_sos_insert_own on public.fr_ride_sos for insert to authenticated with check(sender_id=auth.uid());
drop policy if exists qa_sos_read_own on public.fr_ride_sos;
create policy qa_sos_read_own on public.fr_ride_sos for select to authenticated using(sender_id=auth.uid());
drop policy if exists qa_sos_admin_read on public.fr_ride_sos;
create policy qa_sos_admin_read on public.fr_ride_sos for select to authenticated using(exists(select 1 from public.admin_users a where a.user_id=auth.uid()));
drop policy if exists qa_driver_documents_read_own_admin on public.fr_driver_documents;
create policy qa_driver_documents_read_own_admin on public.fr_driver_documents for select to authenticated using(owner_id=auth.uid() or exists(select 1 from public.admin_users a where a.user_id=auth.uid()));
drop policy if exists qa_driver_documents_insert_own_pending on public.fr_driver_documents;
create policy qa_driver_documents_insert_own_pending on public.fr_driver_documents for insert to authenticated with check(owner_id=auth.uid() and driver_id=auth.uid() and verification_status='pending');
drop policy if exists qa_driver_documents_update_own_pending on public.fr_driver_documents;
create policy qa_driver_documents_update_own_pending on public.fr_driver_documents for update to authenticated using(owner_id=auth.uid() and verification_status='pending') with check(owner_id=auth.uid() and driver_id=auth.uid() and verification_status='pending');
drop policy if exists qa_driver_documents_admin_review on public.fr_driver_documents;
create policy qa_driver_documents_admin_review on public.fr_driver_documents for update to authenticated using(exists(select 1 from public.admin_users a where a.user_id=auth.uid())) with check(exists(select 1 from public.admin_users a where a.user_id=auth.uid()));
grant select,insert,update,delete on public.fr_emergency_contacts,public.fr_push_subscriptions to authenticated;
grant select,update on public.fr_ride_notifications to authenticated;
grant select,insert on public.fr_ride_sos to authenticated;
grant select,insert,update on public.fr_driver_documents to authenticated;
grant usage,select on sequence public.fr_ride_notifications_id_seq,public.fr_ride_sos_id_seq to authenticated;
