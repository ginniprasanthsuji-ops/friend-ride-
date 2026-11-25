# Phase 13B — Sensitive Helper Functions & Storage Policy Review (QA Read-Only)

Date: 2026-11-26
Project scope: QA Supabase project `pqsangtvietawkfgpgfu` only.
No table rows or file contents read. No SQL writes, policy changes, or production access.

## Function hardening observations
Catalog reviewed for relevant helper/admin/provider/location/shared/road-ride functions.

Common positive control:
- Reviewed SECURITY DEFINER functions generally have `search_path` set to empty (`SET search_path TO ''`) and explicit `public.` schema references.
- ACL snapshots for the targeted functions show EXECUTE for authenticated and service_role; no anon entry observed in the displayed ACLs.

### Findings requiring follow-up
1. **Service provider phone exposure surface (review priority):** `fr_customer_list_approved_service_providers(p_category_slug)` is SECURITY DEFINER, authenticated-executable, and returns provider phone for approved, online providers. Function body has no explicit auth.uid()/customer-role/admin check. This may be intentional for customer discovery, but any authenticated role appears able to call it directly. Validate intended phone visibility and role boundary before accepting.
2. **Shared Ride participant helper is status-agnostic:** `fr_shared_ride_is_passenger(p_ride_id)` returns true for any booking row for the user/ride, including cancelled/refunded rows. This corroborates earlier RLS/helper review; terminal booking statuses should not retain participant authorization unless explicitly intended.
3. **Road Ride helper status boundary:** `fr_road_ride_is_passenger` filters booking statuses to active/recognized states (booking_pending, confirmed, boarding, in_progress, dropped, completed, disputed), excluding cancelled/refunded. `fr_road_ride_is_driver` is ride-owner scoped.
4. **Nearby-driver RPC guard:** `fr_customer_list_nearby_drivers` requires login and customer role or admin, validates coordinate ranges and radius <=15 km, returns online approved drivers with recent location (5 minutes), limited to 100. Catalog review only; runtime behavior not tested.
5. **Ride driver-details RPC:** `get_ride_driver_details` requires authenticated user and selects only a ride where `customer_id=auth.uid()`, with ride status accepted/confirmed/ongoing/in_progress/started/completed. It returns driver contact/vehicle/photo path; verify status and photo access behavior in runtime negative tests.

## Storage bucket/policy review
Only catalog metadata and policy definitions were read.

### Bucket
- `road-ride-driver-photos`
- Private bucket (`public=false`)
- Max object size: 3 MiB
- MIME allowlist: JPEG, PNG, WebP

### Policies on storage.objects
- SELECT own: authenticated, bucket constrained and first folder equals auth.uid()
- INSERT own: authenticated, bucket constrained and first folder equals auth.uid()
- UPDATE own: authenticated, bucket constrained and first folder equals auth.uid() in both USING and WITH CHECK
- No DELETE policy observed for this bucket in current policy catalog.
- Only one storage.objects policy set was returned in this catalog query; this does not establish that all other app photo/document buckets exist or are absent.

## Runtime negative tests still required
- Provider phone RPC: customer vs driver/partner/admin direct invocation; unauthenticated denied; verify only intended approved-online records and fields are returned.
- Shared Ride participant helper and dependent policies: cancelled/refunded passenger must lose access to participant-scoped events/payments/ride data.
- Road Ride terminal/cancelled/refunded participant boundary.
- Driver-details RPC: non-customer, wrong customer, unrelated ride, terminal states; photo object access by owner vs unrelated account.
- Storage: cross-user SELECT/INSERT/UPDATE/DELETE attempts; wrong bucket; nested folder/path spoof; invalid MIME/oversize; unauthenticated signed/public access.
- Check profile, partner, driver-document, service-provider and customer photo buckets/policies separately; this review only identified the road-ride-driver-photos bucket in the returned metadata.

## Status
- Read-only QA metadata audit.
- No fixes applied.
- Main/Production untouched.
- Frozen estimates unchanged: Planning/Checklist 88%, Overall Audit 12%, Phase 13B Shared Ride hardening 70%; graph frozen.
