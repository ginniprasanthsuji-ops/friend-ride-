-- Phase 13: secure customer referral binding from registration
create or replace function public.fr_customer_referral_bind_code(p_referral_code text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
 v_uid uuid:=auth.uid(); v_role text; v_referrer uuid; v_code text:=upper(trim(coalesce(p_referral_code,'')));
begin
 if v_uid is null then raise exception 'Authentication required'; end if;
 if v_code='' then return jsonb_build_object('ok',false,'reason','empty_code'); end if;
 select role into v_role from public.profiles where id=v_uid;
 if lower(coalesce(v_role,''))<>'customer' then return jsonb_build_object('ok',false,'reason','customer_only'); end if;
 select customer_id into v_referrer from public.fr_customer_referral_codes where referral_code=v_code and is_active=true;
 if v_referrer is null then return jsonb_build_object('ok',false,'reason','invalid_code'); end if;
 if v_referrer=v_uid then return jsonb_build_object('ok',false,'reason','self_referral'); end if;
 if exists(select 1 from public.fr_customer_referrals where referred_customer_id=v_uid) then return jsonb_build_object('ok',false,'reason','already_referred'); end if;
 insert into public.fr_customer_referrals(referrer_customer_id,referred_customer_id,referral_code,status,reward_amount) values(v_referrer,v_uid,v_code,'pending',50);
 return jsonb_build_object('ok',true,'status','pending','reward_amount',50);
exception when unique_violation then return jsonb_build_object('ok',false,'reason','already_referred');
end;$$;
revoke all on function public.fr_customer_referral_bind_code(text) from public,anon;
grant execute on function public.fr_customer_referral_bind_code(text) to authenticated;