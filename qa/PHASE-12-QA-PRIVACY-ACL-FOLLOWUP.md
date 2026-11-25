# Phase 12 — Follow-up Privacy & Function ACL Verification

**Branch:** phase-12-implementation-plan  
**QA project:** pqsangtvietawkfgpgfu  
**Review:** read-only catalog/schema inspection only; no data rows, writes, migrations, runtime calls, or production changes.

## Verified ACL corrections / clarifications

### Notification batch claim — ACL is restricted
Catalog ACL for `fr_notification_claim_batch` shows execute granted to `postgres` and `service_role`, **not authenticated**. This reduces the earlier concern: no authenticated execute grant was observed in the current QA catalog. Still confirm worker/service-role invocation path and secret handling; no runtime test performed.

### Driver request RPC — returned row fields
The `rides` schema includes customer ID, pickup/drop text and coordinates, fare fields, status, notes, timestamps. `get_driver_requests` returns `SETOF rides` for requested/unassigned rides and requires approved driver. It does not expose a phone column in the observed rides schema; however it returns customer ID, exact pickup/drop coordinates/text, and notes. **Privacy/product review required**: limit fields to those drivers need to assess/accept the request; review whether notes can contain personal or sensitive information.

### Nearby driver listing — exact location confirmed
`driver_locations` has driver_id, latitude, longitude, is_online, updated_at. RPC returns exact latitude/longitude for online approved drivers with location updated in last 5 minutes, within up to 15 km, max 100 results, to customer/admin. **High-priority privacy decision**: consider whether customer should receive coarse coordinates and only relevant ride-state location, instead of a general exact-location list.

### Provider contact — phone confirmed
Provider table includes phone, profile photo path, UPI ID, PhonePe number, QR path. Customer-list RPC returns phone in the public provider listing. Other payment/contact identifiers are not returned by that RPC. **Review consent and data minimization** before production.

### Homepage feedback — public execution confirmed
ACL for `fr_public_homepage_feedback` includes `anon`, authenticated, and service_role. It only selects feedback marked kind=feedback, published, and show_on_homepage=true, and returns a customer display name/message. **Confirm opt-in and moderation/redaction** for public display. No feedback data was read.

## ACL snapshot
- `fr_notification_claim_batch`: postgres + service_role execute; authenticated not listed.
- `get_driver_requests`: postgres + authenticated + service_role.
- `fr_customer_list_nearby_drivers`: postgres + authenticated + service_role.
- `fr_customer_list_approved_service_providers`: postgres + authenticated + service_role.
- `fr_public_homepage_feedback`: postgres + anon + authenticated + service_role.

All five functions showed `search_path=""` in the catalog.

## Remaining gates
1. Confirm minimum fields for driver ride request payload.
2. Decide live driver coordinate precision and customer access conditions.
3. Confirm provider phone display consent.
4. Confirm public feedback consent/moderation rules.
5. Perform role-based runtime QA with dedicated test identities.
6. No SQL changes until findings are resolved and migration reviewed.

**Evidence level:** static schema and ACL inspection. Runtime behavior is NOT TESTED; nothing is certified PASS.
