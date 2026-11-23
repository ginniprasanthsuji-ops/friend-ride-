# Phase 7 — Location & Public Read RPC Review

## Static QA catalog/body review

### Approved service providers listing
`fr_customer_list_approved_service_providers` is EXECUTE granted to authenticated, not anon. It filters approved, online providers and active category, but returns provider phone number and service area. Review whether phone should be masked or returned only after a customer/provider interaction; authenticated-only is not equivalent to booking-scoped privacy.

### Approved partner/store geo listing
`fr_customer_list_approved_stores_geo` is authenticated-only (anon execute false). It returns approved partner business name/category/address and exact business latitude/longitude, with optional category filter. Confirm whether exact coordinates/address are intended public discovery data; consider only approximate coordinates or address visibility rules if not.

### Nearby driver listing
`fr_customer_list_nearby_drivers` is authenticated-only and checks customer/admin role, validates coordinates and radius (1–15 km), filters approved online drivers with location freshness <=5 minutes, and limits to 100. It returns driver UUID, exact latitude/longitude, online status, and update time. Privacy risk: customer can query arbitrary valid coordinates repeatedly and enumerate active driver locations within radius. Consider rate limiting, ride-context scoping, location rounding, minimum/maximum result controls, or server-side request context; verify policy/product requirement before changing.

### Public homepage feedback
`fr_public_homepage_feedback` is EXECUTE granted to anon and authenticated. Body filters feedback kind, homepage flag and published status; limits 20 and truncates display name to 80 chars. It returns message and creation timestamp. Check moderation, content length, PII disclosure, and abuse handling; this is expected public content only if consent is explicit and moderation status is reliable.

## Function grants observed
- Approved provider listing: anon false, authenticated true
- Approved stores geo: anon false, authenticated true
- Nearby drivers: anon false, authenticated true
- Homepage feedback: anon true, authenticated true

## Runtime verification needed
- Anonymous vs authenticated invocation behavior.
- Non-customer authenticated role denied by nearby-driver RPC.
- Exact location exposure and repeated arbitrary coordinate query abuse.
- Provider phone privacy and public-feedback moderation/consent.

Static review only; no RPC execution, data changes, SQL migration, or production changes.