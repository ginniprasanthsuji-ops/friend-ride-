-- Project Arjuna QA ride creation boundary: customer-created rides start unassigned/requested.
-- QA branch only; production apply requires reviewed migration rollout.
drop policy if exists "QA customers insert own rides" on public.rides;
create policy "QA customers insert own rides" on public.rides
for insert to authenticated
with check (
  (select auth.uid()) = customer_id
  and driver_id is null
  and status = 'requested'
  and agreed_fare is null
);
