-- Project Arjuna QA hardening: prevent privileged approval status during profile insert.
-- QA branch only; production apply requires separate review.
drop policy if exists qa_profiles_insert_own on public.profiles;
create policy qa_profiles_insert_own on public.profiles
for insert to authenticated
with check (
  id = auth.uid()
  and role in ('customer','driver','partner')
  and driver_approval_status = 'pending'
  and partner_approval_status = 'pending'
);
