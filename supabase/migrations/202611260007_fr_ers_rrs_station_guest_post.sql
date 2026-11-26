-- FRIEND RIDE ERS/RRS Station UI + guest RRS posting. QA branch only.
begin;
create table if not exists public.fr_station_rides (
 id uuid primary key default gen_random_uuid(),
 ride_kind text not null check (ride_kind in ('ERS','RRS')),
 driver_id uuid references auth.users(id) on delete set null,
 driver_name text not null,
 driver_phone text not null check (driver_phone ~ '^[0-9]{10}$'),
 vehicle_number text not null,
 from_label text not null,
 to_label text not null,
 fare numeric not null check (fare > 0),
 payment_method text not null default 'cash' check(payment_method='cash'),
 status text not null default 'live' check(status in ('live','booked','completed','cancelled')),
 created_at timestamptz not null default now()
);
alter table public.fr_station_rides enable row level security;
drop policy if exists fr_station_rides_public_live_read on public.fr_station_rides;
create policy fr_station_rides_public_live_read on public.fr_station_rides for select to anon,authenticated using(status='live' or driver_id=auth.uid());
grant select on public.fr_station_rides to anon,authenticated;
revoke insert,update,delete on public.fr_station_rides from anon,authenticated;
create or replace function public.fr_station_post_ers(p_from text,p_to text,p_fare numeric)
returns uuid language plpgsql security definer set search_path=public,auth
as $$
declare v_id uuid; v_name text; v_phone text; v_vehicle text;
begin
 if auth.uid() is null then raise exception 'Registered driver login required'; end if;
 select full_name,phone,vehicle_number into v_name,v_phone,v_vehicle from public.profiles where id=auth.uid() and role='driver' and lower(coalesce(driver_approval_status,'')) in ('approved','verified','active');
 if v_name is null or v_phone is null or v_vehicle is null then raise exception 'Approved registered driver profile with name, mobile and vehicle number required'; end if;
 if trim(coalesce(p_from,''))='' or trim(coalesce(p_to,''))='' or p_fare<=0 then raise exception 'From, To and positive fare required'; end if;
 insert into public.fr_station_rides(ride_kind,driver_id,driver_name,driver_phone,vehicle_number,from_label,to_label,fare)
 values('ERS',auth.uid(),v_name,v_phone,v_vehicle,trim(p_from),trim(p_to),p_fare) returning id into v_id;
 return v_id;
end $$;
create or replace function public.fr_station_post_rrs_guest(p_name text,p_phone text,p_vehicle text,p_from text,p_to text,p_fare numeric)
returns uuid language plpgsql security definer set search_path=public,auth
as $$
declare v_id uuid;
begin
 if trim(coalesce(p_name,''))='' or p_phone !~ '^[0-9]{10}$' or trim(coalesce(p_vehicle,''))='' or trim(coalesce(p_from,''))='' or trim(coalesce(p_to,''))='' or p_fare<=0 then raise exception 'Name, 10-digit mobile, vehicle number, From, To and positive fare are required'; end if;
 insert into public.fr_station_rides(ride_kind,driver_name,driver_phone,vehicle_number,from_label,to_label,fare)
 values('RRS',trim(p_name),p_phone,upper(trim(p_vehicle)),trim(p_from),trim(p_to),p_fare) returning id into v_id;
 return v_id;
end $$;
revoke all on function public.fr_station_post_ers(text,text,numeric) from public,anon;
revoke all on function public.fr_station_post_rrs_guest(text,text,text,text,text,numeric) from public;
grant execute on function public.fr_station_post_ers(text,text,numeric) to authenticated;
grant execute on function public.fr_station_post_rrs_guest(text,text,text,text,text,numeric) to anon,authenticated;
notify pgrst,'reload schema';
commit;
