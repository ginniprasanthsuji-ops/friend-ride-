-- Phase 13 guard: Admin approval requires at least 2 completed+payment-confirmed orders.
create or replace function public.fr_customer_referral_admin_review(p_referral_id uuid,p_decision text,p_note text default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_uid uuid:=auth.uid();v_ref public.fr_customer_referrals%rowtype;
begin
 if v_uid is null then raise exception 'Authentication required';end if;
 if not public.is_friend_ride_admin() then raise exception 'Admin only';end if;
 if lower(coalesce(p_decision,'')) not in ('approve','reject') then raise exception 'Decision must be approve or reject';end if;
 select * into v_ref from public.fr_customer_referrals where id=p_referral_id for update;
 if not found then return jsonb_build_object('ok',false,'reason','not_found');end if;
 if v_ref.reward_status in ('credited','rejected') then return jsonb_build_object('ok',false,'reason','already_final');end if;
 if p_decision='approve' and v_ref.eligible_order_count<2 then raise exception 'Referral requires 2 eligible completed orders before approval';end if;
 if p_decision='approve' then update public.fr_customer_referrals set status='approved',reward_status='approved',admin_note=p_note,reviewed_by=v_uid,reviewed_at=now(),updated_at=now() where id=p_referral_id;
 else update public.fr_customer_referrals set status='rejected',reward_status='rejected',admin_note=p_note,reviewed_by=v_uid,reviewed_at=now(),updated_at=now() where id=p_referral_id;end if;
 return jsonb_build_object('ok',true,'decision',p_decision,'reward_status',case when p_decision='approve' then 'approved' else 'rejected' end,'reward_amount',v_ref.reward_amount,'eligible_order_count',v_ref.eligible_order_count);
end;$$;
revoke all on function public.fr_customer_referral_admin_review(uuid,text,text) from public,anon;
grant execute on function public.fr_customer_referral_admin_review(uuid,text,text) to authenticated;