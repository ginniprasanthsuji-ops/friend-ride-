# Phase 13D QA — Road Ride driver profile/photo enforcement review (2026-11-26)

## Scope
Read-only review of QA Supabase project `pqsangtvietawkfgpgfu` function definitions and ACL for `fr_road_ride_save_driver_profile`, `fr_road_ride_save_guest_driver_profile`, and related road-ride booking/profile RPCs. No SQL writes, migrations, storage uploads, production access, or runtime impersonation tests.

## Findings
- `fr_road_ride_save_driver_profile(p_ride_id, p_driver_phone, p_driver_photo_path, p_bike_registration_number, p_driver_display_name)`: authenticated; SECURITY DEFINER; empty search_path; EXECUTE granted to authenticated and service_role. Requires a 10-character phone string and bike registration number; verifies ride ownership in the UPDATE predicate; validates photo path ownership only when a photo path is supplied. **Driver photo is optional for this RPC**, while the guest-driver profile RPC requires a photo path.
- `fr_road_ride_save_guest_driver_profile`: non-SECURITY DEFINER; authenticated session required; requires 10-digit phone, display name, bike registration, and non-null UID-owned photo path; upserts the guest profile.
- Registered profile RPC sets `phone_verified=false` when profile details are saved. This static definition alone does not establish the OTP verification flow or whether app UI prevents ride publishing/starting until verified.
- `fr_road_ride_book`: requires authenticated caller, blocks self-booking, requires ride live and departure/cutoff not passed, and rejects an existing active booking; static definition allows booking creation and sets ride booked. Role/approval checks are not visible in this function definition; broader workflow/runtime policy is not proven.

## Risk / follow-up
1. Registered and guest driver photo enforcement differs: guest profile requires a photo, registered profile accepts null. Confirm product requirement and whether driver-photo-required is enforced elsewhere (frontend, storage policy, publish/start guards).
2. Confirm phone verification state is enforced before driver can publish/operate the ride; the profile-save RPC explicitly resets `phone_verified` to false.
3. Test authenticated role behavior, photo storage access, OTP verification, and ride publish/start guards in QA with test accounts before treating the workflow as runtime-verified.

## Evidence limits
Static function-source and ACL snapshot only. No runtime tests, no test accounts/role impersonation, no SMS/OTP or device tests. This report is evidence for QA branch only; production/Main untouched.
