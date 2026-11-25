# Phase 13C — Service SECURITY DEFINER RPC Authorization & Contact-Exposure Review

Date: 2026-11-26
QA project only: `pqsangtvietawkfgpgfu`
Branch: `arjuna-x/phase-13-feature-audit`
Scope: Read-only inspection of routine definitions and EXECUTE ACL. No runtime calls or user data queries.

## RPCs reviewed

### `fr_admin_assign_service_provider(p_request_id uuid, p_provider_id uuid)`
- SECURITY DEFINER; empty search_path.
- Explicitly checks authenticated user membership in `admin_users`.
- Request must be in `requested` or `assigned` state.
- Provider must match request category, be approved, and be online.
- Updates request to assigned.
- Risk to verify: request assignment state is checked then updated without explicit row lock; concurrent admin assignments may race. Runtime/concurrency test not performed.

### `fr_customer_create_service_request(...)`
- SECURITY DEFINER; empty search_path.
- Requires authenticated profile role customer.
- Validates active category; address/details length; date not in past; time supplied.
- If provider selected, provider must match category, approved and online.
- Inserts request with authenticated customer ID and status requested.
- Returns request ID/number/status only.

### `fr_customer_list_approved_service_providers(p_category_slug text)`
- SECURITY DEFINER; empty search_path; STABLE SQL.
- Returns provider ID, display name, phone, service area, category slug.
- Filters to approved + online providers and active categories.
- Contact exposure concern: authenticated callers can obtain phone numbers of approved/online providers via this RPC. Intended customer context and rate/abuse controls require product/privacy confirmation; no runtime/UI test.

### `fr_service_provider_update_request(p_request_id uuid,p_status text)`
- SECURITY DEFINER; empty search_path.
- Requires authenticated owner of an approved provider.
- Allowed target statuses: accepted, rejected, in_progress, completed.
- Request must be assigned to provider owned by caller.
- Allowed transitions catalog-coded: assigned→accepted/rejected; accepted→in_progress; in_progress→completed.
- Returns true only if exactly one row updated; otherwise false.

## EXECUTE ACL catalog
All four reviewed RPCs:
- authenticated: EXECUTE = true
- anon: EXECUTE = false
- PUBLIC: EXECUTE = false

## Findings
- Admin assignment and provider status update have explicit identity/ownership/state checks in definitions.
- Customer request creation validates customer role and provider eligibility.
- Approved-provider listing exposes provider phone in RPC result to authenticated callers; review whether this is intended public-to-authenticated contact data and whether only booking/request context should reveal it.
- Assignment concurrency behavior needs safe QA runtime verification before any remediation.
- Catalog review does not prove implementation is free from runtime defects.

## No changes performed
No RPC execution, runtime tests, DDL, data writes, migrations, application edits, deployment, or Production/Main access.

## Frozen tracking
- Phase 13B Shared Ride Hardening: 70% FROZEN
- Planning/Checklist: 88% FROZEN
- Overall Audit estimate: 12% FROZEN
- Progress graph: FROZEN
