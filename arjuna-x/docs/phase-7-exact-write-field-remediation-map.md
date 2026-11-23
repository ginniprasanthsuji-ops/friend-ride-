# Phase 7 — Exact Write-Path Field Remediation Map

Reviewed source snippets from QA-branch `index.html` at current Phase 7 branch.

## Profiles
- Driver/partner registration: RPC `fr_register_driver_partner` is invoked, then direct `profiles.update(registrationPaths)` saves document path fields. Partner additionally calls `fr_partner_save_location`.
- Existing customer converted to driver/partner: direct `profiles.update(updateRow)` after deleting id and role fields; new profile path uses direct `profiles.insert({...row,...registrationPaths})`.
- Separate profile-photo save path performs direct update of one photo-path column.
- Remediation: preserve registration RPC; consider expanding validated RPC to save registration paths and metadata transactionally. For customer self-profile updates, allowlist non-sensitive fields; photo path writes should be storage-owner constrained. Never allow client writes to role, approvals, KYC verification status, admin flags, or business approval fields.

## Rides
- Customer booking directly inserts row with fields: customer identity (from client current user), service/ride type, pickup/drop text, fare_offer, notes, requested status, and optional pickup coordinates. Must ensure RLS binds customer_id to auth.uid(), status defaults/locks to requested, and fare/coordinates are bounded/validated.
- Remediation: either keep narrow create-only policy/column grants for this exact allowlist or replace with a create-ride RPC. Lifecycle updates/driver assignment/fare agreement must remain RPC-controlled.

## Driver locations
- Online GPS upsert writes driver_id, latitude, longitude, is_online=true, updated_at; conflict on driver_id.
- Offline path updates is_online=false and updated_at filtered by driver_id=currentUser.id.
- Remediation: ownership tied to auth.uid(); validate latitude/longitude ranges; prevent client-controlled driver_id spoofing; allow only location and online-state fields. Strong option: RPC derives UID and accepts coords; direct writes only if policy/column grants reviewed.

## Live ride locations
- Driver and customer tracking upsert ride_id, user_id, latitude, longitude, updated_at; conflict `(ride_id,user_id)`.
- Remediation: UID must match user_id; caller must be a ride participant and ride in active tracking lifecycle; limit writes to coords/timestamp; ensure no arbitrary ride/user injection.

## TASKO/Laundry service bookings
- Customer TASKO insert fields: customer_id, service_type=tasko, category, subcategory, preferred helper gender, service date/time, address, notes, status=pending. RLS must bind customer_id to auth.uid() and enforce pending/status ownership.
- Laundry insert fields: customer_id, service_type=laundry, category, subcategory, service date/time, pickup address, notes, status=pending, laundry unit and quantity. RLS must bind identity and validate quantity/date/unit/category.
- Admin TASKO assignment direct update: assigned_provider_id, quoted_amount, status=assigned, updated_at. UI role guard exists; database admin authorization and approved-provider/quote validation are required.
- Admin Laundry assignment direct update: assigned_provider_id, laundry_unit_price, quoted_amount, status=assigned, updated_at. UI guard alone is not security; require admin/approved provider checks server-side and quote arithmetic validation.
- Laundry/TASKO booking direct write paths should be moved to RPCs or narrowly protected by robust RLS and column privileges. Provider status transition paths require their own source review before grants.

## Admin provider application review
- Source includes direct UPDATE of `fr_service_provider_applications` status, reviewed_by, reviewed_at, updated_at from admin UI. Database must independently verify admin and allowed status transitions; do not rely on selectedRole/currentProfile frontend guards.

## Next audit steps
1. Finish remaining service provider/booking writes and any catalog/store/parcel/order direct writes.
2. Match each direct write to existing RLS policies, column grants and trigger protections.
3. Draft exact least-privilege grant SQL, including table-level revoke then allowlist (because column-level grants do not override broad table grants).
4. Prepare runtime test scenarios and QA approval gate.

## Safety
Static review only. No runtime tests or SQL execution. No production changes; no merge/deployment.