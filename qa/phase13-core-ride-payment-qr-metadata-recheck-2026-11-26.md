# Phase 13 QA — Core Ride/Payment/QR Metadata Recheck (2026-11-26)

QA branch source and QA Supabase only. Static code/catalog review; no runtime payment/ride operations, writes, or migrations.

## Ride RPC presence and guards
Catalog definitions inspected:
- `fr_road_ride_create`: auth session required, route labels, nonnegative fare, future departure, pickup radius bound; no Driver role/approval guard evident.
- `fr_road_ride_book`: auth required, own-ride rejection, live/future/cutoff checks, one active passenger booking; no Customer role guard evident.
- `fr_road_ride_confirm_booking`: booking owner must be ride driver; pending-state and ride booked-state checks.
- `fr_road_ride_get_participant_contact`: requires confirmed-or-later participant status; driver branch returns one latest passenger contact (DESC/LIMIT 1), not all passengers.
- `fr_shared_ride_create`: auth and vehicle/seats/fare/future checks, but no Driver role/approval guard evident.
- `fr_shared_ride_book_seats`: auth, own-ride rejection, live/full/future/cutoff, seat availability and duplicate active booking checks; no Customer role guard evident.
- sampled ride RPCs: SECURITY DEFINER, empty search_path setting; anon EXECUTE denied, authenticated EXECUTE allowed (metadata).

## Frontend payment RPC/catalog mismatch
Frontend static RPC references sampled:
`fr_customer_create_ride_payment`, `fr_customer_submit_ride_transaction`, `fr_customer_tick_market_payment`, `fr_driver_confirm_ride_payment`, `fr_driver_save_payment_qr`, `fr_get_ride_payment_state`, `get_ride_payment_details_v1`, `fr_driver_confirm_parcel_payment`, `fr_partner_save_payment_details`, `fr_partner_confirm_market_payment`, `fr_tasko_submit_payment`, `fr_tasko_admin_verify_payment`.
A read-only QA public function catalog query returned no rows for these exact names. This is a confirmed name-level mismatch in this QA environment, not proof of production state or frontend runtime outcome.

## QR/payment storage
Prior same-day storage catalog recheck: QA only catalogued `road-ride-driver-photos`; frontend payment-QR buckets `provider-payment-qr` and `partner-qr` absent from QA catalog. QR upload/display runtime not verified.

## Not executed
No live booking/ride state transitions, payment or QR uploads, notifications, or participant contact isolation tests. Role-guard findings need runtime negative tests with test identities after backend parity is established.

## Frozen progress
Planning/Checklist 88% frozen; Overall Audit 12% frozen; graph frozen; Phase 13C 91% frozen.
