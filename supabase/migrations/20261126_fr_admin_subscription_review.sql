create or replace function public.fr_admin_subscription_review(p_request_id uuid,p_action text,p_note text default null)
returns public.fr_subscription_payment_requests
language plpgsql security definer set search_path=public
as $$
declare r public.fr_subscription_payment_requests;
begin
 if not exists(select 1 from public.admin_users a where a.user_id=auth.uid()) then raise exception 'Admin access required'; end if;
 if p_action not in ('approve','reject') then raise exception 'Invalid action'; end if;
 update public.fr_subscription_payment_requests
 set status=case when p_action='approve' then 'activated' else 'rejected' end,
 admin_verified_by=auth.uid(),admin_verified_at=now(),admin_note=nullif(trim(coalesce(p_note,'')),''),updated_at=now()
 where id=p_request_id and status='reference_submitted'
 returning * into r;
 if r.id is null then raise exception 'Request not found or not awaiting admin review'; end if;
 return r;
end $$;
grant execute on function public.fr_admin_subscription_review(uuid,text,text) to authenticated;