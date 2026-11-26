-- Phase 13D QA: prevent duplicate/reopened payment sessions
create or replace function public.fr_customer_create_ride_payment(p_ride_id uuid)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_uid uuid:=auth.uid(); v_r public.rides%rowtype; v_qr text; v_amt numeric(12,2); v_s public.fr_ride_payment_sessions%rowtype;
begin
 if v_uid is null then raise exception 'Authentication required'; end if;
 select * into v_r from public.rides where id=p_ride_id for update;
 if not found or v_r.customer_id<>v_uid then raise exception 'Customer does not own ride'; end if;
 if lower(coalesce(v_r.status,''))<>'completed' then raise exception 'Payment allowed only for completed rides'; end if;
 if v_r.driver_id is null then raise exception 'Ride has no assigned driver'; end if;
 select * into v_s from public.fr_ride_payment_sessions where ride_id=p_ride_id for update;
 if found then
  if v_s.status='success' then raise exception 'Payment already confirmed'; end if;
  if v_s.status='awaiting_driver_confirmation' then raise exception 'Payment is awaiting driver verification'; end if;
  if v_s.status='pending' and v_s.expires_at>now() then raise exception 'Payment QR session is already active'; end if;
 end if;
 v_amt:=coalesce(v_r.agreed_fare,v_r.fare_offer);
 if v_amt is null or v_amt<=0 then raise exception 'Invalid ride fare'; end if;
 select coalesce(provider_qr_path,partner_qr_path) into v_qr from public.profiles where id=v_r.driver_id;
 if v_qr is null then raise exception 'Driver payment QR is not configured'; end if;
 insert into public.fr_ride_payment_sessions(ride_id,customer_id,driver_id,amount,qr_path,status,transaction_id,expires_at,confirmed_at)
 values(p_ride_id,v_r.customer_id,v_r.driver_id,v_amt,v_qr,'pending',null,now()+interval '15 minutes',null)
 on conflict(ride_id) do update set amount=excluded.amount,qr_path=excluded.qr_path,status='pending',transaction_id=null,expires_at=excluded.expires_at,confirmed_at=null,updated_at=now()
 returning * into v_s;
 return jsonb_build_object('status',v_s.status,'amount',v_s.amount,'qr_path',v_s.qr_path,'expires_at',v_s.expires_at);
end $$;
revoke all on function public.fr_customer_create_ride_payment(uuid) from public,anon;
grant execute on function public.fr_customer_create_ride_payment(uuid) to authenticated,service_role;
