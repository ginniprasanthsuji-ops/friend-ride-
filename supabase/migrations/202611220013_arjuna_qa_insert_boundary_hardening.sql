-- Project Arjuna QA hardening: prevent client-supplied provider review/payment state.
-- QA branch only. Do not apply to production until reviewed and approved.
drop policy if exists qa_service_booking_customer_insert on public.fr_service_bookings;
create policy qa_service_booking_customer_insert on public.fr_service_bookings
for insert to authenticated
with check (
  customer_id = auth.uid()
  and status = 'pending'
  and payment_status = 'not_due'
  and assigned_provider_id is null
  and quoted_amount is null
  and actual_hours is null
  and final_amount is null
  and payment_reference is null
  and payment_submitted_at is null
  and payment_verified_at is null
  and payment_verified_by is null
  and laundry_unit_price is null
);

drop policy if exists qa_provider_application_insert_own on public.fr_service_provider_applications;
create policy qa_provider_application_insert_own on public.fr_service_provider_applications
for insert to authenticated
with check (
  provider_id = auth.uid()
  and status = 'pending'
  and admin_notes is null
  and reviewed_by is null
  and reviewed_at is null
);
