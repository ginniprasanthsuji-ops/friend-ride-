-- FRIEND RIDE Phase 13E QA draft: strict ERS registered / RRS guest split + departure time
-- QA ONLY. Review schema, permissions, and RPC deployment before applying.
begin;

create table if not exists public.fr_phase13d_ers_rrs_bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  ride_kind text not null check (ride_kind in ('ERS','RRS')),
  pickup_text text not null,
  drop_text text not null,
  departing_time timestamp without time zone not null,
  fare_offer numeric(10,2) not null check (fare_offer > 0),
  driver_id uuid references auth.users(id),
  guest_driver_name text,
  guest_driver_phone text,
  guest_bike_details text,
  status text not null default 'pending' check (status in ('pending','assigned','cancelled','completed')),
  payment_method text not null default 'cash' check (payment_method = 'cash'),
  payment_status text not null default 'cash_pending' check (payment_status in ('cash_pending','cash_received')),
  cash_received_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((payment_status='cash_pending' and cash_received_at is null) or
         (payment_status='cash_received' and cash_received_at is not null))
);

-- Compatibility for the existing QA table if this draft is reapplied.
alter table public.fr_phase13d_ers_rrs_bookings add column if not exists departing_time timestamp without time zone;
alter table public.fr_phase13d_ers_rrs_bookings add column if not exists guest_driver_name text;
alter table public.fr_phase13d_ers_rrs_bookings add column if not exists guest_driver_phone text;
alter table public.fr_phase13d_ers_rrs_bookings add column if not exists guest_bike_details text;
alter table public.fr_phase13d_ers_rrs_bookings add column if not exists guest_driver_photo_path text;

-- Private RRS guest-driver photo storage; admin-only access.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('fr-rrs-guest-driver-photos','fr-rrs-guest-driver-photos',false,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=false,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp'];

 drop policy if exists fr_rrs_guest_photo_admin_select on storage.objects;
 drop policy if exists fr_rrs_guest_photo_admin_insert on storage.objects;
 drop policy if exists fr_rrs_guest_photo_admin_delete on storage.objects;
create policy fr_rrs_guest_photo_admin_select on storage.objects for select to authenticated using (bucket_id='fr-rrs-guest-driver-photos' and public.is_friend_ride_admin());
create policy fr_rrs_guest_photo_admin_insert on storage.objects for insert to authenticated with check (bucket_id='fr-rrs-guest-driver-photos' and public.is_friend_ride_admin());
create policy fr_rrs_guest_photo_admin_delete on storage.objects for delete to authenticated using (bucket_id='fr-rrs-guest-driver-photos' and public.is_friend_ride_admin());

alter table public.fr_phase13d_ers_rrs_bookings enable row level security;
revoke all on public.fr_phase13d_ers_rrs_bookings from anon, authenticated;

-- Remove the earlier four-argument RPC so bookings cannot bypass required departing time.
drop function if exists public.fr_phase13d_create_ers_rrs_booking(text,text,text,numeric);

create or replace function public.fr_phase13d_create_ers_rrs_booking(
  p_ride_kind text, p_pickup_text text, p_drop_text text, p_fare_offer numeric,
  p_departing_time timestamp without time zone
) returns uuid language plpgsql security definer set search_path=public,auth
as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_ride_kind not in ('ERS','RRS') then raise exception 'Invalid ride kind'; end if;
  if length(trim(coalesce(p_pickup_text,''))) < 3 or length(trim(coalesce(p_drop_text,''))) < 3 then
    raise exception 'Pickup and drop are required';
  end if;
  if p_departing_time is null or p_departing_time <= now() then raise exception 'Departing time must be in the future'; end if;
  if p_fare_offer is null or p_fare_offer <= 0 then raise exception 'Fare must be greater than zero'; end if;
  insert into public.fr_phase13d_ers_rrs_bookings(customer_id,ride_kind,pickup_text,drop_text,departing_time,fare_offer,payment_method,payment_status)
  values(auth.uid(),p_ride_kind,trim(p_pickup_text),trim(p_drop_text),p_departing_time,p_fare_offer,'cash','cash_pending')
  returning id into v_id;
  return v_id;
end $$;

-- ERS ONLY: requires registered FRIEND RIDE driver approval + all KYC.
create or replace function public.fr_phase13d_assign_ers_rrs_booking(p_booking_id uuid,p_driver_id uuid)
returns void language plpgsql security definer set search_path=public,auth
as $$
begin
  if auth.uid() is null or not public.is_friend_ride_admin() then raise exception 'Admin access required'; end if;
  if p_driver_id is null then raise exception 'Registered driver UUID required'; end if;
  if not exists (
    select 1 from public.profiles p where p.id=p_driver_id and p.role='driver'
      and lower(coalesce(p.driver_approval_status,'')) in ('approved','verified','active')
  ) then raise exception 'ERS requires an approved registered FRIEND RIDE driver'; end if;
  if exists (
    select 1 from (values ('driving_license'),('aadhaar'),('vehicle_rc')) required(document_type)
    where not exists (select 1 from public.fr_driver_documents d where d.driver_id=p_driver_id
      and d.document_type=required.document_type and lower(coalesce(d.verification_status,''))='verified')
  ) then raise exception 'ERS driver KYC documents must all be verified'; end if;
  update public.fr_phase13d_ers_rrs_bookings set driver_id=p_driver_id,status='assigned',updated_at=now()
    where id=p_booking_id and ride_kind='ERS' and status='pending' and driver_id is null;
  if not found then raise exception 'ERS booking unavailable, wrong ride type, or already assigned'; end if;
end $$;

-- RRS ONLY: admin records an unregistered/guest bike driver; no auth UUID/profile/KYC lookup.
create or replace function public.fr_phase13e_assign_rrs_guest_driver(
  p_booking_id uuid,p_guest_driver_name text,p_guest_driver_phone text,p_guest_bike_details text,p_guest_driver_photo_path text
) returns void language plpgsql security definer set search_path=public,auth
as $$
begin
  if auth.uid() is null or not public.is_friend_ride_admin() then raise exception 'Admin access required'; end if;
  if length(trim(coalesce(p_guest_driver_name,'')))<2 or length(trim(coalesce(p_guest_driver_phone,'')))<7
     or length(trim(coalesce(p_guest_bike_details,'')))<2 or length(trim(coalesce(p_guest_driver_photo_path,'')))<5 then raise exception 'Guest name, phone, bike details, and photo are required'; end if;
  if p_guest_driver_photo_path not like p_booking_id::text||'/%' then raise exception 'Photo path must be scoped to this RRS booking'; end if;
  if not exists (select 1 from storage.objects o where o.bucket_id='fr-rrs-guest-driver-photos' and o.name=p_guest_driver_photo_path) then raise exception 'Uploaded guest driver photo not found in private bucket'; end if;
  update public.fr_phase13d_ers_rrs_bookings
    set guest_driver_name=trim(p_guest_driver_name),guest_driver_phone=trim(p_guest_driver_phone),
        guest_bike_details=trim(p_guest_bike_details),guest_driver_photo_path=p_guest_driver_photo_path,status='assigned',updated_at=now()
    where id=p_booking_id and ride_kind='RRS' and status='pending' and driver_id is null
      and guest_driver_name is null;
  if not found then raise exception 'RRS booking unavailable, wrong ride type, or already assigned'; end if;
end $$;

-- Registered ERS driver only.
create or replace function public.fr_phase13d_driver_complete_ers_rrs_ride(p_booking_id uuid)
returns void language plpgsql security definer set search_path=public,auth
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  update public.fr_phase13d_ers_rrs_bookings set status='completed',updated_at=now()
    where id=p_booking_id and ride_kind='ERS' and driver_id=auth.uid() and status='assigned';
  if not found then raise exception 'Only the assigned registered ERS driver can complete this ride'; end if;
end $$;

create or replace function public.fr_phase13d_driver_confirm_cash(p_booking_id uuid)
returns void language plpgsql security definer set search_path=public,auth
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  update public.fr_phase13d_ers_rrs_bookings set payment_status='cash_received',cash_received_at=now(),updated_at=now()
    where id=p_booking_id and ride_kind='ERS' and driver_id=auth.uid() and status='completed'
      and payment_method='cash' and payment_status='cash_pending';
  if not found then raise exception 'Assigned ERS driver can confirm cash only after completion'; end if;
end $$;

-- RRS guest has no authenticated session; admin records completion and cash receipt.
create or replace function public.fr_phase13e_admin_complete_rrs_guest_cash(p_booking_id uuid)
returns void language plpgsql security definer set search_path=public,auth
as $$
begin
  if auth.uid() is null or not public.is_friend_ride_admin() then raise exception 'Admin access required'; end if;
  update public.fr_phase13d_ers_rrs_bookings set status='completed',payment_status='cash_received',
    cash_received_at=now(),updated_at=now()
    where id=p_booking_id and ride_kind='RRS' and driver_id is null
      and guest_driver_name is not null and status='assigned' and payment_method='cash' and payment_status='cash_pending';
  if not found then raise exception 'Only assigned RRS guest ride can be completed and cash confirmed by admin'; end if;
end $$;

create or replace function public.fr_phase13d_list_ers_rrs_bookings()
returns setof public.fr_phase13d_ers_rrs_bookings language sql security definer set search_path=public,auth
as $$ select * from public.fr_phase13d_ers_rrs_bookings
where auth.uid() is not null and public.is_friend_ride_admin() order by created_at desc limit 200 $$;

create or replace function public.fr_phase13d_cancel_ers_rrs_booking(p_booking_id uuid)
returns void language plpgsql security definer set search_path=public,auth
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  update public.fr_phase13d_ers_rrs_bookings set status='cancelled',updated_at=now()
    where id=p_booking_id and status='pending' and driver_id is null
      and (customer_id=auth.uid() or public.is_friend_ride_admin());
  if not found then raise exception 'Only booking customer/admin can cancel pending unassigned booking'; end if;
end $$;

create or replace function public.fr_phase13d_get_my_ers_rrs_bookings()
returns setof public.fr_phase13d_ers_rrs_bookings language sql security definer set search_path=public,auth
as $$ select * from public.fr_phase13d_ers_rrs_bookings
where auth.uid() is not null and (customer_id=auth.uid() or driver_id=auth.uid())
order by created_at desc limit 100 $$;

revoke all on function public.fr_phase13d_create_ers_rrs_booking(text,text,text,numeric,timestamp) from public,anon;
revoke all on function public.fr_phase13d_assign_ers_rrs_booking(uuid,uuid) from public,anon;
revoke all on function public.fr_phase13e_assign_rrs_guest_driver(uuid,text,text,text,text) from public,anon;
revoke all on function public.fr_phase13d_driver_complete_ers_rrs_ride(uuid) from public,anon;
revoke all on function public.fr_phase13d_driver_confirm_cash(uuid) from public,anon;
revoke all on function public.fr_phase13e_admin_complete_rrs_guest_cash(uuid) from public,anon;
revoke all on function public.fr_phase13d_list_ers_rrs_bookings() from public,anon;
revoke all on function public.fr_phase13d_get_my_ers_rrs_bookings() from public,anon;
revoke all on function public.fr_phase13d_cancel_ers_rrs_booking(uuid) from public,anon;
grant execute on function public.fr_phase13d_create_ers_rrs_booking(text,text,text,numeric,timestamp) to authenticated;
grant execute on function public.fr_phase13d_assign_ers_rrs_booking(uuid,uuid) to authenticated;
grant execute on function public.fr_phase13e_assign_rrs_guest_driver(uuid,text,text,text,text) to authenticated;
grant execute on function public.fr_phase13d_driver_complete_ers_rrs_ride(uuid) to authenticated;
grant execute on function public.fr_phase13d_driver_confirm_cash(uuid) to authenticated;
grant execute on function public.fr_phase13e_admin_complete_rrs_guest_cash(uuid) to authenticated;
grant execute on function public.fr_phase13d_list_ers_rrs_bookings() to authenticated;
grant execute on function public.fr_phase13d_get_my_ers_rrs_bookings() to authenticated;
grant execute on function public.fr_phase13d_cancel_ers_rrs_booking(uuid) to authenticated;

notify pgrst, 'reload schema';
commit;
