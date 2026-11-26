-- Phase 13D Admin Refund Queue RPCs (QA).
-- Admin queue is private; mark_paid records manual payout confirmation only.
create or replace function public.fr_admin_ride_refund_queue(p_status text default null, p_limit integer default 100)
returns jsonb language plpgsql security definer set search_path=''
as $$
begin
 if auth.uid() is null or not public.is_friend_ride_admin() then raise exception 'Admin access required'; end if;
 return coalesce((select jsonb_agg(to_jsonb(q) order by q.requested_at desc) from (select id,ride_type,ride_id,booking_id,customer_id,amount,currency,payment_reference,status,reason,requested_at,processed_at,processed_by,refund_reference,notes from public.fr_ride_refund_requests where p_status is null or status=p_status order by requested_at desc limit greatest(1,least(coalesce(p_limit,100),250))) q),'[]'::jsonb);
end; $$;
create or replace function public.fr_admin_ride_refund_mark_paid(p_request_id uuid,p_refund_reference text,p_notes text default null)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v public.fr_ride_refund_requests%rowtype;
begin
 if auth.uid() is null or not public.is_friend_ride_admin() then raise exception 'Admin access required'; end if;
 if nullif(trim(coalesce(p_refund_reference,'')),'') is null then raise exception 'Refund reference required'; end if;
 select * into v from public.fr_ride_refund_requests where id=p_request_id for update;
 if not found then raise exception 'Refund request not found'; end if;
 if v.status not in ('refund_pending','refund_processing','payment_check_required') then raise exception 'Request is not eligible to mark refunded'; end if;
 update public.fr_ride_refund_requests set status='refunded',processed_at=now(),processed_by=auth.uid(),refund_reference=trim(p_refund_reference),notes=coalesce(p_notes,notes) where id=p_request_id;
 return jsonb_build_object('ok',true,'request_id',p_request_id,'status','refunded','refund_reference',trim(p_refund_reference),'money_transfer_confirmed_by_admin',true);
end; $$;
revoke execute on function public.fr_admin_ride_refund_queue(text,integer) from public,anon;
revoke execute on function public.fr_admin_ride_refund_mark_paid(uuid,text,text) from public,anon;
grant execute on function public.fr_admin_ride_refund_queue(text,integer) to authenticated,service_role;
grant execute on function public.fr_admin_ride_refund_mark_paid(uuid,text,text) to authenticated,service_role;
