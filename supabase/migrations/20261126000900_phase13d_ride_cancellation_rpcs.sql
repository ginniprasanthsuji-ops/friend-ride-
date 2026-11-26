-- Phase 13D QA ride cancellation RPCs; refund handling remains manual review only.
create or replace function public.fr_road_ride_cancel_booking(p_booking_id uuid) returns jsonb language plpgsql security definer set search_path to '' as $$
declare v_booking public.fr_road_ride_bookings%rowtype; v_ride public.fr_road_rides%rowtype; v_actor uuid:=auth.uid();
begin
 if v_actor is null then raise exception 'Login required'; end if;
 select * into v_booking from public.fr_road_ride_bookings where id=p_booking_id for update;
 if not found then raise exception 'Booking not found'; end if;
 select * into v_ride from public.fr_road_rides where id=v_booking.ride_id for update;
 if not found then raise exception 'Ride not found'; end if;
 if v_actor<>v_booking.passenger_id then raise exception 'Only booking passenger may cancel this booking'; end if;
 if v_booking.status not in ('booking_pending','confirmed') then raise exception 'Booking is no longer cancellable'; end if;
 if v_ride.departure_at<=now() or v_ride.status in ('departed','in_progress','completed','cancelled','expired') then raise exception 'Cancellation window closed'; end if;
 update public.fr_road_ride_bookings set status='cancelled',updated_at=now() where id=p_booking_id;
 update public.fr_road_rides set status='live',updated_at=now() where id=v_ride.id and status='booked';
 insert into public.fr_road_ride_events(ride_id,booking_id,actor_id,event_type,details) values(v_ride.id,p_booking_id,v_actor,'passenger_booking_cancelled',jsonb_build_object('previous_status',v_booking.status,'refund_review_required',true,'automatic_refund',false));
 return jsonb_build_object('ok',true,'booking_status','cancelled','ride_status','live','refund_review_required',true,'automatic_refund',false);
end; $$;
create or replace function public.fr_road_ride_driver_cancel(p_ride_id uuid) returns jsonb language plpgsql security definer set search_path to '' as $$
declare v_ride public.fr_road_rides%rowtype; v_cancelled integer; v_actor uuid:=auth.uid();
begin
 if v_actor is null then raise exception 'Login required'; end if;
 select * into v_ride from public.fr_road_rides where id=p_ride_id for update;
 if not found then raise exception 'Ride not found'; end if;
 if v_actor<>v_ride.driver_id then raise exception 'Only ride driver may cancel this ride'; end if;
 if v_ride.status not in ('live','booked') or v_ride.departure_at<=now() then raise exception 'Ride is no longer cancellable'; end if;
 update public.fr_road_ride_bookings set status='cancelled',updated_at=now() where ride_id=p_ride_id and status in ('booking_pending','confirmed');
 get diagnostics v_cancelled=row_count;
 update public.fr_road_rides set status='cancelled',updated_at=now() where id=p_ride_id;
 insert into public.fr_road_ride_events(ride_id,actor_id,event_type,details) values(p_ride_id,v_actor,'driver_ride_cancelled',jsonb_build_object('cancelled_bookings',v_cancelled,'refund_review_required',true,'automatic_refund',false));
 return jsonb_build_object('ok',true,'ride_status','cancelled','cancelled_bookings',v_cancelled,'refund_review_required',true,'automatic_refund',false);
end; $$;
create or replace function public.fr_shared_ride_cancel_booking(p_booking_id uuid) returns jsonb language plpgsql security definer set search_path to '' as $$
declare v_booking public.fr_shared_ride_bookings%rowtype; v_ride public.fr_shared_rides%rowtype; v_new_status text; v_actor uuid:=auth.uid();
begin
 if v_actor is null then raise exception 'Login required'; end if;
 select * into v_booking from public.fr_shared_ride_bookings where id=p_booking_id for update;
 if not found then raise exception 'Booking not found'; end if;
 select * into v_ride from public.fr_shared_rides where id=v_booking.ride_id for update;
 if not found then raise exception 'Ride not found'; end if;
 if v_actor<>v_booking.passenger_id then raise exception 'Only booking passenger may cancel this booking'; end if;
 if v_booking.status not in ('booking_pending','confirmed','cancel_requested') then raise exception 'Booking is no longer cancellable'; end if;
 if v_ride.departure_at<=now() or v_ride.status in ('departed','in_progress','completed','cancelled','expired') then raise exception 'Cancellation window closed'; end if;
 update public.fr_shared_ride_bookings set status='cancelled',updated_at=now() where id=p_booking_id;
 update public.fr_shared_rides set booked_seats=greatest(0,booked_seats-v_booking.seats_booked),status=case when status='full' then 'live' else status end,updated_at=now() where id=v_ride.id;
 select status into v_new_status from public.fr_shared_rides where id=v_ride.id;
 insert into public.fr_shared_ride_events(ride_id,booking_id,actor_id,event_type,details) values(v_ride.id,p_booking_id,v_actor,'passenger_seats_cancelled',jsonb_build_object('seats',v_booking.seats_booked,'previous_status',v_booking.status,'ride_status',v_new_status,'refund_review_required',true,'automatic_refund',false));
 return jsonb_build_object('ok',true,'booking_status','cancelled','seats_restored',v_booking.seats_booked,'ride_status',v_new_status,'refund_review_required',true,'automatic_refund',false);
end; $$;
create or replace function public.fr_shared_ride_driver_cancel(p_ride_id uuid) returns jsonb language plpgsql security definer set search_path to '' as $$
declare v_ride public.fr_shared_rides%rowtype; v_cancelled integer; v_actor uuid:=auth.uid();
begin
 if v_actor is null then raise exception 'Login required'; end if;
 select * into v_ride from public.fr_shared_rides where id=p_ride_id for update;
 if not found then raise exception 'Ride not found'; end if;
 if v_actor<>v_ride.driver_id then raise exception 'Only ride driver may cancel this ride'; end if;
 if v_ride.status not in ('live','full') or v_ride.departure_at<=now() then raise exception 'Ride is no longer cancellable'; end if;
 update public.fr_shared_ride_bookings set status='cancelled',updated_at=now() where ride_id=p_ride_id and status in ('booking_pending','confirmed','cancel_requested');
 get diagnostics v_cancelled=row_count;
 update public.fr_shared_rides set status='cancelled',booked_seats=0,updated_at=now() where id=p_ride_id;
 insert into public.fr_shared_ride_events(ride_id,actor_id,event_type,details) values(p_ride_id,v_actor,'driver_shared_ride_cancelled',jsonb_build_object('cancelled_bookings',v_cancelled,'previous_booked_seats',v_ride.booked_seats,'refund_review_required',true,'automatic_refund',false));
 return jsonb_build_object('ok',true,'ride_status','cancelled','cancelled_bookings',v_cancelled,'refund_review_required',true,'automatic_refund',false);
end; $$;
revoke all on function public.fr_road_ride_cancel_booking(uuid) from public,anon;
revoke all on function public.fr_road_ride_driver_cancel(uuid) from public,anon;
revoke all on function public.fr_shared_ride_cancel_booking(uuid) from public,anon;
revoke all on function public.fr_shared_ride_driver_cancel(uuid) from public,anon;
grant execute on function public.fr_road_ride_cancel_booking(uuid) to authenticated;
grant execute on function public.fr_road_ride_driver_cancel(uuid) to authenticated;
grant execute on function public.fr_shared_ride_cancel_booking(uuid) to authenticated;
grant execute on function public.fr_shared_ride_driver_cancel(uuid) to authenticated;