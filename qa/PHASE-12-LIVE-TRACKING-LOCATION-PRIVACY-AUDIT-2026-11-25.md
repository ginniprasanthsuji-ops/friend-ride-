# Phase 12 — Live Tracking & Location Privacy Audit
**Audit date:** 2026-11-25
**Scope:** Read-only GitHub source/test search and QA schema inventory
**Environment:** QA project `pqsangtvietawkfgpgfu`; production untouched

## Findings
- Release-gate evidence states driver online/offline and GPS are LIVE TEST REQUIRED: approved driver online with updates; offline must stop location updates.
- Source/test search found test assertions for nearby drivers using customer-authorized RPC `fr_customer_list_nearby_drivers`, and driver offline updates existing GPS row rather than inserting an invalid null-location row.
- QA schema includes `driver_locations` with driver_id, latitude, longitude, is_online, updated_at.
- QA schema includes `ride_live_locations` with ride_id, user_id, latitude, longitude, updated_at.
- Prior ride completion static review noted `fr_driver_complete_ride` deletes ride live-location rows. Cleanup behavior has not been runtime verified.
- Source search confirms test/source markers but does not prove real GPS permission, movement, update cadence, participant isolation, stale-location behavior, or location cleanup on every termination path.

## Required staging/device test matrix
1. Approved driver goes online; coordinates and timestamp update.
2. Driver offline transition sets online false and stops subsequent GPS writes.
3. Denied GPS permission, approximate-only permission, and GPS disabled show safe UI fallback.
4. Invalid latitude/longitude rejected.
5. Customer sees only eligible nearby drivers through authorized RPC; cannot direct-query raw driver location.
6. Only customer and assigned driver can access ride live locations; unrelated customer/driver denied.
7. Stale location marked unavailable/not current; never present old coordinates as live.
8. Ride complete, cancel, driver disconnect and timeout: verify live-location cleanup/retention policy.
9. Reconnect and background/foreground: correct resume behavior and no duplicated subscriptions.
10. Test location retention, admin access, and deletion/privacy policy.

## Status
- Static audit: **COMPLETE**
- Runtime/device tests: **NOT RUN**
- SQL/schema/config changes: **0**
- Production changes: **0**
- Tracking release status: **PARTIAL / LIVE TEST REQUIRED**

## Next
Audit authentication/session persistence, role-switch isolation, logout cleanup, and account state transitions.
