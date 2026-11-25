# Phase 11 — Ride Location, GPS, Contact & Retention Privacy Review (2026-11-25)

QA project: `pqsangtvietawkfgpgfu` (`pqsangtvietawkfgpgfu`)
Method: Read-only catalog/policy/function review. No mutation or runtime tests.

## Tables and sensitive fields
- `driver_locations`: driver_id, latitude/longitude, is_online, updated_at.
- `ride_live_locations`: ride_id, user_id, latitude/longitude, updated_at.
- `rides`: customer/driver IDs, pickup/drop text and coordinates, notes, fares, statuses, timestamps.
- `fr_ride_sos`: ride_id, sender_id, coordinates, message, timestamp.

## RLS policy snapshot
- `driver_locations`: authenticated ALL policy driver_id=auth.uid(); WITH CHECK requires own driver_id and, when online, approved driver profile.
- `ride_live_locations`: INSERT/UPDATE user_id=auth.uid() and ride participant; SELECT only if current user is ride customer or driver.
- `rides`: SELECT only customer_id or driver_id matches auth.uid(); INSERT own customer ride.
- `fr_ride_sos`: INSERT and SELECT own sender_id; admin SELECT through admin_users.

These are static policy predicates. Runtime cross-user tests and ride-state expiration tests have not been performed.

## High-priority privilege finding
Authenticated has broad table-level privileges including TRUNCATE on `driver_locations`, `ride_live_locations`, `rides`, and `fr_ride_sos`. TRUNCATE bypasses RLS. Broad UPDATE/DELETE/INSERT also deserve least-privilege review. No privileges changed.

## Live-location state boundary
`ride_live_locations` policies check that the user is a participant of the referenced ride, but the reviewed predicates do not restrict access to active ride statuses (e.g., accepted/ongoing) nor enforce an expiry timestamp. Potential residual access to location rows after completion/cancellation is a risk to test and remediate. Location rows include timestamps but no catalog-observed retention/expiry mechanism in this review.

## Driver discovery data
`get_driver_requests()`:
- SECURITY DEFINER, empty search_path
- anon EXECUTE denied; authenticated EXECUTE allowed
- requires authenticated approved driver
- returns full `rides` rows for requested unassigned rides
- Potential data minimization concern: full row contains customer IDs, pickup/drop text and coordinates, notes, and fare data. Confirm what fields a driver needs before acceptance and consider a restricted discovery projection.

## Customer/driver contact detail RPCs
`get_ride_customer_details_v2(p_ride_id)` and `get_ride_driver_details(p_ride_id)`:
- SECURITY DEFINER, empty search_path; anon EXECUTE denied, authenticated EXECUTE allowed
- ownership/assignment checks are present: assigned driver for customer details; ride customer for driver details.
- Status allow-list includes accepted/confirmed/ongoing/in_progress/started/completed.
- Returned contact/vehicle/profile fields include phone and other personal data.
- Completed rides remain eligible for details lookup. Consider a limited post-completion contact retention window and restrict sensitive contact after completion unless operationally required.

## SOS
Own-user SOS insert/read policy and admin read policy are present. Review how coordinates/message are retained, who is notified, delivery/audit records, and emergency escalation reliability. No SOS runtime flow tested.

## Retention & privacy closure items
- [ ] Define active ride status window for live GPS access.
- [ ] Deny live location reads/writes after completion/cancellation, except explicit emergency/admin workflow.
- [ ] Delete or anonymize stale live-location rows with reviewed retention duration.
- [ ] Limit driver request listing to fields needed for decision/acceptance.
- [ ] Limit post-completion phone/contact access window.
- [ ] Ensure location sharing consent and app-level permission prompts.
- [ ] Review SOS coordinate/message retention and access logging.
- [ ] Remove authenticated TRUNCATE and unnecessary table-level privileges on ride/location/SOS tables.
- [ ] Runtime tests: unrelated user, non-assigned driver, completed ride, cancelled ride, stale location, customer/driver correct participant.
- [ ] Test role/dashboard regression after any approved changes.

## Status
Catalog/policy/source checks: performed.
Runtime tests: not run.
SQL changes: none.
Production: untouched.
