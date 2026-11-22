-- Project Arjuna QA-only hardening: SOS coordinate validation.
-- Adds DB-level checks so malformed or partial coordinates cannot be persisted.
-- This migration is not applied to production.
alter table public.fr_ride_sos
  add constraint qa_fr_ride_sos_latitude_range
  check (latitude is null or (latitude >= -90 and latitude <= 90));

alter table public.fr_ride_sos
  add constraint qa_fr_ride_sos_longitude_range
  check (longitude is null or (longitude >= -180 and longitude <= 180));

alter table public.fr_ride_sos
  add constraint qa_fr_ride_sos_coordinate_pair
  check ((latitude is null and longitude is null) or (latitude is not null and longitude is not null));
