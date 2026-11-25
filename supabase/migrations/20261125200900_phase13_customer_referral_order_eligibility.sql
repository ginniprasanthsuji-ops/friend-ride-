-- Phase 13 referral eligibility: count two completed orders that have payment confirmation timestamp.
create or replace function public.fr_customer_referral_recalculate(p_customer_id uuid)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare v_count integer;v_ref public.fr_customer_referrals%rowtype;
begin
 select count(*)::integer into v_count from public.fr_market_orders o where o.customer_id=p_customer_id and o.status='completed' and o.payment_confirmed_at is not null;
 select * into v_ref from public.fr_customer_referrals where referred_customer_id=p_customer_id for update;
 if not found then return jsonb_build_object('ok',true,'linked_referral',false,'eligible_order_count',v_count);end if;
 update public.fr_customer_referrals set eligible_order_count=v_count,status=case when v_count>=2 and status not in ('rejected','rewarded') then 'eligible' when v_count<2 and status='eligible' then 'pending' else status end,updated_at=now() where id=v_ref.id;
 return jsonb_build_object('ok',true,'linked_referral',true,'eligible_order_count',v_count,'eligibility_met',v_count>=2,'reward_status',v_ref.reward_status);
end;$$;
create or replace function public.fr_customer_referral_order_update_trigger()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if (old.status is distinct from new.status) or (old.payment_confirmed_at is distinct from new.payment_confirmed_at) then
  perform public.fr_customer_referral_recalculate(new.customer_id);
 end if;
 return new;
end;$$;
drop trigger if exists fr_customer_referral_order_eligibility_update on public.fr_market_orders;
create trigger fr_customer_referral_order_eligibility_update after update of status,payment_confirmed_at on public.fr_market_orders for each row execute function public.fr_customer_referral_order_update_trigger();
revoke all on function public.fr_customer_referral_recalculate(uuid) from public,anon,authenticated;
revoke all on function public.fr_customer_referral_order_update_trigger() from public,anon,authenticated;
