-- YF15: secure Razorpay platform-fee payment records.
begin;
create table if not exists public.fr_razorpay_payment_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  purpose text not null check (purpose in ('platform_fee','subscription')),
  store_id text,
  subtotal_paise integer,
  amount_paise integer not null check (amount_paise > 0),
  currency text not null default 'INR' check (currency='INR'),
  razorpay_order_id text not null unique,
  razorpay_payment_id text unique,
  status text not null default 'created' check (status in ('created','paid','failed')),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists fr_razorpay_orders_user_created_idx on public.fr_razorpay_payment_orders(user_id,created_at desc);
alter table public.fr_razorpay_payment_orders enable row level security;
drop policy if exists fr_razorpay_payment_orders_read_own on public.fr_razorpay_payment_orders;
create policy fr_razorpay_payment_orders_read_own on public.fr_razorpay_payment_orders for select to authenticated using (user_id=auth.uid());
revoke insert,update,delete on public.fr_razorpay_payment_orders from anon,authenticated;
grant select on public.fr_razorpay_payment_orders to authenticated;
commit;
