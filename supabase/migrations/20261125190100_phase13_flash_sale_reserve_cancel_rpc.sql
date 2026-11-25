create or replace function public.fr_store_flash_sale_reserve(
  p_campaign_id uuid,
  p_cart_subtotal numeric,
  p_idempotency_key text
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_campaign public.fr_store_campaigns%rowtype;
  v_existing public.fr_store_campaign_redemptions%rowtype;
  v_count integer;
  v_discount numeric(12,2);
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if p_cart_subtotal is null or p_cart_subtotal < 0 then raise exception 'Invalid cart subtotal'; end if;
  if p_idempotency_key is null or length(trim(p_idempotency_key)) < 8 then raise exception 'Invalid idempotency key'; end if;

  select * into v_existing from public.fr_store_campaign_redemptions where idempotency_key = p_idempotency_key;
  if found then
    if v_existing.customer_id <> v_uid then raise exception 'Idempotency key belongs to another user'; end if;
    return jsonb_build_object('status',v_existing.status,'redemption_id',v_existing.id,'discount_amount',v_existing.discount_amount,'idempotent_replay',true);
  end if;

  if not exists (select 1 from public.profiles p where p.id=v_uid and p.role='customer') then raise exception 'Customer account required'; end if;
  select * into v_campaign from public.fr_store_campaigns where id=p_campaign_id for update;
  if not found then raise exception 'Campaign not found'; end if;
  if v_campaign.campaign_type <> 'flash_sale' then raise exception 'Campaign is not a flash sale'; end if;
  if not v_campaign.is_active or v_campaign.approval_status <> 'approved' then raise exception 'Campaign is not active/approved'; end if;
  if now() < v_campaign.starts_at or now() >= v_campaign.ends_at then raise exception 'Campaign is outside its active time window'; end if;
  if p_cart_subtotal < v_campaign.minimum_order_amount then raise exception 'Minimum order amount not met'; end if;

  select count(*) into v_count from public.fr_store_campaign_redemptions where campaign_id=p_campaign_id and customer_id=v_uid and status in ('reserved','redeemed');
  if v_count >= v_campaign.per_user_limit then raise exception 'Per-user redemption limit reached'; end if;
  if v_campaign.quantity_limit is not null and v_campaign.quantity_redeemed >= v_campaign.quantity_limit then raise exception 'Flash sale quantity exhausted'; end if;

  v_discount := case
    when v_campaign.discount_type='percentage' then p_cart_subtotal * v_campaign.discount_value / 100
    when v_campaign.discount_type='fixed_amount' then v_campaign.discount_value
    when v_campaign.discount_type='free_delivery' then 0
    else 0 end;
  if v_campaign.maximum_discount_amount is not null then v_discount := least(v_discount,v_campaign.maximum_discount_amount); end if;
  v_discount := least(greatest(coalesce(v_discount,0),0),p_cart_subtotal);

  update public.fr_store_campaigns set quantity_redeemed=quantity_redeemed+1,updated_at=now() where id=p_campaign_id;
  insert into public.fr_store_campaign_redemptions(campaign_id,customer_id,status,discount_amount,idempotency_key,redemption_code)
  values (p_campaign_id,v_uid,'reserved',v_discount,p_idempotency_key,upper(substr(encode(gen_random_bytes(8),'hex'),1,12)))
  returning * into v_existing;
  return jsonb_build_object('status',v_existing.status,'redemption_id',v_existing.id,'discount_amount',v_existing.discount_amount,'redemption_code',v_existing.redemption_code,'idempotent_replay',false);
end;
$$;

create or replace function public.fr_store_flash_sale_cancel_reservation(p_redemption_id uuid)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_redemption public.fr_store_campaign_redemptions%rowtype;
  v_campaign public.fr_store_campaigns%rowtype;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  select * into v_redemption from public.fr_store_campaign_redemptions where id=p_redemption_id for update;
  if not found then raise exception 'Reservation not found'; end if;
  if v_redemption.customer_id <> v_uid then raise exception 'Not your reservation'; end if;
  if v_redemption.status <> 'reserved' then raise exception 'Reservation is not cancellable'; end if;
  select * into v_campaign from public.fr_store_campaigns where id=v_redemption.campaign_id for update;
  update public.fr_store_campaign_redemptions set status='cancelled' where id=p_redemption_id;
  update public.fr_store_campaigns set quantity_redeemed=greatest(quantity_redeemed-1,0),updated_at=now() where id=v_campaign.id;
  return jsonb_build_object('status','cancelled','redemption_id',p_redemption_id);
end;
$$;

revoke all on function public.fr_store_flash_sale_reserve(uuid,numeric,text) from public, anon;
grant execute on function public.fr_store_flash_sale_reserve(uuid,numeric,text) to authenticated;
revoke all on function public.fr_store_flash_sale_cancel_reservation(uuid) from public, anon;
grant execute on function public.fr_store_flash_sale_cancel_reservation(uuid) to authenticated;
