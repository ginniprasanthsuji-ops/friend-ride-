-- Phase 13 Flash Sale reservation-to-order linking; this does not apply a discount.
create or replace function public.fr_store_flash_sale_attach_order(p_redemption_id uuid,p_order_id uuid)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare v_uid uuid:=auth.uid();v_red public.fr_store_campaign_redemptions%rowtype;v_campaign public.fr_store_campaigns%rowtype;v_order public.fr_market_orders%rowtype;
begin
 if v_uid is null then raise exception 'Authentication required';end if;
 select * into v_red from public.fr_store_campaign_redemptions where id=p_redemption_id for update;
 if not found then raise exception 'Reservation not found';end if;
 if v_red.customer_id<>v_uid then raise exception 'Not your reservation';end if;
 if v_red.status<>'reserved' then raise exception 'Reservation must be active';end if;
 select * into v_campaign from public.fr_store_campaigns where id=v_red.campaign_id;
 select * into v_order from public.fr_market_orders where id=p_order_id;
 if not found then raise exception 'Order not found';end if;
 if v_order.customer_id<>v_uid then raise exception 'Not your order';end if;
 if v_order.partner_id<>v_campaign.partner_id then raise exception 'Order store does not match campaign store';end if;
 if v_red.order_id is not null and v_red.order_id<>p_order_id then raise exception 'Reservation already linked to another order';end if;
 update public.fr_store_campaign_redemptions set order_id=p_order_id where id=p_redemption_id;
 return jsonb_build_object('ok',true,'status','reserved','order_id',p_order_id,'discount_applied',false,'note','Linked only; checkout discount/payment integration is not yet active.');
end;$$;
revoke all on function public.fr_store_flash_sale_attach_order(uuid,uuid) from public,anon;
grant execute on function public.fr_store_flash_sale_attach_order(uuid,uuid) to authenticated;