# Phase 13D — Mutation RPC ACL Spot Review (2026-11-26)

## Scope
Read-only catalog inspection of SECURITY DEFINER mutation RPCs in QA project `pqsangtvietawkfgpgfu`.

## Confirmed spot checks
- `admin_review_driver`, `admin_review_driver_document`: admin_users membership gate.
- `fr_admin_assign_service_provider`: admin gate plus approved/online provider and category match.
- `fr_admin_post_earnings_ledger`, `fr_admin_confirm_pending_earning`: admin gate; direct confirmed posting restricted to admin adjustment.
- `fr_admin_review_partner`: admin gate.
- `fr_admin_verify_and_reward_referral`, `fr_customer_referral_admin_review`, `fr_customer_referral_reward_credit`: admin gating present.
- `fr_notification_claim_batch`: ACL shows EXECUTE only for postgres/service_role; no authenticated/anon.
- `fr_create_notification_preferences_for_new_user`: trigger function, EXECUTE only postgres/service_role.
- `fr_register_driver_partner`: authenticated; customer-to-driver/partner role transition only; pending approval status set; required profile/business fields validated.
- `fr_road_ride_save_driver_profile`: authenticated owner-only ride update and private photo path UID validation.

## Notes / limitations
This is catalog/static verification. No runtime identity tests. Profile schema spot query found `driver_photo_path` on road rides but did not identify a generic `profiles` avatar/photo column in the queried column names; this is not a complete frontend registration photo audit and requires schema/frontend reconciliation.

## Scope safety
QA project only. Main/Production untouched. No test identities or fixtures created.
