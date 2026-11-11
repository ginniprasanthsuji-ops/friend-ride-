-- FRIEND RIDE: TASKO/QUICKMATE + LAUNDRY booking requests
-- Apply in Supabase SQL Editor. Customer-only RLS is enabled by default.
create table if not exists public.fr_service_bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  service_type text not null check (service_type in ('tasko','laundry')),
  category text not null,
  subcategory text,
  preferred_helper_gender text not null default 'not_applicable'
    check (preferred_helper_gender in ('no_preference','female','male','not_applicable')),
  service_date date not null,
  service_time time not null,
  pickup_address text not null,
  notes text,
  status text not null default 'pending'
    check (status in ('pending','accepted','assigned','in_progress','completed','cancelled','rejected')),
  assigned_provider_id uuid references auth.users(id) on delete set null,
  quoted_amount numeric(10,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists fr_service_bookings_customer_created_idx
  on public.fr_service_bookings(customer_id, created_at desc);
create index if not exists fr_service_bookings_type_status_idx
  on public.fr_service_bookings(service_type, status, service_date);
alter table public.fr_service_bookings enable row level security;
drop policy if exists "Customers create own service bookings" on public.fr_service_bookings;
create policy "Customers create own service bookings"
  on public.fr_service_bookings for insert to authenticated
  with check (auth.uid() = customer_id);
drop policy if exists "Customers read own service bookings" on public.fr_service_bookings;
create policy "Customers read own service bookings"
  on public.fr_service_bookings for select to authenticated
  using (auth.uid() = customer_id);
-- Provider/admin assignment, update and operational dashboard policies must be added
-- only after matching the actual FRIEND RIDE profiles/roles schema and approval RPCs.
grant insert, select on public.fr_service_bookings to authenticated;
