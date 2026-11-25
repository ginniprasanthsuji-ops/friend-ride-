# Phase 12 — Remaining SECURITY DEFINER Review (Read-only)

**Branch:** `phase-12-implementation-plan`  
**QA project:** `pqsangtvietawkfgpgfu`  
**Review type:** PostgreSQL catalog/function-definition inspection only  
**Status:** Findings recorded; no runtime calls, exploit attempts, writes, migrations, or production changes.

## Functions reviewed
- `get_driver_requests`
- `counter_offer_ride`
- `accept_counter_offer`
- `decline_counter_offer`
- `fr_notification_claim_batch`
- `fr_laundry_provider_transition`
- `fr_tasko_provider_transition`
- `fr_public_homepage_feedback`
- `fr_customer_create_service_request`
- `fr_customer_list_approved_service_providers`
- `fr_customer_list_approved_stores_geo`
- `fr_customer_list_nearby_drivers`

Observed definitions use empty search_path settings. Most sampled functions are executable by authenticated and service_role; execute grants are not proof that the intended caller restrictions are correct.

## Findings / follow-up risks

### F12-SD-01 — Notification claim function has no visible caller-role guard
`fr_notification_claim_batch` accepts a claim token and limit, then claims queued/stale-processing notification rows using `FOR UPDATE SKIP LOCKED`. The inspected definition contains no `auth.uid()` or admin/service-role check. Catalog ACL showed authenticated execute. **Priority: High; runtime and grant review required.** Verify only the trusted server/worker role can execute; if authenticated access is unnecessary, revoke it in a reviewed migration.

### F12-SD-02 — Driver request listing returns full ride rows
`get_driver_requests` checks approved driver role but returns `SETOF rides` (all columns) for unassigned requested rides. **Priority: High privacy review.** Confirm the rides row contains no fields that drivers should not see before assignment; consider a limited projection/RPC DTO after schema review.

### F12-SD-03 — Nearby driver RPC returns exact coordinates and driver IDs
`fr_customer_list_nearby_drivers` requires customer/admin, limits radius to 15km, freshness to 5 minutes, and result count to 100; however it returns exact latitude/longitude and driver IDs. **Priority: High privacy review.** Consider customer-facing approximate location or server-side distance filtering with reduced precision, and verify live-location visibility only during relevant ride states.

### F12-SD-04 — Approved provider listing exposes provider phone
`fr_customer_list_approved_service_providers` returns phone along with name and service area to authenticated callers, filtered to approved/online providers. **Priority: Medium privacy review.** Confirm providers consent to public contact disclosure and that phone visibility is intended; otherwise separate public fields from contact reveal.

### F12-SD-05 — Homepage feedback can expose full message and customer display name
`fr_public_homepage_feedback` returns published feedback with display name and message (up to 20 rows). **Priority: Medium privacy/content review.** Confirm explicit consent for public display and message moderation/redaction; the function itself only filters published/show_on_homepage records.

## Positive observations from inspected definitions
- Ride counter-offer functions require approved driver (offer) and ride customer (accept/decline); they use status/ownership checks and conditional updates.
- Customer service request creation requires customer role, validates fields/date, and checks selected provider is approved/online in the selected category.
- Laundry/TASKO provider transitions are scoped to the assigned provider and lock booking rows; state transitions are constrained. TASKO completion validates hours and quote rules.
- Approved-store listing filters partner role and approval status and returns business location fields; public exposure and geo privacy still require product confirmation.

## Next action gates
1. Review/confirm intended access for notification claiming; this is the highest-priority issue.
2. Review ride-row columns and narrow driver request payload if sensitive fields are present.
3. Confirm live-location precision/visibility requirements.
4. Confirm provider-phone disclosure and public-feedback consent.
5. Perform runtime tests with separate customer/driver/provider/admin identities in QA.
6. Only then create reviewed SQL migration(s). No SQL changes made in this review.

**Evidence limitation:** This is static definition/catalog review, not proof of exploitability or runtime behavior. No test has been marked PASS.
