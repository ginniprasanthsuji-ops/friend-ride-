# Phase 13C — SECURITY DEFINER Function Classification Checkpoint

Date: 2026-11-26
Environment: FRIEND RIDE QA `pqsangtvietawkfgpgfu`
Scope: Catalog/function-definition review, read-only. No RPC calls or changes.

## Classification method
Reviewed SECURITY DEFINER function catalog, ACLs, and selected function bodies. Text-pattern classifications are triage hints only; they are not a substitute for role-negative runtime testing.

### Admin-guarded / sensitive operations (body guard confirmed in reviewed subset)
Admin guards are visible in the reviewed bodies for driver application/document review, provider assignment, earnings ledger/admin earning operations, referral review/reward, refund queue/mark-paid, Phase 13D assignment/listing, and other admin RPCs. Previously tested non-admin negative tests remain limited to the named eight production admin RPCs and three QA admin RPCs in earlier evidence. No new runtime test in this checkpoint.

### Owner/participant-scoped operations
Ride offer accept/decline and driver offer actions use `auth.uid()`-anchored ownership/role conditions in reviewed examples. Customer payment/request/referral and driver ride transitions generally have auth.uid() text in their bodies. Must still test two-user isolation and state conditions with test identities.

### Public/approved-list or intentionally public candidates
- `fr_customer_list_approved_service_providers`: authenticated EXECUTE; SECURITY DEFINER; returns approved/online providers, including **phone**. Privacy review needed: confirm phone display is intentional or change frontend/API contract to show phone only after a service request/assignment.
- `fr_customer_list_approved_stores_geo`: authenticated EXECUTE; returns approved partner business name/category/address/coordinates. Review whether precise store coordinates/address should be public to all signed-in users.
- `fr_public_homepage_feedback`: anon and authenticated EXECUTE; returns only published homepage feedback rows, limited to 20. Candidate intentional public read; verify publication workflow, message/name sanitization and privacy consent.
- `fr_customer_list_nearby_drivers`: authenticated EXECUTE; body checks signed-in customer or admin, validates coordinates and radius <=15km, returns online approved drivers' coordinates updated within five minutes. Sensitive location surface; runtime role-negative tests and user-facing location consent required.

### Service-only
- `fr_notification_claim_batch`: EXECUTE only postgres/service_role; no anon/authenticated grants. Claim token required; uses FOR UPDATE SKIP LOCKED and stale-claim recovery. Service-only ACL confirmed from catalog; no runtime HTTP/delivery test.
- `fr_create_notification_preferences_for_new_user`: EXECUTE postgres/service_role only; trigger body inserts preference row for NEW.id. No anon/authenticated grant observed.

### Phase 13D sensitive RPCs
- `fr_phase13d_assign_ers_rrs_booking`: authenticated EXECUTE; body requires authenticated admin, approved driver, and verified driving_license/aadhaar/vehicle_rc; pending booking-only update.
- `fr_phase13d_list_ers_rrs_bookings`: authenticated EXECUTE; body filters to authenticated admin and caps list at 200.
- Phase 13D runtime workflow still blocked by zero QA auth users/profiles/documents.

## ACL observations
The selected reviewed functions have explicit ACLs:
- public homepage feedback: anon, authenticated, service_role, postgres
- approved providers/stores/nearby drivers: authenticated, service_role, postgres
- notification claim and new-user preference trigger: service_role and postgres only
- Phase 13D assign/list: authenticated, service_role, postgres

## Priority follow-up
1. Review provider-list phone exposure and store address/coordinate exposure; no change made.
2. Review nearby-driver live coordinate access, consent, retention, and cross-customer isolation.
3. Continue full 64 authenticated SECURITY DEFINER catalog review, prioritizing payments, contact detail, refunds, ledger, referrals, bookings.
4. Create/use isolated QA identities only with owner authorization; current QA has zero auth users.
5. Phase 13C remains unaccepted pending runtime tests, review decisions, and proposed least-privilege changes.

## Status
Catalog checkpoint documented. QA only. No production changes, grants, policies, schema, test users, or runtime RPC execution.
