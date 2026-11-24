-- FRIEND RIDE Local Business Growth Suite: additive schema proposal
-- Apply only after reviewing store/partner identity mapping and existing schema.
-- No live DB changes were performed by this commit.
begin;

create table if not exists public.fr_store_reviews (
  id uuid primary key default gen_random_uuid(),
  store_partner_user_id uuid not null references auth.users(id) on delete cascade,
  customer_user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid,
  rating smallint not null check (rating between 1 and 5),
  review_text text,
  status text not null default 'pending' check (status in ('pending','published','hidden','reported')),
  partner_reply text,
  partner_replied_at timestamptz,
  created_at timestamptz not null default now(),
  unique (customer_user_id, order_id)
);
create index if not exists fr_store_reviews_store_status_created_idx
  on public.fr_store_reviews(store_partner_user_id,status,created_at desc);

create table if not exists public.fr_store_flash_sales (
  id uuid primary key default gen_random_uuid(),
  store_partner_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  discount_type text not null check (discount_type in ('percent','amount','fixed_price')),
  discount_value numeric(10,2) not null check (discount_value > 0),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  claim_limit integer check (claim_limit is null or claim_limit > 0),
  claimed_count integer not null default 0 check (claimed_count >= 0),
  status text not null default 'draft' check (status in ('draft','active','paused','expired','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (discount_type <> 'percent' or discount_value <= 100),
  check (claim_limit is null or claimed_count <= claim_limit)
);
create index if not exists fr_store_flash_sales_live_idx
  on public.fr_store_flash_sales(status,starts_at,ends_at);

create table if not exists public.fr_store_loyalty_accounts (
  id uuid primary key default gen_random_uuid(),
  store_partner_user_id uuid not null references auth.users(id) on delete cascade,
  customer_user_id uuid not null references auth.users(id) on delete cascade,
  points_balance integer not null default 0 check (points_balance >= 0),
  stamps_balance integer not null default 0 check (stamps_balance >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_partner_user_id,customer_user_id)
);
create table if not exists public.fr_store_loyalty_ledger (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.fr_store_loyalty_accounts(id) on delete cascade,
  transaction_type text not null check (transaction_type in ('earn_points','earn_stamp','redeem','adjustment')),
  points_delta integer not null default 0,
  stamps_delta integer not null default 0,
  order_id uuid,
  reward_reference text,
  note text,
  actor_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (points_delta <> 0 or stamps_delta <> 0)
);
create index if not exists fr_store_loyalty_ledger_account_created_idx
  on public.fr_store_loyalty_ledger(account_id,created_at desc);

create table if not exists public.fr_customer_special_offer_preferences (
  customer_user_id uuid primary key references auth.users(id) on delete cascade,
  birthday date,
  birthday_marketing_opt_in boolean not null default false,
  special_offer_notifications_opt_in boolean not null default false,
  updated_at timestamptz not null default now(),
  check (birthday_marketing_opt_in = false or birthday is not null)
);

alter table public.fr_store_reviews enable row level security;
alter table public.fr_store_flash_sales enable row level security;
alter table public.fr_store_loyalty_accounts enable row level security;
alter table public.fr_store_loyalty_ledger enable row level security;
alter table public.fr_customer_special_offer_preferences enable row level security;

-- Review visibility: customers see their own reviews; partners see reviews for their store;
-- public customer browsing is limited to published rows.
drop policy if exists fr_store_reviews_customer_read on public.fr_store_reviews;
create policy fr_store_reviews_customer_read on public.fr_store_reviews
  for select to authenticated using (customer_user_id=auth.uid());
drop policy if exists fr_store_reviews_partner_read on public.fr_store_reviews;
create policy fr_store_reviews_partner_read on public.fr_store_reviews
  for select to authenticated using (store_partner_user_id=auth.uid());
drop policy if exists fr_store_reviews_published_read on public.fr_store_reviews;
create policy fr_store_reviews_published_read on public.fr_store_reviews
  for select to authenticated using (status='published');
drop policy if exists fr_store_reviews_customer_insert on public.fr_store_reviews;
create policy fr_store_reviews_customer_insert on public.fr_store_reviews
  for insert to authenticated with check (customer_user_id=auth.uid() and status='pending' and partner_reply is null);

-- Store owner manages their own sales only; activation/redemption workflows should be RPC-guarded.
drop policy if exists fr_flash_sales_partner_manage on public.fr_store_flash_sales;
create policy fr_flash_sales_partner_manage on public.fr_store_flash_sales
  for all to authenticated using (store_partner_user_id=auth.uid())
  with check (store_partner_user_id=auth.uid());
drop policy if exists fr_flash_sales_customer_read on public.fr_store_flash_sales;
create policy fr_flash_sales_customer_read on public.fr_store_flash_sales
  for select to authenticated using (status='active' and starts_at<=now() and ends_at>now());

drop policy if exists fr_loyalty_account_customer_read on public.fr_store_loyalty_accounts;
create policy fr_loyalty_account_customer_read on public.fr_store_loyalty_accounts
  for select to authenticated using (customer_user_id=auth.uid());
drop policy if exists fr_loyalty_account_partner_read on public.fr_store_loyalty_accounts;
create policy fr_loyalty_account_partner_read on public.fr_store_loyalty_accounts
  for select to authenticated using (store_partner_user_id=auth.uid());
drop policy if exists fr_loyalty_ledger_customer_read on public.fr_store_loyalty_ledger;
create policy fr_loyalty_ledger_customer_read on public.fr_store_loyalty_ledger
  for select to authenticated using (exists(select 1 from public.fr_store_loyalty_accounts a where a.id=account_id and a.customer_user_id=auth.uid()));
drop policy if exists fr_loyalty_ledger_partner_read on public.fr_store_loyalty_ledger;
create policy fr_loyalty_ledger_partner_read on public.fr_store_loyalty_ledger
  for select to authenticated using (exists(select 1 from public.fr_store_loyalty_accounts a where a.id=account_id and a.store_partner_user_id=auth.uid()));

drop policy if exists fr_special_offer_preferences_self_manage on public.fr_customer_special_offer_preferences;
create policy fr_special_offer_preferences_self_manage on public.fr_customer_special_offer_preferences
  for all to authenticated using (customer_user_id=auth.uid()) with check (customer_user_id=auth.uid());

commit;
