-- FRIEND RIDE Phase 13D QA: assigned driver identity/contact/vehicle details.
-- Details are visible only to the customer/assigned driver on that booking, or authorized admin.
begin;

create or replace function public.fr_phase13d_get_my_ers_rrs_bookings_with_driver()
returns table(
 id uuid,customer_id uuid,ride_kind text,pickup_text text,drop_text text,fare_offer numeric,
 driver_id uuid,status text,payment_method text,payment_status text,cash_received_at timestamptz,
 created_at timestamptz,updated_at timestamptz,
 driver_personal_name text,driver_personal_number text,driver_vehicle_number text
)
language sql security definer set search_path=public,auth
as $$
 select b.id,b.customer_id,b.ride_kind,b.pickup_text,b.drop_text,b.fare_offer,b.driver_id,b.status,
        b.payment_method,b.payment_status,b.cash_received_at,b.created_at,b.updated_at,
        p.full_name,p.phone,p.vehicle_number
 from public.fr_phase13d_ers_rrs_bookings b
 left join public.profiles p on p.id=b.driver_id
 where auth.uid() is not null and (b.customer_id=auth.uid() or b.driver_id=auth.uid())
 order by b.created_at desc limit 100
$$;

create or replace function public.fr_phase13d_list_ers_rrs_bookings_with_driver()
returns table(
 id uuid,customer_id uuid,ride_kind text,pickup_text text,drop_text text,fare_offer numeric,
 driver_id uuid,status text,payment_method text,payment_status text,cash_received_at timestamptz,
 created_at timestamptz,updated_at timestamptz,
 driver_personal_name text,driver_personal_number text,driver_vehicle_number text
)
language sql security definer set search_path=public,auth
as $$
 select b.id,b.customer_id,b.ride_kind,b.pickup_text,b.drop_text,b.fare_offer,b.driver_id,b.status,
        b.payment_method,b.payment_status,b.cash_received_at,b.created_at,b.updated_at,
        p.full_name,p.phone,coalesce(p.vehicle_number,p.vehicle_registration)
 from public.fr_phase13d_ers_rrs_bookings b
 left join public.profiles p on p.id=b.driver_id
 where auth.uid() is not null and public.is_friend_ride_admin()
 order by b.created_at desc limit 200
$$;

revoke all on function public.fr_phase13d_get_my_ers_rrs_bookings_with_driver() from public,anon;
revoke all on function public.fr_phase13d_list_ers_rrs_bookings_with_driver() from public,anon;
grant execute on function public.fr_phase13d_get_my_ers_rrs_bookings_with_driver() to authenticated;
grant execute on function public.fr_phase13d_list_ers_rrs_bookings_with_driver() to authenticated;
notify pgrst, 'reload schema';
commit;
