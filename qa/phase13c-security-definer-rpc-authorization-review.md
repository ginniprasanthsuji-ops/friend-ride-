# Phase 13C — SECURITY DEFINER RPC Authorization Catalog Review

Date: 2026-11-26
Environment: QA Supabase project `pqsangtvietawkfgpgfu`
Mode: Read-only catalog/function-definition review. No user records accessed, no writes, no deploys. Main/Production untouched.

## Admin RPCs: EXECUTE ACL vs function-level authorization
Catalog shows authenticated EXECUTE on these SECURITY DEFINER functions:
- `admin_list_driver_applications`
- `admin_list_driver_documents`
- `admin_review_driver`
- `admin_review_driver_document`
- `fr_admin_assign_service_provider`
- `fr_admin_list_partner_applications`
- `fr_admin_review_partner`
- `fr_admin_confirm_pending_earning`
- `fr_admin_post_earnings_ledger`
- `fr_admin_verify_and_reward_referral`
- `fr_customer_referral_admin_review`

Definitions inspected contain admin_users authorization checks or call the admin helper before sensitive operations. They also set empty search_path. This is a positive catalog finding, but negative runtime calls by non-admin users are still pending.

## Additional scoped functions reviewed
- `fr_laundry_provider_transition`: authenticated caller required; booking must be assigned to auth.uid(); accepts only accept/start/complete and checks state transitions.
- `fr_tasko_provider_transition`: authenticated caller required; booking must be assigned to auth.uid(); transition checks and actual-hours validation for completion.
- `fr_service_provider_update_request`: requires approved provider owned by caller; request must be assigned to that provider; transition allowlist/state checks.
- `fr_road_ride_save_driver_profile`: authenticated, ride must be owned by auth.uid(); validates phone/registration; photo path first folder must equal auth.uid().
- `is_friend_ride_admin`: SECURITY DEFINER helper returns existence of admin_users row for auth.uid(); empty search_path.

## Concern requiring follow-up
`fr_customer_list_approved_service_providers` is SECURITY DEFINER, authenticated EXECUTE, empty search_path, and returns provider phone along with display name/service area/category for approved online providers. Its definition has no explicit role check; it relies on being callable by authenticated users and filters to approved+online providers. Review whether all authenticated roles should receive provider phone numbers, and whether this is intended customer discovery behavior. No runtime call performed.

## Negative runtime test cases added
1. Non-admin authenticated call to each admin-list/review/assign/ledger/referral RPC must fail with authorization denial.
2. Admin RPC attempts with invalid decision/status values must fail.
3. Customer or unrelated provider attempts to transition another provider's service booking must fail.
4. Provider transition calls against a booking owned by another provider must fail.
5. Road Ride profile-save against ride owned by another driver must fail.
6. Road Ride profile save with path folder not equal to auth.uid() must fail.
7. Confirm customer discovery RPC's intended role scope; verify phone visibility only to allowed roles.

## Status
Catalog/function-definition review completed for this selected RPC set. Runtime authorization tests pending. This report does not certify overall application security.
