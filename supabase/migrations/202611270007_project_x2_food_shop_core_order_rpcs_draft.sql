-- Project X2 Food/Shop RPC draft: place order, list orders, partner status update
-- Review-only. Depends on migration 202611270006 schema draft and catalogue foundation.
begin;
create or replace function public.fr_customer_place_market_order(
 p_store_id uuid,
 p_delivery_address text,
 p_items jsonb
) returns table(order_id uuid, order_number text)
language plpgsql security definer set search_path=''
as $$
declare
 v_customer uuid:=auth.uid();
 v_order uuid;
 v_order_no text;
 v_subtotal bigint:=0;
 v_item jsonb;
 v_cat public.fr_partner_catalogue_items%rowtype;
 v_qty numeric;
 v_count int:=0;
begin
 if v_customer is null then raise exception 'Authentication required'; end if;
 if p_delivery_address is null or length(trim(p_delivery_address))<8 then raise exception 'Valid delivery address required'; end if;
 if p_items is null or jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 or jsonb_array_length(p_items)>100 then raise exception 'Invalid order items'; end if;
 if not exists(select 1 from public.profiles p where p.id=p_store_id and lower(coalesce(p.role,''))='partner' and lower(coalesce(p.partner_approval_status,'pending'))='approved') then raise exception 'Approved store required'; end if;
 v_order:=gen_random_uuid();
 v_order_no:='FR-'||upper(substr(replace(v_order::text,'-',''),1,10));
 insert into public.fr_market_orders(order_id,order_number,customer_id,partner_id,delivery_address,status,delivery_fee_paise)
 values(v_order,v_order_no,v_customer,p_store_id,trim(p_delivery_address),'quote_requested',0);
 for v_item in select value from jsonb_array_elements(p_items) loop
  v_count:=v_count+1;
  v_qty:=nullif(v_item->>'quantity','')::numeric;
  if v_qty is null or v_qty<=0 or v_qty>10000 then raise exception 'Invalid item quantity'; end if;
  if coalesce(v_item->>'catalogue_item_id','')='' then raise exception 'Catalogue item ID required'; end if;
  select c.* into v_cat from public.fr_partner_catalogue_items c
   where c.id=(v_item->>'catalogue_item_id')::uuid and c.partner_id=p_store_id and c.available=true;
  if not found then raise exception 'Item unavailable or not owned by selected store'; end if;
  if v_cat.price_paise is null then raise exception 'Store item price missing'; end if;
  if coalesce(v_cat.prescription_required,false) and not coalesce((v_item->>'prescription_required')::boolean,false) then raise exception 'Prescription requirement mismatch'; end if;
  v_subtotal:=v_subtotal+round(v_qty*coalesce(v_cat.offer_price_paise,v_cat.price_paise));
  insert into public.fr_market_order_items(order_id,catalogue_item_id,item_name_snapshot,quantity,unit,unit_price_paise,prescription_required,image_url_snapshot)
  values(v_order,v_cat.id,v_cat.item_name,v_qty,v_cat.unit,coalesce(v_cat.offer_price_paise,v_cat.price_paise),v_cat.prescription_required,v_cat.image_url);
 end loop;
 if v_count=0 then raise exception 'No valid items'; end if;
 update public.fr_market_orders set quote_subtotal_paise=v_subtotal,total_amount_paise=v_subtotal,updated_at=now() where fr_market_orders.order_id=v_order;
 return query select v_order,v_order_no;
end; $$;

create or replace function public.fr_customer_list_market_orders()
returns table(order_id uuid,order_number text,partner_id uuid,delivery_address text,status text,quote_subtotal_paise bigint,delivery_fee_paise bigint,total_amount_paise bigint,payment_status text,created_at timestamptz,items jsonb)
language sql stable security definer set search_path=''
as $$
 select o.order_id,o.order_number,o.partner_id,o.delivery_address,o.status,o.quote_subtotal_paise,o.delivery_fee_paise,o.total_amount_paise,o.payment_status,o.created_at,
  coalesce((select jsonb_agg(jsonb_build_object('item_id',i.item_id,'item_name',i.item_name_snapshot,'quantity',i.quantity,'unit',i.unit,'unit_price_paise',i.unit_price_paise,'partner_quote_paise',i.partner_quote_paise,'prescription_required',i.prescription_required,'image_url',i.image_url_snapshot) order by i.created_at) from public.fr_market_order_items i where i.order_id=o.order_id),'[]'::jsonb)
 from public.fr_market_orders o where o.customer_id=auth.uid() order by o.created_at desc;
$$;

create or replace function public.fr_partner_list_market_orders(p_status text default null)
returns table(order_id uuid,order_number text,customer_id uuid,delivery_address text,status text,quote_subtotal_paise bigint,delivery_fee_paise bigint,total_amount_paise bigint,payment_status text,created_at timestamptz,items jsonb)
language sql stable security definer set search_path=''
as $$
 select o.order_id,o.order_number,o.customer_id,o.delivery_address,o.status,o.quote_subtotal_paise,o.delivery_fee_paise,o.total_amount_paise,o.payment_status,o.created_at,
  coalesce((select jsonb_agg(jsonb_build_object('item_id',i.item_id,'item_name',i.item_name_snapshot,'quantity',i.quantity,'unit',i.unit,'unit_price_paise',i.unit_price_paise,'partner_quote_paise',i.partner_quote_paise,'prescription_required',i.prescription_required,'image_url',i.image_url_snapshot) order by i.created_at) from public.fr_market_order_items i where i.order_id=o.order_id),'[]'::jsonb)
 from public.fr_market_orders o where o.partner_id=auth.uid() and (p_status is null or o.status=p_status) order by o.created_at desc;
$$;

create or replace function public.fr_partner_update_market_order(p_order_id uuid,p_status text)
returns boolean language plpgsql security definer set search_path=''
as $$
declare v_partner uuid:=auth.uid(); v_old text;
begin
 if v_partner is null then raise exception 'Authentication required'; end if;
 select status into v_old from public.fr_market_orders where order_id=p_order_id and partner_id=v_partner for update;
 if not found then raise exception 'Order not found for this partner'; end if;
 if not ((v_old='quote_requested' and p_status in ('accepted','rejected')) or (v_old='accepted' and p_status='preparing') or (v_old='preparing' and p_status='ready') or (v_old='ready' and p_status='completed')) then raise exception 'Invalid order status transition'; end if;
 update public.fr_market_orders set status=p_status,updated_at=now() where order_id=p_order_id;
 return true;
end; $$;

revoke all on function public.fr_customer_place_market_order(uuid,text,jsonb) from public,anon;
revoke all on function public.fr_customer_list_market_orders() from public,anon;
revoke all on function public.fr_partner_list_market_orders(text) from public,anon;
revoke all on function public.fr_partner_update_market_order(uuid,text) from public,anon;
grant execute on function public.fr_customer_place_market_order(uuid,text,jsonb) to authenticated;
grant execute on function public.fr_customer_list_market_orders() to authenticated;
grant execute on function public.fr_partner_list_market_orders(text) to authenticated;
grant execute on function public.fr_partner_update_market_order(uuid,text) to authenticated;
commit;
