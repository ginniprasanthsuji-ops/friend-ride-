-- FRIEND RIDE Grocery Admin authorization (QA branch only)
-- Existing single Primary Admin is the sole row in public.admin_users.
-- No alternate Admin account or browser-supplied role is accepted.

alter table public.fr_grocery_applications
  drop constraint if exists fr_grocery_applications_application_status_check;

alter table public.fr_grocery_applications
  add constraint fr_grocery_applications_application_status_check
  check (application_status in ('pending','under_review','on_hold','approved','rejected','suspended'));

-- Admin can read the review queue through authenticated Supabase access.
-- All mutations and admin-link reads/writes remain server-only via Edge Function.
drop policy if exists "grocery primary admin read applications" on public.fr_grocery_applications;
create policy "grocery primary admin read applications"
on public.fr_grocery_applications
for select
to authenticated
using (public.is_friend_ride_admin());

-- No direct client policy for fr_grocery_admin_links, financial tables,
-- KYC/card records, webhook events, or ledger. The Edge Function uses
-- service_role only after verifying the caller's JWT and admin_users membership.
