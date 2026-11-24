-- FRIEND RIDE Coupon Market (additive, proposal migration)
-- Payment verification and purchase/redemption atomic RPCs are intentionally separate follow-up work.
begin;

create table if not exists public.fr_store_coupons (
  id uuid primary key default gen_random_uuid(),
  store_partner_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  coupon_type text not null check (coupon_type in ('value_coupon','percent_discount','amount_discount','buy_one_get_one','custom')),
  face_value numeric(10,2) check (face_value is null or face_value >= 0),
  sale_price numeric(10,2) not null check (sale_price >= 0),
  discount_value numeric(10,2) check (discount_value is null or discount_value >= 0),
  minimum_purchase numeric(10,2) not null default 0 check (minimum_purchase >= 0),
  terms text,
  starts_at timestamptz not null,
  expires_at timestamptz not null,
  quantity_limit integer check (quantity_limit is null or quantity_limit > 0),
  sold_count integer not null default 0 check (sold_count >= 0),
  per_customer_limit integer not null default 1 check (per_customer_limit > 0),
  status text not null default 'draft' check (status in ('draft','pending_approval','active','paused','expired','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expires_at > starts_at),
  check (quantity_limit is null or sold_count <= quantity_limit)
);
create index if not exists fr_store_coupons_live_idx
  on public.fr_store_coupons(status,starts_at,expires_at);
create index if not exists fr_store_coupons_partner_idx
  on public.fr_store_coupons(store_partner_user_id,created_at desc);

create table if not exists public.fr_coupon_purchases (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.fr_store_coupons(id) on delete restrict,
  customer_user_id uuid not null references auth.users(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  total_amount numeric(10,2) not null check (total_amount >= 0),
  payment_status text not null default 'pending' check (payment_status in ('pending','verified','failed','refunded')),
  payment_reference text,
  purchased_at timestamptz,
  created_at timestamptz not null default now(),
  unique (payment_reference)
);
create index if not exists fr_coupon_purchases_customer_idx
  on public.fr_coupon_purchases(customer_user_id,created_at desc);
create index if not exists fr_coupon_purchases_coupon_idx
  on public.fr_coupon_purchases(coupon_id,payment_status);

create table if not exists public.fr_issued_coupons (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references public.fr_coupon_purchases(id) on delete cascade,
  coupon_id uuid not null references public.fr_store_coupons(id) on delete restrict,
  customer_user_id uuid not null references auth.users(id) on delete cascade,
  redemption_token uuid not null unique default gen_random_uuid(),
  status text not null default 'issued' check (status in ('issued','redeemed','expired','cancelled')),
  issued_at timestamptz not null default now(),
  redeemed_at timestamptz,
  redeemed_by_user_id uuid references auth.users(id) on delete set null,
  redemption_store_partner_user_id uuid references auth.users(id) on delete set null,
  check ((status='redeemed') = (redeemed_at is not null))
);
create index if not exists fr_issued_coupons_customer_idx
  on public.fr_issued_coupons(customer_user_id,status,issued_at desc);
create index if not exists fr_issued_coupons_coupon_idx
  on public.fr_issued_coupons(coupon_id,status);

alter table public.fr_store_coupons enable row level security;
alter table public.fr_coupon_purchases enable row level security;
alter table public.fr_issued_coupons enable row level security;

-- Partners can create their own draft coupons and read their own coupon inventory.
drop policy if exists fr_coupons_partner_read on public.fr_store_coupons;
create policy fr_coupons_partner_read on public.fr_store_coupons
  for select to authenticated using (store_partner_user_id=auth.uid());
drop policy if exists fr_coupons_partner_create_draft on public.fr_store_coupons;
create policy fr_coupons_partner_create_draft on public.fr_store_coupons
  for insert to authenticated with check (store_partner_user_id=auth.uid() and status='draft' and sold_count=0);
-- Customers see only coupons available for sale, within dates.
drop policy if exists fr_coupons_customer_read_active on public.fr_store_coupons;
create policy fr_coupons_customer_read_active on public.fr_store_coupons
  for select to authenticated using (
    status='active' and starts_at<=now() and expires_at>now()
    and (quantity_limit is null or sold_count<quantity_limit)
  );

-- Purchases and issued coupon records are read-only to clients; trusted RPC/webhook
-- must verify payment and issue tokens. No client INSERT/UPDATE policy is granted.
drop policy if exists fr_coupon_purchase_customer_read on public.fr_coupon_purchases;
create policy fr_coupon_purchase_customer_read on public.fr_coupon_purchases
  for select to authenticated using (customer_user_id=auth.uid());
drop policy if exists fr_coupon_purchase_partner_read on public.fr_coupon_purchases;
create policy fr_coupon_purchase_partner_read on public.fr_coupon_purchases
  for select to authenticated using (exists (
    select 1 from public.fr_store_coupons c
    where c.id=fr_coupon_purchases.coupon_id and c.store_partner_user_id=auth.uid()
  ));

drop policy if exists fr_issued_coupon_customer_read on public.fr_issued_coupons;
create policy fr_issued_coupon_customer_read on public.fr_issued_coupons
  for select to authenticated using (customer_user_id=auth.uid());
drop policy if exists fr_issued_coupon_partner_read on public.fr_issued_coupons;
create policy fr_issued_coupon_partner_read on public.fr_issued_coupons
  for select to authenticated using (exists (
    select 1 from public.fr_store_coupons c
    where c.id=fr_issued_coupons.coupon_id and c.store_partner_user_id=auth.uid()
  ));

commit;
