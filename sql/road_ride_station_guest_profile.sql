-- ROAD RIDE STATION guest driver profile fields (additive)
alter table public.fr_road_rides
  add column if not exists driver_phone text,
  add column if not exists driver_photo_path text,
  add column if not exists bike_registration_number text,
  add column if not exists driver_display_name text,
  add column if not exists phone_verified boolean not null default false;

-- Normalize/validate basic bike registration format only; actual regional formats vary.
alter table public.fr_road_rides
  add constraint fr_road_rides_bike_registration_nonempty
  check (bike_registration_number is null or length(trim(bike_registration_number)) between 4 and 20);

-- Guest driver data is visible on LIVE ride cards only as needed; phone/photo details
-- should be shown to confirmed booking participants by frontend/backend participant rules.
