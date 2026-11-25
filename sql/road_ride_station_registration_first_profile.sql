-- ROAD RIDE STATION: registration-first guest driver profiles (OTP not required)
create table if not exists public.fr_road_ride_guest_profiles (
 driver_id uuid primary key references auth.users(id) on delete cascade,
 driver_phone text not null check(driver_phone ~ '^[0-9]{10}$'),
 driver_photo_path text not null,
 bike_registration_number text not null,
 driver_display_name text not null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.fr_road_ride_guest_profiles enable row level security;
drop policy if exists rr_guest_profile_select_own on public.fr_road_ride_guest_profiles;
create policy rr_guest_profile_select_own on public.fr_road_ride_guest_profiles for select to authenticated using (driver_id=(select auth.uid()));
drop policy if exists rr_guest_profile_insert_own on public.fr_road_ride_guest_profiles;
create policy rr_guest_profile_insert_own on public.fr_road_ride_guest_profiles for insert to authenticated with check (driver_id=(select auth.uid()));
drop policy if exists rr_guest_profile_update_own on public.fr_road_ride_guest_profiles;
create policy rr_guest_profile_update_own on public.fr_road_ride_guest_profiles for update to authenticated using (driver_id=(select auth.uid())) with check (driver_id=(select auth.uid()));
grant select,insert,update on public.fr_road_ride_guest_profiles to authenticated;

create or replace function public.fr_road_ride_save_guest_driver_profile(
 p_driver_phone text,p_driver_photo_path text,p_bike_registration_number text,p_driver_display_name text
) returns boolean language plpgsql security invoker set search_path=''
as $$
declare v_uid uuid:=auth.uid();
begin
 if v_uid is null then raise exception 'Guest session required'; end if;
 if p_driver_phone !~ '^[0-9]{10}$' then raise exception 'Enter a valid 10 digit phone number'; end if;
 if trim(coalesce(p_driver_display_name,''))='' or trim(coalesce(p_bike_registration_number,''))='' then raise exception 'Name and bike registration are required'; end if;
 if p_driver_photo_path is null or (storage.foldername(p_driver_photo_path))[1]<>v_uid::text then raise exception 'Invalid private photo path'; end if;
 insert into public.fr_road_ride_guest_profiles(driver_id,driver_phone,driver_photo_path,bike_registration_number,driver_display_name)
 values(v_uid,trim(p_driver_phone),p_driver_photo_path,upper(trim(p_bike_registration_number)),trim(p_driver_display_name))
 on conflict(driver_id) do update set driver_phone=excluded.driver_phone,driver_photo_path=excluded.driver_photo_path,
 bike_registration_number=excluded.bike_registration_number,driver_display_name=excluded.driver_display_name,updated_at=now();
 return true;
end $$;
revoke all on function public.fr_road_ride_save_guest_driver_profile(text,text,text,text) from public,anon;
grant execute on function public.fr_road_ride_save_guest_driver_profile(text,text,text,text) to authenticated;
