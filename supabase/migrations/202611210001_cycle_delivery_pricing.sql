-- FRIEND RIDE Cycle Delivery pricing configuration
create table if not exists public.fr_cycle_delivery_pricing (
  id uuid primary key default gen_random_uuid(),
  pricing_key text not null unique default 'default',
  rate_0_1_km numeric(10,2) not null default 25 check(rate_0_1_km >= 0),
  rate_1_2_km numeric(10,2) not null default 30 check(rate_1_2_km >= 0),
  rate_2_3_km numeric(10,2) not null default 35 check(rate_2_3_km >= 0),
  rate_above_3_km numeric(10,2) not null default 40 check(rate_above_3_km >= 0),
  currency text not null default 'INR',
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid null
);
insert into public.fr_cycle_delivery_pricing(pricing_key,rate_0_1_km,rate_1_2_km,rate_2_3_km,rate_above_3_km,currency,active)
values('default',25,30,35,40,'INR',true)
on conflict(pricing_key) do update set
 rate_0_1_km=excluded.rate_0_1_km,rate_1_2_km=excluded.rate_1_2_km,
 rate_2_3_km=excluded.rate_2_3_km,rate_above_3_km=excluded.rate_above_3_km,
 currency=excluded.currency,active=excluded.active,updated_at=now();
alter table public.fr_cycle_delivery_pricing enable row level security;
drop policy if exists "cycle pricing read authenticated" on public.fr_cycle_delivery_pricing;
create policy "cycle pricing read authenticated" on public.fr_cycle_delivery_pricing for select to authenticated using (active = true);
