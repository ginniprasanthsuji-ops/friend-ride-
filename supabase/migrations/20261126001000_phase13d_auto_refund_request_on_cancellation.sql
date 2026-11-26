-- Phase 13D: automatic refund-request tracking on ride cancellation (QA only).
-- Actual UPI/bank refund transfer is not performed by this migration.
create table if not exists public.fr_ride_refund_requests (
 id uuid primary key default gen_random_uuid(),
 ride_type text not null check (ride_type in ('road','shared')),
 ride_id uuid not null, booking_id uuid not null, customer_id uuid not null,
 amount numeric(12,2) not null check (amount>=0), currency text not null default 'INR',
 payment_reference text,
 status text not null default 'payment_check_required'
  check(status in ('payment_check_required','refund_pending','refund_processing','refunded','not_eligible','failed')),
 reason text not null, requested_at timestamptz not null default now(),
 processed_at timestamptz, processed_by uuid, refund_reference text, notes text,
 unique(ride_type,booking_id)
);
alter table public.fr_ride_refund_requests enable row level security;
revoke all on public.fr_ride_refund_requests from public,anon,authenticated;
grant select on public.fr_ride_refund_requests to service_role;

CREATE OR REPLACE FUNCTION public.fr_road_ride_cancel_booking(p_booking_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $function$
declare v_b public.fr_road_ride_bookings%rowtype; v_r public.fr_road_rides%rowtype; v_uid uuid:=auth.uid();
begin
 if v_uid is null then raise exception 'Login required'; end if;
 select * into v_b from public.fr_road_ride_bookings where id=p_booking_id for update;
 if not found then raise exception 'Booking not found'; end if;
 select * into v_r from public.fr_road_rides where id=v_b.ride_id for update;
 if v_uid<>v_b.passenger_id then raise exception 'Only booking passenger may cancel'; end if;
 if v_b.status not in ('booking_pending','confirmed') or v_r.departure_at<=now() or v_r.status in ('departed','in_progress','completed','cancelled','expired') then raise exception 'Cancellation not allowed'; end if;
 update public.fr_road_ride_bookings set status='cancelled',updated_at=now() where id=p_booking_id;
 update public.fr_road_rides set status='live',updated_at=now() where id=v_r.id and status='booked';
 insert into public.fr_ride_refund_requests(ride_type,ride_id,booking_id,customer_id,amount,status,reason)
 values('road',v_r.id,p_booking_id,v_b.passenger_id,coalesce(v_b.fare_snapshot,0),'payment_check_required','Passenger cancellation; verify payment then refund if paid')
 on conflict(ride_type,booking_id) do nothing;
 insert into public.fr_road_ride_events(ride_id,booking_id,actor_id,event_type,details)
 values(v_r.id,p_booking_id,v_uid,'passenger_booking_cancelled',jsonb_build_object('refund_request_created',true,'refund_status','payment_check_required'));
 return jsonb_build_object('ok',true,'booking_status','cancelled','refund_request_created',true,'refund_status','payment_check_required','automatic_money_transfer',false);
end; $function$;

CREATE OR REPLACE FUNCTION public.fr_road_ride_driver_cancel(p_ride_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $function$
declare v_r public.fr_road_rides%rowtype; v_uid uuid:=auth.uid(); v_b record; v_n integer:=0;
begin
 if v_uid is null then raise exception 'Login required'; end if;
 select * into v_r from public.fr_road_rides where id=p_ride_id for update;
 if not found or v_uid<>v_r.driver_id then raise exception 'Ride not found or not your ride'; end if;
 if v_r.status not in ('live','booked') or v_r.departure_at<=now() then raise exception 'Cancellation not allowed'; end if;
 for v_b in select * from public.fr_road_ride_bookings where ride_id=p_ride_id and status in ('booking_pending','confirmed') for update loop
  update public.fr_road_ride_bookings set status='cancelled',updated_at=now() where id=v_b.id;
  insert into public.fr_ride_refund_requests(ride_type,ride_id,booking_id,customer_id,amount,status,reason)
  values('road',p_ride_id,v_b.id,v_b.passenger_id,coalesce(v_b.fare_snapshot,0),'payment_check_required','Driver cancelled ride; verify payment then refund if paid')
  on conflict(ride_type,booking_id) do nothing;
  v_n:=v_n+1;
 end loop;
 update public.fr_road_rides set status='cancelled',updated_at=now() where id=p_ride_id;
 insert into public.fr_road_ride_events(ride_id,actor_id,event_type,details)
 values(p_ride_id,v_uid,'driver_ride_cancelled',jsonb_build_object('cancelled_bookings',v_n,'refund_requests_created',v_n));
 return jsonb_build_object('ok',true,'ride_status','cancelled','cancelled_bookings',v_n,'refund_requests_created',v_n,'automatic_money_transfer',false);
end; $function$;

CREATE OR REPLACE FUNCTION public.fr_shared_ride_cancel_booking(p_booking_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $function$
declare v_b public.fr_shared_ride_bookings%rowtype; v_r public.fr_shared_rides%rowtype; v_p public.fr_shared_ride_payments%rowtype; v_ref_status text; v_new_status text; v_uid uuid:=auth.uid();
begin
 if v_uid is null then raise exception 'Login required'; end if;
 select * into v_b from public.fr_shared_ride_bookings where id=p_booking_id for update;
 if not found then raise exception 'Booking not found'; end if;
 select * into v_r from public.fr_shared_rides where id=v_b.ride_id for update;
 if v_uid<>v_b.passenger_id then raise exception 'Only booking passenger may cancel'; end if;
 if v_b.status not in ('booking_pending','confirmed','cancel_requested') or v_r.departure_at<=now() or v_r.status in ('departed','in_progress','completed','cancelled','expired') then raise exception 'Cancellation not allowed'; end if;
 select * into v_p from public.fr_shared_ride_payments where booking_id=p_booking_id for update;
 v_ref_status:=case when v_p.paid_at is not null and v_p.status not in ('refunded','cancelled') then 'refund_pending' else 'payment_check_required' end;
 update public.fr_shared_ride_bookings set status='cancelled',updated_at=now() where id=p_booking_id;
 update public.fr_shared_rides set booked_seats=greatest(0,booked_seats-v_b.seats_booked),status=case when status='full' then 'live' else status end,updated_at=now() where id=v_r.id;
 insert into public.fr_ride_refund_requests(ride_type,ride_id,booking_id,customer_id,amount,currency,payment_reference,status,reason)
 values('shared',v_r.id,p_booking_id,v_b.passenger_id,coalesce(v_p.amount,v_b.total_fare,0),coalesce(v_p.currency,'INR'),v_p.provider_transaction_id,v_ref_status,'Passenger cancellation; refund request auto-created')
 on conflict(ride_type,booking_id) do nothing;
 select status into v_new_status from public.fr_shared_rides where id=v_r.id;
 insert into public.fr_shared_ride_events(ride_id,booking_id,actor_id,event_type,details)
 values(v_r.id,p_booking_id,v_uid,'passenger_seats_cancelled',jsonb_build_object('seats',v_b.seats_booked,'refund_request_created',true,'refund_status',v_ref_status,'ride_status',v_new_status));
 return jsonb_build_object('ok',true,'booking_status','cancelled','seats_restored',v_b.seats_booked,'ride_status',v_new_status,'refund_request_created',true,'refund_status',v_ref_status,'automatic_money_transfer',false);
end; $function$;

CREATE OR REPLACE FUNCTION public.fr_shared_ride_driver_cancel(p_ride_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $function$
declare v_r public.fr_shared_rides%rowtype; v_uid uuid:=auth.uid(); v_b record; v_p public.fr_shared_ride_payments%rowtype; v_rs text; v_n integer:=0;
begin
 if v_uid is null then raise exception 'Login required'; end if;
 select * into v_r from public.fr_shared_rides where id=p_ride_id for update;
 if not found or v_uid<>v_r.driver_id then raise exception 'Ride not found or not your ride'; end if;
 if v_r.status not in ('live','full') or v_r.departure_at<=now() then raise exception 'Cancellation not allowed'; end if;
 for v_b in select * from public.fr_shared_ride_bookings where ride_id=p_ride_id and status in ('booking_pending','confirmed','cancel_requested') for update loop
  select * into v_p from public.fr_shared_ride_payments where booking_id=v_b.id for update;
  v_rs:=case when v_p.paid_at is not null and v_p.status not in ('refunded','cancelled') then 'refund_pending' else 'payment_check_required' end;
  update public.fr_shared_ride_bookings set status='cancelled',updated_at=now() where id=v_b.id;
  insert into public.fr_ride_refund_requests(ride_type,ride_id,booking_id,customer_id,amount,currency,payment_reference,status,reason)
  values('shared',p_ride_id,v_b.id,v_b.passenger_id,coalesce(v_p.amount,v_b.total_fare,0),coalesce(v_p.currency,'INR'),v_p.provider_transaction_id,v_rs,'Driver cancellation; refund request auto-created')
  on conflict(ride_type,booking_id) do nothing;
  v_n:=v_n+1;
 end loop;
 update public.fr_shared_rides set status='cancelled',booked_seats=0,updated_at=now() where id=p_ride_id;
 insert into public.fr_shared_ride_events(ride_id,actor_id,event_type,details)
 values(p_ride_id,v_uid,'driver_shared_ride_cancelled',jsonb_build_object('cancelled_bookings',v_n,'refund_requests_created',v_n));
 return jsonb_build_object('ok',true,'ride_status','cancelled','cancelled_bookings',v_n,'refund_requests_created',v_n,'automatic_money_transfer',false);
end; $function$;

-- Keep the live QA authorization grants intact; do not grant PUBLIC/anon execution.

-- Explicit RPC execution permissions.
revoke execute on function public.fr_road_ride_cancel_booking(uuid) from public, anon;
revoke execute on function public.fr_road_ride_driver_cancel(uuid) from public, anon;
revoke execute on function public.fr_shared_ride_cancel_booking(uuid) from public, anon;
revoke execute on function public.fr_shared_ride_driver_cancel(uuid) from public, anon;
grant execute on function public.fr_road_ride_cancel_booking(uuid) to authenticated, service_role;
grant execute on function public.fr_road_ride_driver_cancel(uuid) to authenticated, service_role;
grant execute on function public.fr_shared_ride_cancel_booking(uuid) to authenticated, service_role;
grant execute on function public.fr_shared_ride_driver_cancel(uuid) to authenticated, service_role;
