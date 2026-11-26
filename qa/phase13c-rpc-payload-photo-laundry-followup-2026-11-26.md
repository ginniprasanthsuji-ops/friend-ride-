# Phase 13C QA — Frontend RPC Payload Parity, Registration Photo, Laundry Guard Follow-up (2026-11-26)

Read-only QA branch frontend and QA Supabase review. No DB changes, no production access.

## RPC payload parity (selected calls)
Frontend call payload keys match inspected SQL signatures for these sampled functions:
- `fr_register_driver_partner`: p_role, p_profile
- `fr_customer_create_service_request`: p_category_slug, p_provider_id, p_service_address, p_work_details, p_preferred_date, p_preferred_time
- `fr_customer_list_approved_service_providers`: p_category_slug
- `fr_laundry_provider_transition`: p_booking_id, p_action
- `fr_driver_start_ride` / `fr_driver_complete_ride`: p_ride_id
- `get_ride_customer_details_v2` / `get_ride_driver_details`: p_ride_id
This is a selected static parity sample, not a complete 25-RPC audit and not runtime testing.

## Registration profile-photo requirement
Frontend registration UI marks Driver Photo and Partner Passport-size Photo required. Upload references:
- driver profile photo: bucket `driver-profile-photos`, auth UID folder, profile path key `driver_profile_photo_path`
- partner profile photo: bucket `partner-profile-photos`, auth UID folder, profile path key `partner_profile_photo_path`
Driver KYC upload includes driving licence, Aadhaar, vehicle RC; QR optional.
Registration RPC definition previously inspected does not independently enforce a photo path requirement. Frontend required-field validation and upload handling exist, but server-side enforcement remains a hardening question. QA storage bucket mapping mismatch remains a separate unresolved issue; upload runtime is not verified.

## Laundry provider role enforcement / RLS
QA `fr_service_bookings` RLS:
- Customer INSERT limited to own customer_id, pending status, payment_status not_due.
- SELECT limited to customer, assigned provider, or admin.
- UPDATE policy is admin-only.
Laundry transition RPC definition checks authenticated user, action allowlist, service_type='laundry', assigned_provider_id=auth.uid(), row lock, and strict status sequence.
It does not explicitly check that caller has provider role or a corresponding approved provider profile/category. Assignment ownership is enforced, but role/category validation is not evident. This is a hardening review question; no exploit/runtime test performed.

## Frozen estimates
Phase 13C 91%; Planning/Checklist 88% frozen; Overall Audit 12% frozen; progress graph frozen.
