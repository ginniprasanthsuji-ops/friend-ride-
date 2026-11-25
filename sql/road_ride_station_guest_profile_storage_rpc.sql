-- ROAD RIDE STATION: private guest driver photo storage + ride profile RPC
-- Apply only in QA project pqsangtvietawkfgpgfu.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('road-ride-driver-photos','road-ride-driver-photos',false,3145728,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=false,file_size_limit=3145728,allowed_mime_types=array['image/jpeg','image/png','image/webp'];

drop policy if exists fr_road_driver_photo_upload_own on storage.objects;
create policy fr_road_driver_photo_upload_own on storage.objects for insert to authenticated
with check(bucket_id='road-ride-driver-photos' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists fr_road_driver_photo_read_own on storage.objects;
create policy fr_road_driver_photo_read_own on storage.objects for select to authenticated
using(bucket_id='road-ride-driver-photos' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists fr_road_driver_photo_update_own on storage.objects;
create policy fr_road_driver_photo_update_own on storage.objects for update to authenticated
using(bucket_id='road-ride-driver-photos' and (storage.foldername(name))[1]=auth.uid()::text)
with check(bucket_id='road-ride-driver-photos' and (storage.foldername(name))[1]=auth.uid()::text);

create or replace function public.fr_road_ride_save_driver_profile(
 p_ride_id uuid,p_driver_phone text,p_driver_photo_path text,p_bike_registration_number text,p_driver_display_name text
) returns boolean language plpgsql security definer set search_path=''
as $$
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if length(trim(coalesce(p_driver_phone,'')))<>10 or trim(coalesce(p_bike_registration_number,''))='' then
  raise exception 'Phone and bike registration are required';
 end if;
 if p_driver_photo_path is not null and (storage.foldername(p_driver_photo_path))[1]<>auth.uid()::text then
  raise exception 'Invalid private photo path';
 end if;
 update public.fr_road_rides set driver_phone=trim(p_driver_phone),driver_photo_path=p_driver_photo_path,
 bike_registration_number=upper(trim(p_bike_registration_number)),driver_display_name=trim(coalesce(p_driver_display_name,'')),
 phone_verified=false,updated_at=now()
 where id=p_ride_id and driver_id=auth.uid();
 if not found then raise exception 'Ride not found or not owned by user'; end if;
 return true;
end $$;
revoke all on function public.fr_road_ride_save_driver_profile(uuid,text,text,text,text) from public,anon;
grant execute on function public.fr_road_ride_save_driver_profile(uuid,text,text,text,text) to authenticated;
