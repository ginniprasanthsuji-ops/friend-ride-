-- Project X2 Food/Shop negotiation integrity corrections (draft/review only)
-- Depends on migrations 005-008. Not applied to any database.
begin;

alter table public.fr_market_order_items
 add column if not exists customer_counter_paise integer;
alter table public.fr_market_order_items
 add column if not exists quote_round integer not null default 0;
alter table public.fr_market_orders
 add column if not exists quote_expires_at timestamptz;
alter table public.fr_market_orders
 add column if not exists quote_round integer not null default 0;

create table if not exists public.fr_market_quote_history (
 quote_id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.fr_market_orders(order_id) on delete cascade,
 item_id uuid not null references public.fr_market_order_items(item_id) on delete cascade,
 submitted_by uuid not null references public.profiles(id) on delete restrict,
 submitted_role text not null check(submitted_role in ('partner','customer')),
 quote_type text not null check(quote_type in ('partner_quote','customer_counter')),
 amount_paise integer not null check(amount_paise>0),
 round_no integer not null check(round_no>0),
 created_at timestamptz not null default now()
);
create index if not exists fr_market_quote_history_order_idx on public.fr_market_quote_history(order_id,round_no,created_at);
alter table public.fr_market_quote_history enable row level security;
revoke all on public.fr_market_quote_history from anon,authenticated;

create or replace function public.fr_partner_quote_market_order(p_order_id uuid,p_quotes jsonb)
returns boolean language plpgsql security definer set search_path=''
as $$
declare v_partner uuid:=auth.uid(); v_status text; v_round int; v_total bigint:=0; v_item record; v_quote jsonb; v_price int; v_items_count int; v_payload_count int; v_distinct_count int;
begin
 if v_partner is null then raise exception 'Authentication required'; end if;
 if p_quotes is null or jsonb_typeof(p_quotes)<>'array' or jsonb_array_length(p_quotes)=0 then raise exception 'Quote items required'; end if;
 select status,quote_round into v_status,v_round from public.fr_market_orders where order_id=p_order_id and partner_id=v_partner for update;
 if not found then raise exception 'Order not found for this partner'; end if;
 if v_status not in ('quote_requested','accepted') then raise exception 'Order not in quoteable state'; end if;
 select count(*),count(distinct value->>'item_id') into v_payload_count,v_distinct_count from jsonb_array_elements(p_quotes);
 select count(*) into v_items_count from public.fr_market_order_items where order_id=p_order_id;
 if v_payload_count<>v_items_count or v_distinct_count<>v_payload_count then raise exception 'Quote payload must contain exactly one quote per order item'; end if;
 for v_item in select item_id,quantity from public.fr_market_order_items where order_id=p_order_id loop
  select value into v_quote from jsonb_array_elements(p_quotes) where value->>'item_id'=v_item.item_id::text;
  if v_quote is null then raise exception 'Quote missing order item'; end if;
  v_price:=nullif(v_quote->>'price_paise','')::integer;
  if v_price is null or v_price<=0 then raise exception 'Quote price must be positive'; end if;
  update public.fr_market_order_items set partner_quote_paise=v_price,customer_counter_paise=null,quote_round=v_round+1 where item_id=v_item.item_id;
  insert into public.fr_market_quote_history(order_id,item_id,submitted_by,submitted_role,quote_type,amount_paise,round_no)
  values(p_order_id,v_item.item_id,v_partner,'partner','partner_quote',v_price,v_round+1);
  v_total:=v_total+round(v_item.quantity*v_price);
 end loop;
 update public.fr_market_orders set status='quoted',quote_round=v_round+1,quote_subtotal_paise=v_total,total_amount_paise=v_total+delivery_fee_paise,quote_expires_at=now()+interval '24 hours',updated_at=now() where order_id=p_order_id;
 return true;
end; $$;

create or replace function public.fr_customer_counter_market_order(p_order_id uuid,p_offers jsonb)
returns boolean language plpgsql security definer set search_path=''
as $$
declare v_customer uuid:=auth.uid(); v_status text; v_round int; v_item record; v_offer jsonb; v_price int; v_count int; v_distinct int; v_items int;
begin
 if v_customer is null then raise exception 'Authentication required'; end if;
 if p_offers is null or jsonb_typeof(p_offers)<>'array' or jsonb_array_length(p_offers)=0 then raise exception 'Counter offer items required'; end if;
 select status,quote_round into v_status,v_round from public.fr_market_orders where order_id=p_order_id and customer_id=v_customer for update;
 if not found then raise exception 'Order not found for this customer'; end if;
 if v_status<>'quoted' then raise exception 'Order is not open for counter offer'; end if;
 if exists(select 1 from public.fr_market_orders where order_id=p_order_id and quote_expires_at is not null and quote_expires_at<now()) then raise exception 'Quote expired'; end if;
 select count(*),count(distinct value->>'item_id') into v_count,v_distinct from jsonb_array_elements(p_offers);
 select count(*) into v_items from public.fr_market_order_items where order_id=p_order_id;
 if v_count<>v_items or v_distinct<>v_count then raise exception 'Counter payload must contain exactly one offer per item'; end if;
 for v_item in select item_id,quantity from public.fr_market_order_items where order_id=p_order_id loop
  select value into v_offer from jsonb_array_elements(p_offers) where value->>'item_id'=v_item.item_id::text;
  if v_offer is null then raise exception 'Counter offer missing item'; end if;
  v_price:=nullif(v_offer->>'price_paise','')::integer;
  if v_price is null or v_price<=0 then raise exception 'Counter price must be positive'; end if;
  update public.fr_market_order_items set customer_counter_paise=v_price,quote_round=v_round+1 where item_id=v_item.item_id;
  insert into public.fr_market_quote_history(order_id,item_id,submitted_by,submitted_role,quote_type,amount_paise,round_no)
  values(p_order_id,v_item.item_id,v_customer,'customer','customer_counter',v_price,v_round+1);
 end loop;
 update public.fr_market_orders set status='quote_requested',quote_round=v_round+1,quote_subtotal_paise=null,total_amount_paise=null,quote_expires_at=null,updated_at=now() where order_id=p_order_id;
 return true;
end; $$;

revoke all on function public.fr_partner_quote_market_order(uuid,jsonb) from public,anon;
revoke all on function public.fr_customer_counter_market_order(uuid,jsonb) from public,anon;
grant execute on function public.fr_partner_quote_market_order(uuid,jsonb) to authenticated;
grant execute on function public.fr_customer_counter_market_order(uuid,jsonb) to authenticated;
commit;
