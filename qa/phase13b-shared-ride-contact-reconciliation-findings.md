# Phase 13B — Shared Ride vs Ordinary Ride Contact RPC Reconciliation

**Read-only source and live-QA audit. No SQL changes.**

## Source discovered
- GitHub source includes `sql/fix_ride_customer_driver_contact.sql` and `src/ride-contact.ts` / `assets/ride-contact.js`.
- SQL defines `get_ride_driver_details(uuid)`, `get_ride_customer_details(uuid)`, and `get_ride_customer_details_v2(uuid)`.
- These functions query the ordinary `public.rides` table using `customer_id` and `driver_id`, not `fr_shared_ride_*` tables. They therefore do **not** demonstrate Shared Ride contact access.
- Source functions are SECURITY DEFINER, empty search_path, authenticated EXECUTE, anon/public revoked.
- Frontend contact normalization helpers include phone aliases, names, photos, vehicle registration and confirmed-status helper. The helper status list includes accepted/confirmed/ongoing/in_progress/started; it is a UI helper, not server authorization.

## Live QA confirmation (read-only)
- QA catalog contains `get_ride_driver_details` and `get_ride_customer_details_v2`; `get_ride_customer_details` was not present in the returned catalog.
- Both deployed functions are SECURITY DEFINER, have fixed empty search_path, authenticated EXECUTE true, anon EXECUTE false.
- Live definitions restrict by the ordinary ride's customer or assigned driver and require profile role driver/customer; statuses include accepted/confirmed/ongoing/in_progress/started/completed. No Shared Ride table is referenced.
- QA function result signatures include contact/photo/vehicle fields; no runtime calls were made and no profile rows were queried.

## Conclusion
Ordinary Ride contact sharing source and QA deployment are partially reconciled. This does not close Shared Ride contact privacy. Shared Ride-specific contact RPC/source remains missing or not located. Progress remains 70% pending that specific discovery and authorization tests.

## Next
1. Search frontend for Shared Ride UI labels and direct profile/contact fetches.
2. Identify exact Shared Ride booking/driver mapping source and migrations.
3. Design booking-scoped contact RPC only for confirmed participants, with no public phone leakage.
4. Negative tests for anonymous, unrelated passenger, wrong driver, cancelled/refunded.
