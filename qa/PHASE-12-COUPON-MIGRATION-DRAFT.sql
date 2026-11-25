-- FRIEND RIDE Phase 12 Coupon Backend — REVIEW DRAFT ONLY
-- NOT EXECUTED. Do not apply until owner review, verified QA/staging environment,
-- role ownership semantics, payment-confirmation workflow, and client integration are confirmed.
-- Additive migration; intentionally omits RPCs pending security review.

create table if not exists public.fr_coupon_campaigns (
  id uuid primary key default gen_random_uuid(),
  issuer_user_id uuid not null references public.profiles(id),
  issuer_shop_id uuid references public.fr_shops(id),
  issuer_role text not null check (issuer_role in ('admin','partner')),
  campaign_kind text not null check (campaign_kind in ('store','ride')),
  service_scope text[] not null default '{}',
  title text not null check (length(trim(title)) between 1 and 120),
  description text,
  discount_type text not null check (discount_type in ('fixed','percent')),
  discount_value numeric(12,2) not null check (discount_value > 0),
  min_purchase_amount numeric(12,2) not null default 0 check (min_purchase_amount >= 0),
  max_discount_amount numeric(12,2),
  coupon_price numeric(12,2) not null default 0 check (coupon_price >= 0),
  quantity_limit integer check (quantity_limit is null or quantity_limit > 0),
  per_customer_limit integer not null default 1 check (per_customer_limit > 0),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'draft' check (status in ('draft','active','paused','ended','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check ((issuer_role='admin' and issuer_shop_id is null) or (issuer_role='partner' and issuer_shop_id is not null)),
  check (campaign_kind <> 'ride' or service_scope <@ array['bike','auto','car']::text[]),
  check (campaign_kind <> 'store' or issuer_shop_id is not null)
);

create table if not exists public.fr_coupon_purchases (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.fr_coupon_campaigns(id),
  customer_id uuid not null references public.profiles(id),
  coupon_code text not null unique,
  status text not null default 'payment_pending'
    check (status in ('payment_pending','paid','redeemed','expired','cancelled','refunded')),
  amount_paid numeric(12,2) not null check (amount_paid >= 0),
  payment_reference text,
  payment_confirmed_by uuid references public.profiles(id),
  payment_confirmed_at timestamptz,
  expires_at timestamptz,
  redeemed_at timestamptz,
  redeemed_by uuid references public.profiles(id),
  redemption_reference text,
  redemption_idempotency_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status <> 'paid') or payment_confirmed_at is not null),
  check ((status <> 'redeemed') or redeemed_at is not null)
);

create table if not exists public.fr_coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null unique references public.fr_coupon_purchases(id),
  campaign_id uuid not null references public.fr_coupon_campaigns(id),
  customer_id uuid not null references public.profiles(id),
  redeemed_by uuid not null references public.profiles(id),
  redemption_type text not null check (redemption_type in ('store','ride')),
  store_id uuid references public.fr_shops(id),
  ride_id uuid references public.rides(id),
  service_type text,
  redemption_idempotency_key text not null unique,
  redeemed_at timestamptz not null default now(),
  check ((redemption_type='store' and store_id is not null) or (redemption_type='ride' and ride_id is not null))
);

create index if not exists fr_coupon_campaigns_issuer_idx on public.fr_coupon_campaigns(issuer_user_id,status);
create index if not exists fr_coupon_campaigns_window_idx on public.fr_coupon_campaigns(status,starts_at,ends_at);
create index if not exists fr_coupon_purchases_customer_idx on public.fr_coupon_purchases(customer_id,status,created_at desc);
create index if not exists fr_coupon_purchases_campaign_idx on public.fr_coupon_purchases(campaign_id,status);
create index if not exists fr_coupon_redemptions_campaign_idx on public.fr_coupon_redemptions(campaign_id,redeemed_at desc);

alter table public.fr_coupon_campaigns enable row level security;
alter table public.fr_coupon_purchases enable row level security;
alter table public.fr_coupon_redemptions enable row level security;

-- RLS policies and SECURITY DEFINER RPCs are intentionally not finalized in this draft.
-- Required RPCs: create/update campaign (admin/store ownership); customer purchase;
-- issuer payment confirmation; customer list-own; redeem coupon atomically;
-- issuer/admin reports. Do not expose direct table writes to authenticated clients.
