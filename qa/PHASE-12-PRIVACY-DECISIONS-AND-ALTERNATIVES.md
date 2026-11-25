# Phase 12 — Privacy Review Decisions & Safer Alternatives

QA project: pqsangtvietawkfgpgfu  
Branch: phase-12-implementation-plan  
Review: read-only function/schema review. No production/QA SQL changes applied.

## Decision 1 — Driver location privacy (HIGH)
**Current RPC:** `fr_customer_list_nearby_drivers` returns driver UUID, exact latitude/longitude, online state, and updated timestamp to customer/admin callers.

**Decision:** Do not expose exact driver coordinates in customer map/list before a ride is assigned. Replace customer-facing nearby-driver map pins with coarse proximity/availability (e.g. estimated nearby count or coarse grid/rounded coordinates) if pre-booking display is required. Keep precise coordinates server-side for dispatch and authorized live tracking after ride assignment. Do not expose raw driver UUID or exact last-update timestamp in pre-booking customer response unless required.

**Alternative/removal:** Remove exact-coordinate output from the customer-facing nearby-driver RPC projection; retain location data for dispatch and assigned-trip tracking. Review app callers before changing RPC signature.

## Decision 2 — Ride request privacy for drivers (HIGH)
**Current RPC:** `get_driver_requests()` returns `SETOF rides` (entire row). Current rides columns include customer UUID, pickup/drop text and coordinates, fare fields, notes, status, timestamps.

**Decision:** Replace `SETOF rides` with an explicit projection. Before driver accepts, show only dispatch-needed fields: request identifier/token, vehicle type, pickup approximate area (or rounded pickup location), drop-off approximate area/distance (avoid exact drop coordinates), fare offer, request age, and status. Exclude customer UUID, private notes, exact destination, unnecessary timestamps and internal fields. Reveal precise pickup details only after the driver accepts, subject to workflow/privacy rules. Ensure RPC validates approved driver role and response is scoped to unassigned requests.

**Alternative/removal:** Remove full-row return and implement minimal typed RPC projection. Exact customer/drop details withheld pre-acceptance.

## Decision 3 — Provider phone consent (MEDIUM)
**Current RPC:** `fr_customer_list_approved_service_providers` returns phone with provider ID, display name, service area and category. Schema has no explicit phone-display consent field observed.

**Decision:** Do not return phone in public/customer listings by default. Listing shows provider name/business, category, service area and relevant service details. Use in-app contact/booking request; reveal phone only after explicit provider opt-in and a workflow need (or booking confirmation), preferably with controlled contact action.

**Alternative/removal:** Remove `phone` from customer-list RPC projection until explicit consent is stored and verified. No consent column found in inspected schema snapshot.

## Decision 4 — Public homepage feedback (MEDIUM)
**Current RPC:** `fr_public_homepage_feedback` returns published feedback with display name (derived from profile full name, fallback label), rating, message and created time. Existing `show_on_homepage` flag and `status='published'` filter are present; explicit consent for public name/message was not confirmed in schema.

**Decision:** Do not publish identifiable name or raw message without explicit opt-in and moderation. Safest default is anonymized/aggregate rating (e.g. “FR Customer”) and moderated, redacted feedback snippets only where explicit public-display consent exists. Avoid timestamps/IDs in public display unless necessary.

**Alternative/removal:** Hide/remove the public feedback feature until explicit consent + moderation is implemented; or return only aggregate rating/count. Existing `show_on_homepage` must not be treated as proof of explicit consent without confirming its UI and meaning.

## Implementation gate
- These are decisions/recommendations, not applied schema or function changes.
- Confirm QA target, review migration/RPC code, and obtain explicit approval before applying.
- Test customer/driver/provider/admin roles and assigned vs unassigned ride data.
- Verify no app UI relies on removed fields; update UI callers together.
- Re-run privacy tests and SQL catalog checks after changes.
