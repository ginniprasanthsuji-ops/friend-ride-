-- Project Arjuna QA: restrict ride-linked SOS submissions to ride participants.
-- QA branch only; do not merge or deploy without live schema validation.
drop policy if exists qa_sos_insert_own on public.fr_ride_sos;
create policy qa_sos_insert_own on public.fr_ride_sos
for insert to authenticated
with check (
  sender_id = auth.uid()
  and (ride_id is null or exists (
    select 1 from public.rides r
    where r.id = ride_id
      and (r.customer_id = auth.uid() or r.driver_id = auth.uid())
  ))
  and (latitude is null or latitude between -90 and 90)
  and (longitude is null or longitude between -180 and 180)
  and (message is null or length(message) <= 1000)
);
