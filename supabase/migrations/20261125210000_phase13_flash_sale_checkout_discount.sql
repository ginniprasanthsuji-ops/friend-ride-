-- Phase 13 Task 13: secure Flash Sale quote-acceptance checkout discount.
alter table public.fr_market_orders
 add column if not exists flash_sale_redemption_id uuid,
 add column if not exists flash_sale_discount_paise bigint not null default 0,
 add column if not exists flash_sale_campaign_code text;
do $$ begin
 if not exists(select 1 from pg_constraint where conname='fr_market_orders_flash_sale_discount_nonnegative') then
  alter table public.fr_market_orders add constraint fr_market_orders_flash_sale_discount_nonnegative check(flash_sale_discount_paise>=0);
 end if;
end $$;
create or replace function public.fr_customer_accept_market_quote(p_order_id uuid,p_redemption_id uuid default null)
 returns jsonb language plpgsql security definer set search_path='' as $function$
declare
 v_order public.fr_market_orders%rowtype; v_red public.fr_store_campaign_redemptions%rowtype; v_campaign public.fr_store_campaigns%rowtype;
 v_subtotal bigint; v_delivery bigint; v_discount bigint:=0; v_total bigint; v_upi text; v_campaign_code text; v_count integer;
begin
 if auth.uid() is null then raise exception 'Customer login required'; end if;
 select * into v_order from public.fr_market_orders where id=p_order_id and customer_id=auth.uid() and status='quoted' for update;
 if not found then raise exception 'Quote cannot be accepted'; end if;
 select p.upi_id into v_upi from public.profiles p where p.id=v_order.partner_id and p.role='partner' and lower(coalesce(p.partner_approval_status,''))='approved';
 if coalesce(length(trim(v_upi)),0)<3 or position('@' in v_upi)<2 then raise exception 'Shop has not configured a valid UPI ID yet. Contact the Shop.'; end if;
 select coalesce(sum(i.partner_quote_paise*i.quantity),0) into v_subtotal from public.fr_market_order_items i where i.order_id=p_order_id;
 if v_subtotal<=0 then raise exception 'Shop quotation must contain valid prices'; end if;
 v_delivery:=greatest(0,coalesce(v_order.delivery_fee_paise,0));
 if p_redemption_id is not null then
  select * into v_red from public.fr_store_campaign_redemptions where id=p_redemption_id for update;
  if not found or v_red.customer_id<>auth.uid() then raise exception 'Flash Sale reservation not found or not owned'; end if;
  if v_red.status<>'reserved' then raise exception 'Flash Sale reservation is not active'; end if;
  if v_red.order_id is distinct from p_order_id then raise exception 'Flash Sale reservation must be linked to this order first'; end if;
  select * into v_campaign from public.fr_store_campaigns where id=v_red.campaign_id for update;
  if not found or v_campaign.partner_id is distinct from v_order.partner_id then raise exception 'Campaign store does not match order store'; end if;
  if v_campaign.campaign_type<>'flash_sale' or not v_campaign.is_active or v_campaign.approval_status<>'approved' or now()<v_campaign.starts_at or now()>=v_campaign.ends_at then raise exception 'Flash Sale is not active and approved'; end if;
  if (v_subtotal::numeric/100)<v_campaign.minimum_order_amount then raise exception 'Flash Sale minimum order is not met'; end if;
  select count(*) into v_count from public.fr_store_campaign_redemptions where campaign_id=v_campaign.id and customer_id=auth.uid() and status='redeemed';
  if v_count>=v_campaign.per_user_limit then raise exception 'Per-user Flash Sale limit exceeded'; end if;
  v_discount:=case when v_campaign.discount_type='percentage' then round(v_subtotal*v_campaign.discount_value/100)::bigint when v_campaign.discount_type='fixed_amount' then round(v_campaign.discount_value*100)::bigint when v_campaign.discount_type='free_delivery' then v_delivery else 0 end;
  if v_campaign.maximum_discount_amount is not null and v_campaign.discount_type<>'free_delivery' then v_discount:=least(v_discount,round(v_campaign.maximum_discount_amount*100)::bigint); end if;
  if v_campaign.discount_type='free_delivery' then v_discount:=least(v_discount,v_delivery); else v_discount:=least(greatest(v_discount,0),v_subtotal); end if;
  v_campaign_code:=v_campaign.campaign_code;
 end if;
 v_total:=greatest(0,v_subtotal+v_delivery-v_discount);
 update public.fr_market_orders set status='payment_pending',quote_subtotal_paise=v_subtotal,total_amount_paise=v_total,payment_status='pending',payment_expires_at=now()+interval '5 minutes',payment_extension_used=false,payment_confirmed_at=null,payment_reference=null,flash_sale_redemption_id=p_redemption_id,flash_sale_discount_paise=v_discount,flash_sale_campaign_code=v_campaign_code,updated_at=now() where id=p_order_id;
 insert into public.fr_ride_notifications(user_id,title,message) values(v_order.partner_id,'Customer accepted quotation','Customer accepted quotation for '||v_order.order_number||'. Payment window started.');
 return jsonb_build_object('ok',true,'status','payment_pending','subtotal_paise',v_subtotal,'delivery_fee_paise',v_delivery,'flash_sale_discount_paise',v_discount,'total_paise',v_total,'campaign_code',v_campaign_code,'expires_at',now()+interval '5 minutes');
end;$function$;
drop function if exists public.fr_customer_accept_market_quote(uuid);
revoke all on function public.fr_customer_accept_market_quote(uuid,uuid) from public,anon;
grant execute on function public.fr_customer_accept_market_quote(uuid,uuid) to authenticated;
create or replace function public.fr_partner_confirm_market_payment(p_order_id uuid,p_payment_reference text default null)
 returns jsonb language plpgsql security definer set search_path='' as $function$
declare v_order public.fr_market_orders%rowtype; v_red public.fr_store_campaign_redemptions%rowtype;
begin
 if auth.uid() is null or not exists(select 1 from public.profiles p where p.id=auth.uid() and lower(coalesce(p.role,''))='partner' and lower(coalesce(p.partner_approval_status,''))='approved') then raise exception 'Approved Shop Partner login required'; end if;
 select * into v_order from public.fr_market_orders where id=p_order_id and partner_id=auth.uid() and status='payment_pending' and payment_status='pending' for update;
 if not found then raise exception 'Payment is not awaiting confirmation for this Shop Order'; end if;
 if v_order.payment_expires_at is null or v_order.payment_expires_at<now() then raise exception 'Payment window expired. Order cannot be confirmed.'; end if;
 if v_order.flash_sale_redemption_id is not null then select * into v_red from public.fr_store_campaign_redemptions where id=v_order.flash_sale_redemption_id for update; if not found or v_red.status<>'reserved' or v_red.order_id<>p_order_id then raise exception 'Flash Sale redemption state invalid'; end if; end if;
 update public.fr_market_orders set status='accepted',payment_status='paid',payment_confirmed_at=now(),payment_reference=nullif(left(trim(coalesce(p_payment_reference,'')),120),''),updated_at=now() where id=p_order_id;
 if v_order.flash_sale_redemption_id is not null then update public.fr_store_campaign_redemptions set status='redeemed',redeemed_at=now() where id=v_order.flash_sale_redemption_id; end if;
 insert into public.fr_ride_notifications(user_id,title,message) values(v_order.customer_id,'Shop payment confirmed','Shop confirmed your payment for '||v_order.order_number||'. Your order is confirmed.');
 return jsonb_build_object('ok',true,'status','accepted','payment_status','paid','flash_sale_redeemed',v_order.flash_sale_redemption_id is not null);
end;$function$;
revoke all on function public.fr_partner_confirm_market_payment(uuid,text) from public,anon;
grant execute on function public.fr_partner_confirm_market_payment(uuid,text) to authenticated;
