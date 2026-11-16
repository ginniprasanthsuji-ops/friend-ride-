-- FRIEND RIDE Grocery: secured-card merchant model (QA only)
-- No lending/credit facility is created by FRIEND RIDE in this schema.
-- Apply only after reviewing the migration and obtaining bank/Cashfree/legal approvals.

create extension if not exists pgcrypto;

create table if not exists public.fr_grocery_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.fr_grocery_products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.fr_grocery_categories(id),
  sku text not null unique,
  product_name text not null,
  brand text,
  pack_label text not null,
  mrp numeric(12,2) not null default 0 check (mrp >= 0),
  selling_price numeric(12,2) not null default 0 check (selling_price >= 0),
  image_url text,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fr_grocery_sellers (
  id uuid primary key default gen_random_uuid(),
  seller_type text not null check (seller_type in ('friendride','local_shop')),
  legal_name text not null,
  gstin text,
  seller_status text not null default 'pending' check (seller_status in ('pending','approved','suspended')),
  settlement_reference text,
  created_at timestamptz not null default now()
);

create table if not exists public.fr_grocery_inventory (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.fr_grocery_sellers(id),
  product_id uuid not null references public.fr_grocery_products(id),
  stock_qty numeric(12,3) not null default 0 check (stock_qty >= 0),
  seller_price numeric(12,2) not null check (seller_price >= 0),
  is_available boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (seller_id, product_id)
);

create table if not exists public.fr_grocery_customer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  mobile_verified boolean not null default false,
  date_of_birth date,
  address_line text not null,
  village text not null,
  mandal text,
  district text not null default 'Srikakulam',
  state text not null default 'Andhra Pradesh',
  pincode text not null,
  masked_pan text,
  pan_verification_status text not null default 'not_submitted'
    check (pan_verification_status in ('not_submitted','pending','verified','failed')),
  pan_provider_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fr_grocery_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_status text not null default 'pending'
    check (application_status in ('pending','under_review','approved','rejected','suspended')),
  cibil_consent_at timestamptz,
  cibil_provider_reference text,
  cibil_score smallint check (cibil_score between 300 and 900),
  cibil_checked_at timestamptz,
  bank_name text,
  secured_card_status text not null default 'not_provided'
    check (secured_card_status in ('not_provided','applied','issued','verified','declined')),
  masked_card_last4 char(4),
  bank_verification_reference text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fr_grocery_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid not null references auth.users(id),
  seller_id uuid not null references public.fr_grocery_sellers(id),
  subtotal numeric(12,2) not null check (subtotal >= 0),
  delivery_charge numeric(12,2) not null default 0 check (delivery_charge >= 0),
  total_amount numeric(12,2) not null check (total_amount >= 0),
  payment_status text not null default 'pending'
    check (payment_status in ('pending','authorized','paid','failed','refunded','part_refunded')),
  order_status text not null default 'awaiting_payment'
    check (order_status in ('awaiting_payment','confirmed','packing','out_for_delivery','delivered','cancelled')),
  seller_invoice_reference text,
  created_at timestamptz not null default now()
);

create table if not exists public.fr_grocery_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.fr_grocery_orders(id) on delete cascade,
  product_id uuid not null references public.fr_grocery_products(id),
  product_name_snapshot text not null,
  pack_snapshot text not null,
  quantity numeric(12,3) not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  line_total numeric(12,2) not null check (line_total >= 0)
);

create table if not exists public.fr_grocery_card_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  issuer_name text not null,
  card_network text check (card_network in ('visa','mastercard','rupay','other')),
  masked_last4 char(4),
  bank_card_status text not null default 'pending'
    check (bank_card_status in ('pending','verified','inactive','declined')),
  bank_reference text,
  created_at timestamptz not null default now(),
  unique(user_id, issuer_name, masked_last4)
);

-- Bank-approved card EMI schedules only. FRIEND RIDE cannot create or approve a loan.
create table if not exists public.fr_grocery_bank_payment_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid not null references public.fr_grocery_orders(id),
  bank_name text not null,
  bank_plan_reference text not null,
  schedule_type text not null check (schedule_type in ('weekly','monthly')),
  instalment_count int not null check (instalment_count > 0),
  bank_approved boolean not null default false,
  bank_status text not null default 'pending'
    check (bank_status in ('pending','approved','rejected','completed','cancelled')),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique(bank_name, bank_plan_reference)
);

-- This is a merchant recurring-payment mandate, not a bank loan/EMI mandate.
create table if not exists public.fr_grocery_card_mandates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  gateway text not null default 'cashfree',
  gateway_mandate_reference text unique,
  purpose text not null default 'grocery_recurring_purchase',
  maximum_amount numeric(12,2) not null check (maximum_amount > 0),
  frequency text not null check (frequency in ('weekly','monthly')),
  customer_consent_at timestamptz,
  mandate_status text not null default 'created'
    check (mandate_status in ('created','authorized','paused','cancelled','failed')),
  created_at timestamptz not null default now()
);

create table if not exists public.fr_grocery_payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.fr_grocery_orders(id),
  customer_id uuid not null references auth.users(id),
  gateway text not null default 'cashfree',
  gateway_order_reference text,
  gateway_payment_reference text unique,
  amount numeric(12,2) not null check (amount >= 0),
  payment_method text not null check (payment_method in ('credit_card','debit_card','upi','netbanking','other')),
  payment_status text not null default 'initiated'
    check (payment_status in ('initiated','pending','success','failed','refunded')),
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.fr_grocery_ledger (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.fr_grocery_orders(id),
  seller_id uuid references public.fr_grocery_sellers(id),
  entry_type text not null check (entry_type in ('customer_payment','seller_payable','delivery_fee','refund','settlement')),
  amount numeric(12,2) not null,
  external_reference text,
  created_at timestamptz not null default now()
);

create table if not exists public.fr_grocery_draw_campaigns (
  id uuid primary key default gen_random_uuid(),
  campaign_name text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  purchase_linked boolean not null default true,
  legal_review_reference text,
  enabled boolean not null default false,
  disclaimer text not null,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table if not exists public.fr_grocery_draw_entries (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.fr_grocery_draw_campaigns(id),
  order_id uuid not null references public.fr_grocery_orders(id),
  user_id uuid not null references auth.users(id),
  entry_code text not null unique,
  created_at timestamptz not null default now(),
  unique(campaign_id, order_id)
);

create table if not exists public.fr_grocery_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text not null,
  event_type text not null,
  signature_verified boolean not null default false,
  processed_at timestamptz,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  unique(provider, event_id)
);

-- RLS: customers see only their own records. Sensitive writes happen only in Edge Functions.
do $$
declare t text;
begin
  foreach t in array array[
    'fr_grocery_customer_profiles','fr_grocery_applications','fr_grocery_orders',
    'fr_grocery_order_items','fr_grocery_card_profiles','fr_grocery_bank_payment_plans',
    'fr_grocery_card_mandates','fr_grocery_payments','fr_grocery_draw_entries'
  ] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

alter table public.fr_grocery_categories enable row level security;
alter table public.fr_grocery_products enable row level security;
alter table public.fr_grocery_sellers enable row level security;
alter table public.fr_grocery_inventory enable row level security;
alter table public.fr_grocery_ledger enable row level security;
alter table public.fr_grocery_draw_campaigns enable row level security;
alter table public.fr_grocery_webhook_events enable row level security;

create policy "grocery categories public read active" on public.fr_grocery_categories
for select to anon, authenticated using (is_active = true);
create policy "grocery products public read active" on public.fr_grocery_products
for select to anon, authenticated using (is_active = true);
create policy "grocery sellers public read approved" on public.fr_grocery_sellers
for select to anon, authenticated using (seller_status = 'approved');
create policy "grocery inventory public read available" on public.fr_grocery_inventory
for select to anon, authenticated using (is_available = true);

create policy "grocery profile own read" on public.fr_grocery_customer_profiles
for select to authenticated using (user_id = (select auth.uid()));
create policy "grocery application own read" on public.fr_grocery_applications
for select to authenticated using (user_id = (select auth.uid()));
create policy "grocery orders own read" on public.fr_grocery_orders
for select to authenticated using (customer_id = (select auth.uid()));
create policy "grocery order items own read" on public.fr_grocery_order_items
for select to authenticated using (
  exists (select 1 from public.fr_grocery_orders o
    where o.id = order_id and o.customer_id = (select auth.uid()))
);
create policy "grocery card profile own read" on public.fr_grocery_card_profiles
for select to authenticated using (user_id = (select auth.uid()));
create policy "grocery bank plans own read" on public.fr_grocery_bank_payment_plans
for select to authenticated using (user_id = (select auth.uid()));
create policy "grocery mandates own read" on public.fr_grocery_card_mandates
for select to authenticated using (user_id = (select auth.uid()));
create policy "grocery payments own read" on public.fr_grocery_payments
for select to authenticated using (customer_id = (select auth.uid()));
create policy "grocery draw entries own read" on public.fr_grocery_draw_entries
for select to authenticated using (user_id = (select auth.uid()));
create policy "grocery draw campaigns read enabled" on public.fr_grocery_draw_campaigns
for select to anon, authenticated using (enabled = true);

-- No client INSERT/UPDATE/DELETE policies on financial, KYC, webhook, ledger or draw tables.
-- Admin/service operations must be performed through authenticated Edge Functions.
-- Do not expose service_role/secret keys in the browser.
