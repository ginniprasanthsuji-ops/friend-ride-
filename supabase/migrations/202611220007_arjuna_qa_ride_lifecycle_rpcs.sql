-- Project Arjuna QA-only ride lifecycle RPCs. Payment-provider behavior intentionally excluded.
create or replace function public.get_driver_requests()
returns setof public.rides language plpgsql security definer set search_path=''
as $
declare v_driver uuid:=auth.uid();
begin
 if v_driver is null or not exists(select 1 from public.profiles p where p.id=v_driver and p.role='driver' and p.driver_approval_status='approved') then raise exception 'Driver is not approved'; end if;
 return query select r.* from public.rides r
 where r.status='requested' and r.driver_id is null
 and r.pickup_lat is not null and r.pickup_lng is not null
 and exists(
  select 1 from public.driver_locations d
  where d.driver_id=v_driver and d.is_online=true and d.updated_at>=now()-interval '5 minutes'
  and 6371*2*asin(sqrt(least(1.0,
   power(sin(radians(d.latitude-r.pickup_lat)/2),2)+
   cos(radians(r.pickup_lat))*cos(radians(d.latitude))*power(sin(radians(d.longitude-r.pickup_lng)/2),2)
  ))))<=15
 )
 order by r.created_at desc;
end $;
create or replace function public.accept_ride(p_ride_id uuid)
returns boolean language plpgsql security definer set search_path=''
as $
declare v_driver uuid:=auth.uid(); v_updated int;
begin
 if v_driver is null or not exists(select 1 from public.profiles p where p.id=v_driver and p.role='driver' and p.driver_approval_status='approved') then raise exception 'Driver is not approved'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('arjuna_accept:'||v_driver::text,0));
 if exists(select 1 from public.rides r where r.driver_id=v_driver and lower(coalesce(r.status,'')) not in ('completed','complete','cancelled','canceled','rejected','declined','expired')) then raise exception 'Driver already has an active ride'; end if;
 update public.rides r set driver_id=v_driver,status='accepted',updated_at=now()
 where r.id=p_ride_id and r.driver_id is null and r.status='requested'
 and r.pickup_lat is not null and r.pickup_lng is not null
 and exists(select 1 from public.driver_locations d where d.driver_id=v_driver and d.is_online=true and d.updated_at>=now()-interval '5 minutes'
 and 6371*2*asin(sqrt(least(1.0,power(sin(radians(d.latitude-r.pickup_lat)/2),2)+cos(radians(r.pickup_lat))*cos(radians(d.latitude))*power(sin(radians(d.longitude-r.pickup_lng)/2),2)))))<=15);
 get diagnostics v_updated=row_count; return v_updated>0;
end $;
create or replace function public.counter_offer_ride(p_ride_id uuid,p_counter_fare numeric)
returns boolean language plpgsql security definer set search_path=''
as $
declare v_driver uuid:=auth.uid(); v_updated int;
begin
 if v_driver is null or not exists(select 1 from public.profiles p where p.id=v_driver and p.role='driver' and p.driver_approval_status='approved') then raise exception 'Driver is not approved'; end if;
 if p_counter_fare is null or p_counter_fare<=0 then raise exception 'Enter a valid counter offer'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('arjuna_accept:'||v_driver::text,0));
 if exists(select 1 from public.rides r where r.driver_id=v_driver and lower(coalesce(r.status,'')) not in ('completed','complete','cancelled','canceled','rejected','declined','expired')) then raise exception 'Driver has an active ride'; end if;
 update public.rides r set driver_id=v_driver,agreed_fare=p_counter_fare,status='counter_offered',updated_at=now()
 where r.id=p_ride_id and r.driver_id is null and r.status='requested'
 and r.pickup_lat is not null and r.pickup_lng is not null
 and exists(select 1 from public.driver_locations d where d.driver_id=v_driver and d.is_online=true and d.updated_at>=now()-interval '5 minutes'
 and 6371*2*asin(sqrt(least(1.0,power(sin(radians(d.latitude-r.pickup_lat)/2),2)+cos(radians(r.pickup_lat))*cos(radians(d.latitude))*power(sin(radians(d.longitude-r.pickup_lng)/2),2)))))<=15);
 get diagnostics v_updated=row_count; if v_updated=0 then raise exception 'Ride is no longer available or outside 15 KM'; end if; return true;
end $;
create or replace function public.accept_counter_offer(p_ride_id uuid)
returns boolean language plpgsql security definer set search_path=''
as $$
declare v_updated int;
begin
 if auth.uid() is null then raise exception 'Login required'; end if;
 update public.rides set status='accepted',updated_at=now() where id=p_ride_id and customer_id=auth.uid() and status='counter_offered' and driver_id is not null and agreed_fare is not null;
 get diagnostics v_updated=row_count; if v_updated=0 then raise exception 'Counter offer is no longer available'; end if; return true;
end $$;
create or replace function public.decline_counter_offer(p_ride_id uuid)
returns boolean language plpgsql security definer set search_path=''
as $$
declare v_updated int;
begin
 if auth.uid() is null then raise exception 'Login required'; end if;
 update public.rides set status='requested',driver_id=null,agreed_fare=null,updated_at=now() where id=p_ride_id and customer_id=auth.uid() and status='counter_offered' and driver_id is not null;
 get diagnostics v_updated=row_count; if v_updated=0 then raise exception 'Counter offer is no longer available'; end if; return true;
end $$;
create or replace function public.fr_customer_list_nearby_drivers(p_lat double precision,p_lng double precision,p_radius_km double precision default 15)
returns table(driver_id uuid,latitude double precision,longitude double precision,is_online boolean,updated_at timestamptz)
language plpgsql stable security definer set search_path=''
as $$
begin
 if auth.uid() is null then raise exception 'Login required'; end if;
 if not (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='customer') or exists(select 1 from public.admin_users a where a.user_id=auth.uid())) then raise exception 'Customer access required'; end if;
 if p_lat is null or p_lng is null or p_lat not between -90 and 90 or p_lng not between -180 and 180 or p_radius_km is null or p_radius_km<=0 or p_radius_km>15 then raise exception 'Invalid location or radius'; end if;
 return query select d.driver_id,d.latitude,d.longitude,d.is_online,d.updated_at from public.driver_locations d join public.profiles p on p.id=d.driver_id
 where d.is_online and d.updated_at>=now()-interval '5 minutes' and p.role='driver' and lower(coalesce(p.driver_approval_status,''))='approved'
 and 6371*2*asin(sqrt(least(1.0,power(sin(radians(d.latitude-p_lat)/2),2)+cos(radians(p_lat))*cos(radians(d.latitude))*power(sin(radians(d.longitude-p_lng)/2),2))))<=p_radius_km
 order by d.updated_at desc limit 100;
end $$;
create or replace function public.fr_driver_start_ride(p_ride_id uuid)
returns boolean language plpgsql security definer set search_path=''
as $$
declare v_updated int;
begin
 if auth.uid() is null or not exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='driver' and p.driver_approval_status='approved') then raise exception 'Approved driver login required'; end if;
 update public.rides set status='ongoing',updated_at=now() where id=p_ride_id and driver_id=auth.uid() and status='accepted';
 get diagnostics v_updated=row_count; if v_updated=0 then raise exception 'Only assigned driver can start an accepted ride'; end if;
 insert into public.fr_ride_notifications(user_id,ride_id,title,message) select customer_id,id,'Ride started','Your driver has started the ride.' from public.rides where id=p_ride_id; return true;
end $$;
create or replace function public.fr_driver_complete_ride(p_ride_id uuid)
returns boolean language plpgsql security definer set search_path=''
as $$
declare v_customer uuid; v_updated int;
begin
 if auth.uid() is null or not exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='driver' and p.driver_approval_status='approved') then raise exception 'Approved driver login required'; end if;
 update public.rides set status='completed',completed_at=now(),updated_at=now() where id=p_ride_id and driver_id=auth.uid() and status='ongoing' returning customer_id into v_customer;
 get diagnostics v_updated=row_count; if v_updated=0 then raise exception 'Only assigned driver can complete an ongoing ride'; end if;
 delete from public.ride_live_locations where ride_id=p_ride_id;
 insert into public.fr_ride_notifications(user_id,ride_id,title,message) values(v_customer,p_ride_id,'Ride completed','Ride completed. Payment-provider integration is deferred in this QA scope.'); return true;
end $$;
create or replace function public.get_ride_driver_details(p_ride_id uuid)
returns table(full_name text,phone text,vehicle_type text,vehicle_company text,vehicle_model text,vehicle_registration text,driver_profile_photo_path text)
language plpgsql security definer set search_path=''
as $$
begin
 if auth.uid() is null then raise exception 'Login required'; end if;
 return query select p.full_name,coalesce(nullif(trim(p.whatsapp_phone),''),nullif(trim(p.phone),'')),coalesce(p.vehicle_type,r.vehicle_type),p.vehicle_company,p.vehicle_model,coalesce(nullif(trim(p.vehicle_registration),''),nullif(trim(p.vehicle_number),'')),p.driver_profile_photo_path
 from public.rides r join public.profiles p on p.id=r.driver_id where r.id=p_ride_id and r.customer_id=auth.uid() and p.role='driver' and lower(r.status) in ('accepted','confirmed','ongoing','in_progress','started','completed') limit 1;
end $$;
create or replace function public.get_ride_customer_details_v2(p_ride_id uuid)
returns table(full_name text,phone text,customer_profile_photo_path text,customer_avatar_gender text)
language plpgsql security definer set search_path=''
as $$
begin
 if auth.uid() is null then raise exception 'Login required'; end if;
 return query select p.full_name,coalesce(nullif(trim(p.whatsapp_phone),''),nullif(trim(p.phone),'')),p.customer_profile_photo_path,p.customer_avatar_gender
 from public.rides r join public.profiles p on p.id=r.customer_id where r.id=p_ride_id and r.driver_id=auth.uid() and p.role='customer' and lower(r.status) in ('accepted','confirmed','ongoing','in_progress','started','completed') limit 1;
end $$;
revoke all on function public.get_driver_requests() from public,anon;
revoke all on function public.accept_ride(uuid) from public,anon;
revoke all on function public.counter_offer_ride(uuid,numeric) from public,anon;
revoke all on function public.accept_counter_offer(uuid) from public,anon;
revoke all on function public.decline_counter_offer(uuid) from public,anon;
revoke all on function public.fr_customer_list_nearby_drivers(double precision,double precision,double precision) from public,anon;
revoke all on function public.fr_driver_start_ride(uuid) from public,anon;
revoke all on function public.fr_driver_complete_ride(uuid) from public,anon;
revoke all on function public.get_ride_driver_details(uuid) from public,anon;
revoke all on function public.get_ride_customer_details_v2(uuid) from public,anon;
grant execute on function public.get_driver_requests() to authenticated;
grant execute on function public.accept_ride(uuid) to authenticated;
grant execute on function public.counter_offer_ride(uuid,numeric) to authenticated;
grant execute on function public.accept_counter_offer(uuid) to authenticated;
grant execute on function public.decline_counter_offer(uuid) to authenticated;
grant execute on function public.fr_customer_list_nearby_drivers(double precision,double precision,double precision) to authenticated;
grant execute on function public.fr_driver_start_ride(uuid) to authenticated;
grant execute on function public.fr_driver_complete_ride(uuid) to authenticated;
grant execute on function public.get_ride_driver_details(uuid) to authenticated;
grant execute on function public.get_ride_customer_details_v2(uuid) to authenticated;
