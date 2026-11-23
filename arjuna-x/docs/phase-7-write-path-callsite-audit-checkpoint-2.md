# Phase 7 — Main Client Write Call-Site Inventory (Checkpoint 2)

Reviewed `index.html` on the Phase 7 QA branch (large main app source; static scan for direct Supabase table write methods). Static scan is not exhaustive and may miss dynamic table names or other files.

## Confirmed direct client writes

- `profiles`: 3 direct `.update()` occurrences and 1 `.insert()` occurrence in source scan. Includes registration/profile writes, driver/partner registration document paths, and profile photo/path save. Source snippets show a registration update, profile update and profile insert paths. Privileged field risk requires line-by-line function review and call-site context.
- `rides`: 1 direct `.insert()` for ride request, followed by select of id/status. Ride lifecycle appears mostly RPC-based per prior review, but source scan confirms direct create path must be retained or replaced by approved RPC.
- `driver_locations`: 2 direct `.upsert()` occurrences keyed by driver_id for online GPS; 1 direct `.update()` for offline state. This is a direct client write path; server-side ownership/coordinate validation and column grants are critical. Do not revoke without migrating to secure RPC or policy.
- `ride_live_locations`: 3 direct `.upsert()` occurrences for customer/driver tracking paths; 2 selects. Must enforce authenticated ownership, ride participant relationship, lifecycle, and allowed coordinate/timestamp columns.
- `fr_driver_documents`: direct `.upsert()` for KYC document metadata, found in both dedicated KYC script and main app source.
- `fr_service_bookings`: 2 direct `.insert()`, 3 direct `.update()`, 5 selects. Inspect these service booking write flows before privilege changes; likely create/transition responsibilities mixed.

## Immediate permission impact

Current broad authenticated table grants cannot be safely tightened wholesale until each direct client path is mapped to policy and required column list. Particularly:
- profiles: split registration/self-profile update/photo path writes from approval/role/admin-only fields.
- driver_locations and ride_live_locations: enforce UID/participant-based write scope and server-side lifecycle/coordinate constraints.
- rides: preserve customer create request fields only; assignment, fare agreement, status and completion should remain server-controlled through RPC.
- service bookings: map user-created requests vs provider transition/admin fields; consider RPC-only transitions.
- driver documents: client upload metadata should not set verification status or ownership arbitrarily; confirm policies enforce UID and document-type allowlist.

## Limits and safety

This is a static source scan of current QA-branch source. No test users or runtime calls were used. No SQL was executed. No app runtime files were changed. Production is untouched and branch not merged/deployed.
