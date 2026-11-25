# Phase 13B — RLS Policy Field Mutation Review

Date: 2026-11-26. QA catalog-only audit.

## Policy findings
- Booking UPDATE policy allows either passenger or ride driver to UPDATE rows; WITH CHECK repeats only participant relationship. No status or immutable-field guard in policy expression.
- This means policy alone does not prevent participants from changing booking fields (e.g. ride_id, passenger_id, seats_booked, fare snapshot/total, status) if direct UPDATE privilege is granted/effective. Earlier audit found effective authenticated direct UPDATE on bookings not present at table level, but column-level grants/catalog interpretation must be reconciled before exploitation claims.
- Booking INSERT policy only checks passenger_id = auth.uid(); no role or booking state validation in policy. RPC handles business validation but direct insert must be blocked by effective privileges.
- Ride UPDATE policy checks driver_id = auth.uid() both USING and WITH CHECK, but does not guard approval/status/immutable fields. If effective UPDATE privilege permits, driver may directly mutate fields.
- Live ride SELECT policy includes live/full status, own driver, or passenger helper. Helper has no booking status filter, so participant access may persist for cancelled/refunded booking.
- Event read policy defines participant using any booking row and does not status-filter. This could expose event history to former participants if SELECT grants and policy permit.
- Payments SELECT policy ties access to booking participant/ride driver; it also uses booking existence without status filter. Payment rows are not publicly readable by policy.
- No anon-specific RLS policies found; however earlier catalog audit showed anon broad table/column grants, so privilege+RLS interaction remains a priority review item.

## Remediation draft direction (not applied)
1. Restrict direct UPDATE on booking/ride tables; route state changes through reviewed SECURITY DEFINER RPCs.
2. Add immutable-field/status transition validation in RPC (not just participant RLS).
3. Use status-filtered participant helpers for live/contact/event/payment visibility where intended.
4. Restrict event history to current/allowed participants; define privacy policy for former participants.
5. Confirm effective table and column privileges before changing grants.

No SQL applied; no rows inspected; no runtime testing. Phase 13B remains 70%.
