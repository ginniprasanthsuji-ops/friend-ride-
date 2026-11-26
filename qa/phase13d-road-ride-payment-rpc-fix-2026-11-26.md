# Phase 13D — QA Road Ride Payment RPC Fix (2026-11-26)

## Change applied
Applied migration `phase13d_road_ride_payment_rpcs` to QA Supabase project `pqsangtvietawkfgpgfu` only. Main/production untouched.

## RPCs created and catalog verified
- `fr_get_ride_payment_state(uuid)`
- `fr_customer_create_ride_payment(uuid)`
- `fr_customer_submit_ride_transaction(uuid,text)`
- `fr_driver_confirm_ride_payment(uuid)`

All four catalog entries were verified after migration as SECURITY DEFINER with empty search_path. Catalog shows authenticated and service_role EXECUTE grants (postgres owner also present).

## Session table
Created `public.fr_ride_payment_sessions`, with unique ride_id, customer/driver ownership, amount, QR path, status, transaction ID, expiry, confirmation timestamp. RLS enabled; authenticated participant-only SELECT policy; table writes revoked from authenticated.

## Authorization / guards implemented
- Requires authenticated caller.
- State lookup requires ride participant (customer or assigned driver).
- QR session creation requires ride owner, ride completed, assigned driver, positive fare, and configured driver QR path.
- Transaction submission requires ride customer, active pending session, unexpired session, nonblank transaction ID up to 40 chars.
- Driver confirmation requires assigned driver and awaiting-driver-confirmation state.
- Payment confirmation is a manual driver confirmation of receipt; no gateway verification exists.

## Important remaining blocker
QA catalog query showed storage bucket `provider-payment-qr` is absent. RPC catalog is fixed, but QR signed-URL display cannot be validated until the private bucket and correct storage policies are configured. No runtime payment tests were executed. Functions should not be considered fully payment-safe until runtime cross-account and state-transition tests are passed.

## Git evidence
Migration file saved to QA branch:
`supabase/migrations/20261126000100_phase13d_road_ride_payment_rpcs.sql`
Commit: `952695c36c594ae64a7b3caf0bf8f5dd36eef5c3`
