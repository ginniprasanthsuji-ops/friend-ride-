-- Project X2 Food/Shop idempotent order creation draft.
-- Review only; no database apply. Existing UI RPC remains unchanged until integration.
begin;
alter table public.fr_market_orders add column if not exists request_key uuid;
alter table public.fr_market_orders add column if not exists request_payload_fingerprint text;
create unique index if not exists fr_market_orders_customer_request_key_uq
 on public.fr_market_orders(customer_id,request_key) where request_key is not null;

create or replace function public.fr_customer_place_market_order_v2(
 p_store_id uuid,p_delivery_address text,p_items jsonb,p_request_key uuid
) returns table(order_id uuid,order_number text)
language plpgsql security definer set search_path=''
as $$
declare v_customer uuid:=auth.uid(); v_existing uuid; v_no text; v_fingerprint text; v_existing_fingerprint text;
begin
 if v_customer is null then raise exception 'Authentication required'; end if;
 if p_request_key is null then raise exception 'Request key required'; end if;
 if p_delivery_address is null or length(trim(p_delivery_address))<8 then raise exception 'Valid delivery address required'; end if;
 if p_items is null or jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 then raise exception 'Invalid order items'; end if;
 v_fingerprint:=trim(p_delivery_address)||':'||p_store_id::text||':'||p_items::text;
 select o.order_id,o.order_number,o.request_payload_fingerprint into v_existing,v_no,v_existing_fingerprint
 from public.fr_market_orders o
 where o.customer_id=v_customer and o.request_key=p_request_key;
 if found then
  if v_existing_fingerprint is distinct from v_fingerprint then raise exception 'Request key already used with a different order payload'; end if;
  return query select v_existing,v_no; return;
 end if;

 -- Serialize identical customer request keys before invoking legacy validated creation.
 perform pg_advisory_xact_lock(hashtextextended(v_customer::text||':'||p_request_key::text,0));
 select o.order_id,o.order_number,o.request_payload_fingerprint into v_existing,v_no,v_existing_fingerprint
 from public.fr_market_orders o
 where o.customer_id=v_customer and o.request_key=p_request_key;
 if found then
  if v_existing_fingerprint is distinct from v_fingerprint then raise exception 'Request key already used with a different order payload'; end if;
  return query select v_existing,v_no; return;
 end if;

 -- Legacy RPC performs store/item/price/quantity checks. This v2 wrapper records the key
 -- against the newly created order atomically; any error rolls back both operations.
 select x.order_id,x.order_number into v_existing,v_no
 from public.fr_customer_place_market_order(p_store_id,p_delivery_address,p_items) x;
 update public.fr_market_orders set request_key=p_request_key,request_payload_fingerprint=v_fingerprint
 where order_id=v_existing and customer_id=v_customer;
 return query select v_existing,v_no;
end; $$;

revoke all on function public.fr_customer_place_market_order_v2(uuid,text,jsonb,uuid) from public,anon;
grant execute on function public.fr_customer_place_market_order_v2(uuid,text,jsonb,uuid) to authenticated;
commit;
