# Phase 13 — Ride RPC & RLS Audit Findings (ERS)

QA project: `pqsangtvietawkfgpgfu`
Branch: `arjuna-x/phase-13-feature-audit`
Audit method: Read-only queries against QA schema/function definitions. No migrations executed.

## Existing RLS findings
- `rides` SELECT policy allows only the ride customer or assigned driver to read.
- `rides` INSERT policy allows authenticated users to insert rows where customer_id equals their auth UID. This policy does not itself enforce customer role or all request fields.
- `driver_locations` policy allows a driver to manage their own location; setting online=true is limited to approved driver profiles.
- `profiles` has own-read/own-update policies and a separate admin-read-driver policy.

## Existing RPC findings
- `accept_ride(p_ride_id)`: approved driver check; prevents driver accepting while they have a nonterminal active ride; conditional update from requested + unassigned. It does not filter ERS channel/source.
- `get_driver_requests()`: returns requested/unassigned rides to approved drivers; no ERS channel filter found in inspected definition.
- `fr_customer_list_nearby_drivers(lat,lng,radius)`: customer/admin only; returns online approved drivers with location updated within 5 minutes and within 15km maximum. It does not check whether a driver has an active ride and does not return profile vehicle/fare/ETA data.
- `fr_driver_start_ride` and `fr_driver_complete_ride`: assigned-driver ownership and status transitions are enforced; complete clears ride live-location records.
- Existing driver-details RPC reveals profile details to the assigned customer for eligible ride states.

## ERS implementation risk
The current nearby-driver RPC is not a sufficient ERS listing endpoint: it can include drivers who are busy, lacks vehicle type/driver display details, and doesn't provide an atomic booking/assignment reservation. Current generic ride acceptance/request APIs are not ERS-specific, so adding ERS directly without a channel marker could mix ERS and normal ride flows.

## Recommended design before implementation
1. Add an ERS channel discriminator on rides (or a separate ERS request table only if existing ride semantics prove incompatible).
2. Add minimal payment-method metadata (Cash/UPI) with server-side enum/constraint.
3. Implement a dedicated authenticated ERS vehicle-list RPC: approved drivers, online location freshness <= 5 min, no active nonterminal ride, selected category, privacy-minimized response, distance computed from pickup.
4. Add atomic ERS request/selection/driver acceptance: lock or conditional update to prevent simultaneous assignments; validate selected driver is still eligible and requested vehicle category matches profile.
5. Reuse current ride status lifecycle and notification workflow where compatible.
6. Apply and test QA-only SQL/RLS. Keep RRS guest profile/auth completely isolated.
7. Build browser tests and capture evidence before any production action.

## Status
Audit completed. Implementation remains pending; no runtime test passed/failed status is claimed.
