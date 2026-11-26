# Phase 13D QA — Service Provider / TASKO / Road-Ride RPC ACL & Authorization Audit (2026-11-26)

## Scope
Read-only inspection of QA Supabase project `pqsangtvietawkfgpgfu` function catalog, ACLs and definitions. No SQL writes or function execution. Production/Main untouched.

## Catalog and ACL
Five matching public functions inspected. All are SECURITY DEFINER and have explicit empty search_path (good hardening against search-path injection). ACL output shows EXECUTE granted to authenticated and service_role (plus owner postgres) for all five.

## Function findings
1. `fr_admin_assign_service_provider(p_request_id uuid, p_provider_id uuid)`
   - Checks admin membership using `admin_users.user_id=auth.uid()`.
   - Requires request status requested/assigned and provider approved, online, and category-matched.
   - Updates request to assigned.
   - Static authorization appears appropriately admin-scoped.

2. `fr_customer_list_approved_service_providers(p_category_slug text)`
   - Returns provider id, display name, phone, service area and category slug for approved/online providers in active categories.
   - No explicit auth.uid() non-null check inside function; EXECUTE is granted to authenticated (and service_role).
   - Potential privacy review item: provider phone is returned in listing result. Confirm business requirement permits phone visibility to all authenticated customers before approval/booking. No runtime/anonymous test.

3. `fr_road_ride_confirm_booking(p_booking_id uuid)`
   - Requires login, pending booking, ride owner driver, and ride status booked.
   - Row locks and event audit insert present. Static checks look appropriately scoped.

4. `fr_service_provider_update_request(p_request_id uuid,p_status text)`
   - Requires authenticated approved provider.
   - Status allowlist and transition guards; update additionally scoped to provider owning assigned request.
   - Static authorization appears appropriately scoped.

5. `fr_tasko_provider_transition(p_booking_id uuid,p_action text,p_actual_hours numeric)`
   - Requires login; only assigned provider's TASKO booking can be selected.
   - Actions allowlisted; transition checks accept->start->complete; completion hours 0..24 and pricing guards; final payment status pending.
   - Static authorization and transition guards appear scoped. Runtime concurrency/role tests not done.

## Risk classification / follow-up
- No direct ACL exposure found in the inspected function metadata; EXECUTE is authenticated/service_role only.
- **Privacy review:** customer listing function exposes provider phone numbers before booking. Verify intended policy; if contact should be revealed only after booking/assignment, this is a data-minimization gap. Do not modify function without business decision.
- SECURITY DEFINER functions should be reviewed for ownership and object privileges as separate follow-up; current explicit empty search_path is positive.
- Runtime tests for anonymous/authenticated customer, unrelated provider, assigned provider, ride owner and non-admin remain pending.

## Frozen tracking
13C remains frozen at 91%; Planning/Checklist 88%; Overall Audit 12%; progress graph frozen. QA branch only; no Main/Production change.
