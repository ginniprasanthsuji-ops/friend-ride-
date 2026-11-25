# Phase 13C — Admin Driver/Partner/Provider/Referral RPC Definition Review

Date: 2026-11-26
QA project: `pqsangtvietawkfgpgfu`
Method: Read-only function-definition inspection. No RPCs invoked.

## Reviewed functions and evidence

### Driver applications
- `admin_list_driver_applications()`: admin_users membership check before returning driver profile/application fields.
- `admin_review_driver(uuid,text)`: admin membership check; decision restricted to approved/rejected/revoked; updates only driver-role profile. When decision is not approved, driver online location is set offline.

### Partner applications
- `fr_admin_list_partner_applications()`: admin membership check before returning partner application fields, including contact/business/payment identifiers.
- `fr_admin_review_partner(uuid,text)`: admin membership check; decision limited to approved/rejected/revoked; targets partner-role profiles and returns status.

### Provider assignment
- `fr_admin_assign_service_provider(uuid,uuid)`: admin membership check; request must be requested/assigned; provider must be approved, online, and match request category; then request is assigned.

### Customer referral review
- `fr_customer_referral_admin_review(uuid,text,text)`: requires authenticated UID and `is_friend_ride_admin()`; decision approve/reject; locks referral row; blocks final credited/rejected states; approval requires eligible_order_count >= 2; records reviewer and timestamp.

### Referral reward
- `fr_admin_verify_and_reward_referral(uuid)`: explicit admin_users membership; row lock; rejects rejected referrals; idempotent already-rewarded handling; inserts both referrer and referee reward ledger entries with unique referral/reward type conflict handling; marks referral rewarded.

## Positive catalog evidence
- All reviewed functions are SECURITY DEFINER with empty search_path.
- Admin authorization checks are present in inspected function bodies.
- Decision enums and role/category/status eligibility checks are present in the inspected paths.
- Referral operations use row locks and idempotency/conflict controls.

## Runtime test priorities
1. Non-admin/anonymous invocation rejection for every function.
2. Confirm driver/partner approval cannot target wrong profile role.
3. Validate rejected/revoked driver online-status shutdown in runtime.
4. Provider assignment: wrong category, offline/unapproved provider, wrong request state must reject.
5. Referral review: fewer than 2 eligible orders cannot approve; repeated review/reward cannot double-credit.
6. Validate concurrent duplicate referral reward calls produce exactly one reward per beneficiary.
7. Confirm sensitive application/payment fields are returned only for admin callers.
8. Check admin action audit trail.

## Limits
Definition/catalog inspection only. No runtime tests, data queries, mutations, migrations, deployment, or production/main access.
