-- FRIEND RIDE: secure two-way customer/driver contact for assigned rides
-- Only the customer or the assigned driver can retrieve the other party's contact.

create or replace function public.get_ride_driver_details(p_ride_id uuid)
returns table(full_name text, phone text, vehicle_company text, vehicle_model text, vehicle_registration text)
language plpgsql security definer set search_path = ''
as $function$
begin
  if auth.uid() is null then raise exception 'Login required'; end if;
  return query
  select p.full_name::text,
    coalesce(nullif(trim(p.whatsapp_phone),''),nullif(trim(p.phone),''),nullif(trim(u.phone),''))::text,
    p.vehicle_company::text,p.vehicle_model::text,
    coalesce(nullif(trim(p.vehicle_registration),''),nullif(trim(p.vehicle_number),''))::text
  from public.rides r
  join public.profiles p on p.id=r.driver_id
  left join auth.users u on u.id=r.driver_id
  where r.id=p_ride_id and r.customer_id=auth.uid() and r.driver_id is not null
    and lower(r.status) in ('accepted','confirmed','ongoing')
  limit 1;
end;
$function$;

create or replace function public.get_ride_customer_details(p_ride_id uuid)
returns table(full_name text, phone text)
language plpgsql security definer set search_path = ''
as $function$
begin
  if auth.uid() is null then raise exception 'Login required'; end if;
  return query
  select p.full_name::text,
    coalesce(nullif(trim(p.whatsapp_phone),''),nullif(trim(p.phone),''),nullif(trim(u.phone),''))::text
  from public.rides r
  join public.profiles p on p.id=r.customer_id
  left join auth.users u on u.id=r.customer_id
  where r.id=p_ride_id and r.driver_id=auth.uid()
    and lower(r.status) in ('accepted','confirmed','ongoing')
  limit 1;
end;
$function$;

create or replace function public.get_ride_customer_details_v2(p_ride_id uuid)
returns table(full_name text, phone text, customer_profile_photo_path text)
language plpgsql security definer set search_path = ''
as $function$
begin
  if auth.uid() is null then raise exception 'Login required'; end if;
  return query
  select p.full_name::text,
    coalesce(nullif(trim(p.whatsapp_phone),''),nullif(trim(p.phone),''),nullif(trim(u.phone),''))::text,
    p.customer_profile_photo_path::text
  from public.rides r
  join public.profiles p on p.id=r.customer_id
  left join auth.users u on u.id=r.customer_id
  where r.id=p_ride_id and r.driver_id=auth.uid()
    and lower(r.status) in ('accepted','confirmed','ongoing')
  limit 1;
end;
$function$;

revoke all on function public.get_ride_driver_details(uuid) from public, anon;
revoke all on function public.get_ride_customer_details(uuid) from public, anon;
revoke all on function public.get_ride_customer_details_v2(uuid) from public, anon;
grant execute on function public.get_ride_driver_details(uuid) to authenticated;
grant execute on function public.get_ride_customer_details(uuid) to authenticated;
grant execute on function public.get_ride_customer_details_v2(uuid) to authenticated;

select p.proname,
  has_function_privilege('authenticated',p.oid,'EXECUTE') as authenticated_can_execute,
  has_function_privilege('anon',p.oid,'EXECUTE') as anon_can_execute
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public'
and p.proname in ('get_ride_driver_details','get_ride_customer_details','get_ride_customer_details_v2')
order by p.proname;
