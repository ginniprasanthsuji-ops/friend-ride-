# Phase 13C — Service Provider Contact/Approval/Notification Exposure Follow-up

Date: 2026-11-26
QA project: `pqsangtvietawkfgpgfu`
Branch: `arjuna-x/phase-13-feature-audit`
Scope: Read-only schema, function-definition, and policy catalog review; no runtime tests or row data.

## Catalog evidence
- `fr_service_requests` includes `customer_phone`, `customer_id`, `provider_id`, `status`, and `provider_quote`.
- Its SELECT policy allows the customer, owner of the assigned provider, or admin to read the row. Thus the assigned provider owner can read the request row, including customer_phone, according to the policy shape.
- `fr_customer_create_service_request` obtains the customer's phone from their profile and stores it on the request. It returns request ID/number/status, not phone.
- `fr_customer_list_approved_service_providers` returns provider phone for approved+online providers to authenticated callers (confirmed by prior function-definition review).
- Service-provider application table includes phone, emergency contact phone, and reference phone. RLS catalog indicates owner/admin read, with admin update.
- Service-provider profile table contains provider phone and PhonePe number. Approved-provider read policy is broad to authenticated users at row level; actual column exposure and frontend projection require further review.
- Notifications table policy permits authenticated user to read/update their own notifications. Notification token policy restricts token management to token owner.
- Reviewed service RPCs EXECUTE: authenticated true; anon and PUBLIC false (prior ACL query).

## Privacy/authorization concerns to validate
1. Customer phone is stored on service request and is available to assigned provider owner through row SELECT. Confirm this is an intentional booking-specific contact exchange and only after assignment/acceptance, not during public/unaassigned listing.
2. Provider phone is returned by approved-provider listing RPC to authenticated callers. Consider whether contact should be revealed only after a customer creates a request/booking, or whether listing exposure is intentional.
3. Approved-provider table SELECT policy permits row visibility; sensitive columns (phone, PhonePe number) may be exposed through direct table access depending grants. Inspect column-level grants and frontend select projections before claiming data is protected.
4. Application emergency/reference phone fields are owner/admin scope in policy catalog; still check column grants and API projections.
5. Notification policies are own-user scope, but actual notification triggers/recipient routing and message payload privacy are not tested.

## Service workflow state catalog
- Customer request creation: status requested; provider may be NULL or selected approved/online provider; customer phone is copied from profile.
- Admin assignment: request requested/assigned; category-matching approved+online provider; assignment changes status assigned.
- Provider transition: assigned→accepted/rejected; accepted→in_progress; in_progress→completed.
- Assignment concurrency/race risk remains because function selects then updates without explicit row lock; runtime test pending.

## No changes
No row data queried, RPC invoked, runtime tests, DDL, SQL writes, app changes, deployment, or Production/Main access.

## Frozen tracking
- Phase 13B Shared Ride Hardening: 70% FROZEN
- Planning/Checklist: 88% FROZEN
- Overall Audit estimate: 12% FROZEN
- Progress graph: FROZEN
