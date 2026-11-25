-- Phase 13 Task 3 foundation: store campaigns + redemption ledger
-- Additive only; no existing tables or records modified.
create table if not exists public.fr_store_campaigns (
  id uuid primary key default gen_random_uuid(),
  campaign_code text not null unique,
  campaign_type text not null check (campaign_type in ('flash_sale','birthday','special_day','referral_reward','coupon')),
  title text not null,
  description text,
  partner_id uuid references public.profiles(id) on delete set null,
  discount_type text not null check (discount_type in ('percentage','fixed_amount','free_delivery')),
  discount_value numeric(12,2),
  minimum_order_amount numeric(12,2) not null default 0 check (minimum_order_amount >= 0),
  maximum_discount_amount numeric(12,2) check (maximum_discount_amount is null or maximum_discount_amount >= 0),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  quantity_limit integer check (quantity_limit is null or quantity_limit > 0),
  quantity_redeemed integer not null default 0 check (quantity_redeemed >= 0),
  per_user_limit integer not null default 1 check (per_user_limit > 0),
  eligibility jsonb not null default '{}'::jsonb,
  is_active boolean not null default false,
  approval_status text not null default 'draft' check (approval_status in ('draft','pending','approved','rejected')),
  created_by uuid references public.profiles(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fr_store_campaign_dates_check check (starts_at < ends_at),
  constraint fr_store_campaign_discount_check check (
    (discount_type = 'percentage' and discount_value is not null and discount_value >= 0 and discount_value <= 100)
    or (discount_type = 'fixed_amount' and discount_value is not null and discount_value >= 0)
    or (discount_type = 'free_delivery' and (discount_value is null or discount_value >= 0))
  ),
  constraint fr_store_campaign_quantity_check check (quantity_limit is null or quantity_redeemed <= quantity_limit)
);

create table if not exists public.fr_store_campaign_redemptions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.fr_store_campaigns(id) on delete restrict,
  customer_id uuid not null references public.profiles(id) on delete restrict,
  order_id uuid,
  redemption_code text,
  status text not null default 'reserved' check (status in ('reserved','redeemed','cancelled','expired')),
  discount_amount numeric(12,2) not null default 0 check (discount_amount >= 0),
  idempotency_key text not null unique,
  reserved_at timestamptz not null default now(),
  redeemed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists fr_store_campaigns_public_active_idx
  on public.fr_store_campaigns (starts_at, ends_at)
  where is_active = true and approval_status = 'approved';
create index if not exists fr_store_campaigns_partner_idx
  on public.fr_store_campaigns (partner_id, created_at desc);
create index if not exists fr_store_redemptions_customer_idx
  on public.fr_store_campaign_redemptions (customer_id, created_at desc);
create index if not exists fr_store_redemptions_campaign_idx
  on public.fr_store_campaign_redemptions (campaign_id, status);

alter table public.fr_store_campaigns enable row level security;
alter table public.fr_store_campaign_redemptions enable row level security;

drop policy if exists fr_store_campaign_public_read_active on public.fr_store_campaigns;
create policy fr_store_campaign_public_read_active
  on public.fr_store_campaigns for select to anon, authenticated
  using (is_active = true and approval_status = 'approved' and now() >= starts_at and now() < ends_at);

drop policy if exists fr_store_campaign_admin_all on public.fr_store_campaigns;
create policy fr_store_campaign_admin_all
  on public.fr_store_campaigns for all to authenticated
  using (public.is_friend_ride_admin())
  with check (public.is_friend_ride_admin());

drop policy if exists fr_store_redemptions_read_own on public.fr_store_campaign_redemptions;
create policy fr_store_redemptions_read_own
  on public.fr_store_campaign_redemptions for select to authenticated
  using (customer_id = auth.uid() or public.is_friend_ride_admin());

-- Explicit grants: RLS policies are the authorization boundary.
grant select on public.fr_store_campaigns to anon, authenticated;
grant insert, update on public.fr_store_campaigns to authenticated;
grant select on public.fr_store_campaign_redemptions to authenticated;
revoke insert, update, delete on public.fr_store_campaign_redemptions from anon, authenticated;

-- Client INSERT/UPDATE/DELETE is intentionally not allowed on redemptions.
-- RPCs validate eligibility, lock campaign rows, and enforce idempotency.
