-- Project X2 Food/Shop: delivery fee policy, quote-history read RPC and acceptance state draft.
-- Review-only; depends on migrations 005-009; do not apply yet.
begin;

alter table public.fr_market_orders
 add column if not exists delivery_distance_km numeric;
alter table public.fr_market_orders
 add column if not exists delivery_fee_rule text;

-- Default policy placeholder for local QA: fee must be server calculated from stored
-- distance and rule. This draft uses a transparent base+distance formula; confirm policy
-- with business owner before applying.
create or replace function public.fr_market_delivery_fee_paise(p_distance_km numeric)
returns bigint language plpgsql immutable set search_path=''
as $$
begin
 if p_distance_km is null or p_distance_km<0 or p_distance_km>100 then raise exception 'Invalid delivery distance'; end if;
 return 2000 + round(p_distance_km*500)::bigint; -- ₹20 base + ₹5/km
end; $$;

create or replace function public.fr_customer_accept_market_quote(p_order_id uuid)
returns boolean language plpgsql security definer set search_path=''
as $$
declare v_customer uuid:=auth.uid(); v_status text; v_exp timestamptz;
begin
 if v_customer is null then raise exception 'Authentication required'; end if;
 select status,quote_expires_at into v_status,v_exp from public.fr_market_orders
 where order_id=p_order_id and customer_id=v_customer for update;
 if not found then raise exception 'Order not found for this customer'; end if;
 if v_status<>'quoted' then raise exception 'No current partner quote'; end if;
 if v_exp is not null and v_exp<now() then raise exception 'Quote expired'; end if;
 update public.fr_market_orders set status='customer_quote_accepted',updated_at=now() where order_id=p_order_id;
 return true;
end; $$;

create or replace function public.fr_customer_list_market_quote_history(p_order_id uuid)
returns table(quote_id uuid,item_id uuid,submitted_role text,quote_type text,amount_paise integer,round_no integer,created_at timestamptz)
language sql stable security definer set search_path=''
as $$
 select h.quote_id,h.item_id,h.submitted_role,h.quote_type,h.amount_paise,h.round_no,h.created_at
 from public.fr_market_quote_history h
 join public.fr_market_orders o on o.order_id=h.order_id
 where h.order_id=p_order_id and (o.customer_id=auth.uid() or o.partner_id=auth.uid())
 order by h.round_no,h.created_at;
$$;

revoke all on function public.fr_customer_accept_market_quote(uuid) from public,anon;
revoke all on function public.fr_customer_list_market_quote_history(uuid) from public,anon;
grant execute on function public.fr_customer_accept_market_quote(uuid) to authenticated;
grant execute on function public.fr_customer_list_market_quote_history(uuid) to authenticated;
commit;
