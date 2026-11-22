-- Project Arjuna QA: enforce valid pickup/drop coordinates and booking data at DB boundary.
-- QA branch only; validate live schema before any production rollout.
drop policy if exists "QA customers insert own rides" on public.rides;
create policy "QA customers insert own rides" on public.rides
for insert to authenticated
with check (
  (select auth.uid()) = customer_id
  and driver_id is null
  and status = 'requested'
  and agreed_fare is null
  and pickup_lat is not null and pickup_lat between -90 and 90
  and pickup_lng is not null and pickup_lng between -180 and 180
  and drop_lat is not null and drop_lat between -90 and 90
  and drop_lng is not null and drop_lng between -180 and 180
  and nullif(btrim(pickup), '') is not null
  and nullif(btrim(drop), '') is not null
  and fare_offer is not null and fare_offer > 0
);
