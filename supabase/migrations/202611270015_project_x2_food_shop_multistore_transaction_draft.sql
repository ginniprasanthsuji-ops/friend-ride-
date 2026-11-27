-- Project X2 transactional multi-store checkout RPC draft.
-- Review only: do not apply until schema/RPC dependency review is approved.
begin;

create table if not exists public.fr_market_checkout_requests (
 customer_id uuid not null references public.profiles(id) on delete restrict,
 request_key uuid not null,
 result_orders jsonb not null default '[]'::jsonb,
 created_at timestamptz not null default now(),
 primary key(customer_id,request_key),
 constraint fr_market_checkout_result_array check(jsonb_typeof(result_orders)='array')
);
alter table public.fr_market_checkout_requests enable row level security;
revoke all on public.fr_market_checkout_requests from anon,authenticated,public;

create or replace function public.fr_customer_place_market_orders_multi_v1(
 p_delivery_address text,
 p_items jsonb,
 p_request_key uuid
) returns table(order_id uuid,order_number text,store_id uuid)
language plpgsql security definer set search_path=''
as $$
declare
 v_customer uuid:=auth.uid();
 v_existing jsonb;
 v_store uuid;
 v_group jsonb;
 v_created jsonb:='[]'::jsonb;
 v_result record;
 v_store_items jsonb;
begin
 if v_customer is null then raise exception 'Authentication required'; end if;
 if p_request_key is null then raise exception 'Request key required'; end if;
 if p_delivery_address is null or length(trim(p_delivery_address))<8 then raise exception 'Valid delivery address required'; end if;
 if p_items is null or jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 or jsonb_array_length(p_items)>100 then raise exception 'Invalid order items'; end if;
 if exists(select 1 from jsonb_array_elements(p_items) x where coalesce(x.value->>'store_id','')='' or coalesce(x.value->>'catalogue_item_id','')='') then raise exception 'Each item requires store_id and catalogue_item_id'; end if;

 perform pg_advisory_xact_lock(hashtextextended(v_customer::text||':'||p_request_key::text,0));
 select result_orders into v_existing from public.fr_market_checkout_requests
 where customer_id=v_customer and request_key=p_request_key;
 if found then
  return query select (x.value->>'order_id')::uuid,x.value->>'order_number',(x.value->>'store_id')::uuid from jsonb_array_elements(v_existing) x;
  return;
 end if;

 for v_group in
  select jsonb_build_object('store_id',store_id,'items',items)
  from (
   select (x.value->>'store_id')::uuid store_id,
    jsonb_agg(x.value-'store_id' order by x.ordinality) items
   from jsonb_array_elements(p_items) with ordinality x(value,ordinality)
   group by (x.value->>'store_id')::uuid
   order by (x.value->>'store_id')::uuid
  ) grouped
 loop
  v_store:=(v_group->>'store_id')::uuid;
  v_store_items:=v_group->'items';
  select * into v_result from public.fr_customer_place_market_order(v_store,trim(p_delivery_address),v_store_items);
  v_created:=v_created||jsonb_build_array(jsonb_build_object('order_id',v_result.order_id,'order_number',v_result.order_number,'store_id',v_store));
 end loop;

 insert into public.fr_market_checkout_requests(customer_id,request_key,result_orders)
 values(v_customer,p_request_key,v_created);
 return query select (x.value->>'order_id')::uuid,x.value->>'order_number',(x.value->>'store_id')::uuid from jsonb_array_elements(v_created) x;
end; $$;

revoke all on function public.fr_customer_place_market_orders_multi_v1(text,jsonb,uuid) from public,anon;
grant execute on function public.fr_customer_place_market_orders_multi_v1(text,jsonb,uuid) to authenticated;
commit;
