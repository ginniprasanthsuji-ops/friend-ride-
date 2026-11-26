-- Phase 13D QA: optimize payment-session participant RLS auth.uid evaluation
drop policy if exists fr_ride_payment_sessions_participant_read on public.fr_ride_payment_sessions;
create policy fr_ride_payment_sessions_participant_read on public.fr_ride_payment_sessions
for select to authenticated using (customer_id=(select auth.uid()) or driver_id=(select auth.uid()));
