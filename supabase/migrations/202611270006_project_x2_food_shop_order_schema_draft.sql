-- Project X2 Food/Shop market-order schema foundation (review-only; do not apply yet)
begin;
create table if not exists public.fr_market_orders (
 order_id uuid primary key default gen_random_uuid(),
 order_number text not null unique,
 customer_id uuid not null references public.profiles(id) on delete restrict,
 partner_id uuid not null references public.profiles(id) on delete restrict,
 delivery_address text not null,
 status text not null default 'quote_requested',
 quote_subtotal_paise bigint,
 delivery_fee_paise bigint not null default 0,
 total_amount_paise bigint,
 payment_status text not null default 'unpaid',
 payment_reference text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint fr_market_order_status_check check(status in ('quote_requested','accepted','rejected','quoted','preparing','ready','completed','cancelled')),
 constraint fr_market_payment_status_check check(payment_status in ('unpaid','customer_claimed','partner_confirmed','verified','failed','refunded')),
 constraint fr_market_order_address_nonempty check(length(trim(delivery_address))>0),
 constraint fr_market_order_fee_nonnegative check(delivery_fee_paise>=0),
 constraint fr_market_order_subtotal_nonnegative check(quote_subtotal_paise is null or quote_subtotal_paise>=0),
 constraint fr_market_order_total_nonnegative check(total_amount_paise is null or total_amount_paise>=0)
);
create table if not exists public.fr_market_order_items (
 item_id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.fr_market_orders(order_id) on delete cascade,
 catalogue_item_id uuid references public.fr_partner_catalogue_items(id) on delete set null,
 item_name_snapshot text not null,
 quantity numeric not null,
 unit text,
 unit_price_paise integer,
 partner_quote_paise integer,
 prescription_required boolean not null default false,
 image_url_snapshot text,
 created_at timestamptz not null default now(),
 constraint fr_market_item_name_nonempty check(length(trim(item_name_snapshot))>0),
 constraint fr_market_item_qty_positive check(quantity>0),
 constraint fr_market_item_price_nonnegative check(unit_price_paise is null or unit_price_paise>=0),
 constraint fr_market_item_quote_nonnegative check(partner_quote_paise is null or partner_quote_paise>=0)
);
create index if not exists fr_market_orders_customer_idx on public.fr_market_orders(customer_id,created_at desc);
create index if not exists fr_market_orders_partner_idx on public.fr_market_orders(partner_id,status,created_at desc);
create index if not exists fr_market_order_items_order_idx on public.fr_market_order_items(order_id);
alter table public.fr_market_orders enable row level security;
alter table public.fr_market_order_items enable row level security;
revoke all on public.fr_market_orders from anon, authenticated;
revoke all on public.fr_market_order_items from anon, authenticated;
commit;
