-- Project X2 Food/Shop partner quote and customer counter quote RPC draft.
-- Review-only. Depends on migrations 005-007. Do not apply yet.
begin;
create or replace function public.fr_partner_quote_market_order(p_order_id uuid,p_quotes jsonb)
returns boolean language plpgsql security definer set search_path=''
as $$
declare v_partner uuid:=auth.uid(); v_status text; v_order_total bigint:=0; v_item record; v_quote jsonb; v_price integer; v_found int:=0;
begin
 if v_partner is null then raise exception 'Authentication required'; end if;
 if p_quotes is null or jsonb_typeof(p_quotes)<>'array' or jsonb_array_length(p_quotes)=0 then raise exception 'Quote items required'; end if;
 select status into v_status from public.fr_market_orders where order_id=p_order_id and partner_id=v_partner for update;
 if not found then raise exception 'Order not found for this partner'; end if;
 if v_status not in ('quote_requested','accepted','quoted') then raise exception 'Order not in quoteable state'; end if;
 for v_item in select item_id,quantity,unit_price_paise from public.fr_market_order_items where order_id=p_order_id loop
   v_quote:=null;
   select value into v_quote from jsonb_array_elements(p_quotes) where (value->>'item_id')=v_item.item_id::text limit 1;
   if v_quote is null then raise exception 'Quote missing for order item'; end if;
   v_price:=nullif(v_quote->>'price_paise','')::integer;
   if v_price is null or v_price<=0 then raise exception 'Quote price must be positive'; end if;
   update public.fr_market_order_items set partner_quote_paise=v_price where item_id=v_item.item_id;
   v_order_total:=v_order_total+round(v_item.quantity*v_price);
   v_found:=v_found+1;
 end loop;
 if v_found<>jsonb_array_length(p_quotes) then raise exception 'Unexpected or duplicate quote item'; end if;
 update public.fr_market_orders set status='quoted',quote_subtotal_paise=v_order_total,total_amount_paise=v_order_total+delivery_fee_paise,updated_at=now() where order_id=p_order_id;
 return true;
end; $$;

create or replace function public.fr_customer_accept_market_quote(p_order_id uuid)
returns boolean language plpgsql security definer set search_path=''
as $$
declare v_customer uuid:=auth.uid(); v_status text; v_total bigint;
begin
 if v_customer is null then raise exception 'Authentication required'; end if;
 select status,total_amount_paise into v_status,v_total from public.fr_market_orders where order_id=p_order_id and customer_id=v_customer for update;
 if not found then raise exception 'Order not found for this customer'; end if;
 if v_status<>'quoted' or v_total is null then raise exception 'No active partner quote'; end if;
 update public.fr_market_orders set status='customer_quote_accepted',updated_at=now() where order_id=p_order_id;
 return true;
end; $$;

create or replace function public.fr_customer_counter_market_order(p_order_id uuid,p_offers jsonb)
returns boolean language plpgsql security definer set search_path=''
as $$
declare v_customer uuid:=auth.uid(); v_status text; v_item record; v_offer jsonb; v_price integer; v_count int:=0;
begin
 if v_customer is null then raise exception 'Authentication required'; end if;
 if p_offers is null or jsonb_typeof(p_offers)<>'array' or jsonb_array_length(p_offers)=0 then raise exception 'Counter offer items required'; end if;
 select status into v_status from public.fr_market_orders where order_id=p_order_id and customer_id=v_customer for update;
 if not found then raise exception 'Order not found for this customer'; end if;
 if v_status not in ('quoted','quote_requested') then raise exception 'Order is not open for counter offer'; end if;
 for v_item in select item_id,quantity from public.fr_market_order_items where order_id=p_order_id loop
   v_offer:=null;
   select value into v_offer from jsonb_array_elements(p_offers) where (value->>'item_id')=v_item.item_id::text limit 1;
   if v_offer is null then raise exception 'Counter offer missing item'; end if;
   v_price:=nullif(v_offer->>'price_paise','')::integer;
   if v_price is null or v_price<=0 then raise exception 'Counter price must be positive'; end if;
   update public.fr_market_order_items set partner_quote_paise=v_price where item_id=v_item.item_id;
   v_count:=v_count+1;
 end loop;
 if v_count<>jsonb_array_length(p_offers) then raise exception 'Unexpected or duplicate counter item'; end if;
 update public.fr_market_orders set status='quote_requested',quote_subtotal_paise=null,total_amount_paise=null,updated_at=now() where order_id=p_order_id;
 return true;
end; $$;

revoke all on function public.fr_partner_quote_market_order(uuid,jsonb) from public,anon;
revoke all on function public.fr_customer_accept_market_quote(uuid) from public,anon;
revoke all on function public.fr_customer_counter_market_order(uuid,jsonb) from public,anon;
grant execute on function public.fr_partner_quote_market_order(uuid,jsonb) to authenticated;
grant execute on function public.fr_customer_accept_market_quote(uuid) to authenticated;
grant execute on function public.fr_customer_counter_market_order(uuid,jsonb) to authenticated;
commit;
