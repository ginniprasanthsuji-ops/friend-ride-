# Phase 13 — RRS RPC and RLS Read-only Audit

Branch: `arjuna-x/phase-13-feature-audit`
QA Supabase project: `pqsangtvietawkfgpgfu`
Audit date: 2026-11-25
Method: read-only function and policy definition inspection. No changes applied.

## RPCs found
### `fr_road_ride_create(...)`
- SECURITY DEFINER, empty search_path.
- Requires authenticated session; validates route labels, nonnegative fare, future departure, pickup radius 0–25km.
- Inserts a guest/RRS ride and event record.
- **Audit gap:** function itself does not visibly enforce a guest-only identity or verify a guest profile exists; determine intended guest identity/auth restrictions before integration.

### `fr_road_ride_book(p_ride_id,p_pickup_label,p_drop_label)`
- SECURITY DEFINER, empty search_path.
- Requires auth session, locks selected ride row, blocks own ride, requires status live, future departure, booking cutoff not passed.
- Prevents a non-cancelled/non-refunded existing booking; one-passenger rule.
- Creates booking_pending booking, sets ride booked, logs event.
- **Important lifecycle note:** this function changes the listing status from live to booked immediately, while booking is pending. UI mapping must display pending/confirmation semantics correctly and not assume booked means confirmed.

### Guest profile save RPC
`fr_road_ride_save_guest_driver_profile(...)`
- Requires authenticated session (RRS guest session).
- Validates 10-digit phone, name and bike registration.
- Requires photo path under caller's private user folder.
- Upserts guest profile.

### Registered profile save RPC
`fr_road_ride_save_driver_profile(...)`
- Requires authenticated caller and ride ownership.
- Validates phone and bike registration.
- Private photo path must be in caller folder.
- Marks phone_verified false.
- Appears intended for authenticated RRS ride owner profile fields; verify the front-end calls it.

## RLS policy findings
- `fr_road_ride_bookings`: SELECT participant policy allows passenger or ride driver.
- `fr_road_ride_events`: SELECT participant policy allows ride driver or booking passenger.
- `fr_road_ride_guest_profiles`: insert/select/update own rows only.
- `fr_road_rides`: SELECT policy permits live listings and own-driver rows; the passenger-booking branch contains a likely defect:
  `EXISTS (SELECT 1 FROM fr_road_ride_bookings b WHERE b.ride_id = b.id AND b.passenger_id = auth.uid())`
  The comparison `b.ride_id=b.id` compares booking ride_id to booking row id, rather than correlating to the outer ride (`r.id`). This likely fails to grant passengers read access to their booked ride after it is no longer live. Must validate with a safe test case or correct policy in a separate QA migration after review.

## RPC privileges
The four inspected RRS RPCs have EXECUTE grants to authenticated, postgres, and service_role. No anon grant was found in the inspected privileges. Since RRS guest driver access uses Supabase Anonymous Auth, its role is generally authenticated; confirm guest-only behavior in test flows.

## Risks / gaps before combined Live Station
1. No verified read/list RPC was found in the inspected RRS function set; UI listing behavior likely uses direct table reads or another endpoint—inspect frontend wiring next.
2. RRS booking pending vs ride booked status needs explicit source-aware UI mapping.
3. RLS likely has a passenger visibility correlation defect as noted above.
4. Guest/anonymous Auth users are in the authenticated role; enforce RRS guest separation from ERS server-side, not just UI.
5. Public live listing should use a safe projection and not expose phone, photo storage path, exact coordinates, or contact data without appropriate access.
6. No runtime test or policy correction was performed.

## Recommended next steps (QA only)
- Inspect front-end RRS wiring and identify the actual list/book/profile RPC calls.
- Reproduce passenger read access in QA with controlled test users.
- Draft narrowly scoped RLS correction for review; do not apply until the correlation and intended visibility are verified.
- Build combined station from safe source-specific listings, preserving each source lifecycle.
- Keep Production/Main untouched.

## Status
Read-only audit completed; integration and tests remain pending.
