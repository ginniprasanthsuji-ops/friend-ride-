-- Phase 13D: auto-create refund tracking requests on ride cancellation (QA only).
create table if not exists public.fr_ride_refund_requests(
 id uuid primary key default gen_random_uuid(), ride_type text not null check(ride_type in ('road','shared')), ride_id uuid not null, booking_id uuid not null, customer_id uuid not null, amount numeric(12,2) not null check(amount>=0), currency text not null default 'INR', payment_reference text, status text not null default 'payment_check_required' check(status in ('payment_check_required','refund_pending','refund_processing','refunded','not_eligible','failed')), reason text not null, requested_at timestamptz not null default now(), processed_at timestamptz, processed_by uuid, refund_reference text, notes text, unique(ride_type,booking_id));
alter table public.fr_ride_refund_requests enable row level security;
revoke all on public.fr_ride_refund_requests from public,anon,authenticated;
grant select on public.fr_ride_refund_requests to service_role;
-- The deployed cancellation RPCs are replaced with auto-queue versions in this migration.
