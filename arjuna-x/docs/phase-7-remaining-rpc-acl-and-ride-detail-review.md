# Phase 7 — Remaining RPC ACL & Ride Detail Review

## Public RPC ACL inventory
QA catalog shows 30 public functions (catalog count for this query): SECURITY DEFINER functions. EXECUTE grants generally authenticated-only, anon denied. Exceptions intentionally restricted:
- `fr_notification_claim_batch`: service_role only
- `fr_create_notification_preferences_for_new_user`: service_role only
- `qa_guard_profile_privileged_fields`: service_role only (trigger function)
- `fr_public_homepage_feedback`: anon + authenticated + service_role

## Driver request listing
`get_driver_requests()` requires authenticated approved driver and returns only rides status requested and driver_id NULL. It returns full `rides` row (SETOF rides), including customer UUID, pickup/drop text and exact coordinates, fare offer, notes, and timestamps. This is dispatch data and may be necessary for quoting/acceptance; minimize fields, validate notes don't contain sensitive data, and consider whether driver discovery should reveal full drop location before ride acceptance. Product decision and runtime privacy tests needed.

## Ride customer details
`get_ride_customer_details_v2(ride_id)` returns customer name, phone/WhatsApp, profile photo path and avatar gender only when caller is assigned driver and ride status accepted/confirmed/ongoing/in_progress/started/completed. Good owner/state gate. Check completed ride retention policy and photo access path.

## Ride driver details
`get_ride_driver_details(ride_id)` returns driver name/contact/vehicle/profile photo only when caller is ride customer and ride is assigned, and status accepted/confirmed/ongoing/in_progress/started/completed. Good owner/state gate. Verify signed/private photo delivery and post-completion access lifecycle.

## ACL inventory notes
- All reviewed SECURITY DEFINER functions have explicit empty search_path except preference trigger uses public; objects are schema-qualified in source.
- All anon EXECUTE false except homepage feedback.
- Authenticated EXECUTE true for workflow/admin/listing RPCs, but admin RPCs validate membership inside body; role workflows validate owner/profile role/approval and states.
- Service-only notification queue and trigger functions are correctly restricted at catalog level.

## Tests required
- Non-approved driver denied request list; approved driver gets only unassigned requested rides.
- Driver pre-accept visibility: exact drop/notes exposure policy.
- Customer and assigned driver only may fetch respective detail RPC; unassigned/other user/anonymous denied; status gates and completed access policy verified.
- Admin functions: non-admin denied even though authenticated EXECUTE is granted.
- Confirm private image/document storage paths are not directly accessible and signed URLs expire.

Static catalog/body review only; no RPC invocation, no SQL or data changes, no production deployment.