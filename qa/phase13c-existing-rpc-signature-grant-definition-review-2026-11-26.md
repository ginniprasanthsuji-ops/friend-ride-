# Phase 13C QA — Existing RPC Signature / Grant / Definition Review (2026-11-26)

Read-only QA Supabase catalog review of selected frontend-referenced RPCs. No schema changes, function writes, or Production/Main access.

## Catalog evidence
- Inspected function signatures, EXECUTE grants, SECURITY DEFINER, and search_path config for 23 frontend-referenced existing functions.
- All sampled functions are SECURITY DEFINER and have empty search_path configuration.
- Sampled functions grant EXECUTE to authenticated, postgres, service_role; public homepage feedback additionally grants anon EXECUTE (expected for public read-only published feedback).
- No anon EXECUTE grant found in the sampled protected driver/admin/ride/service functions.

## Guard/behavior definition review
### Admin approval RPCs
- `admin_review_driver`: checks auth.uid() membership in public.admin_users; validates decision; updates only driver role profile; disables online location for non-approval decisions.
- `admin_review_driver_document`: admin_users guard; decision allowlist verified/rejected; records reviewer and timestamp.
- `fr_admin_review_partner`: admin_users guard; decision allowlist; partner-role profile filter and missing-profile exception.

### Ride lifecycle
- `fr_driver_start_ride`: requires authenticated approved driver; only assigned driver can transition accepted ride to ongoing; sends customer notification.
- `fr_driver_complete_ride`: requires authenticated approved driver; only assigned driver can complete ongoing ride; removes ride live location and emits customer notification. Function explicitly says payment integration deferred in QA scope.

### Customer/driver contact privacy
- `get_ride_customer_details_v2`: authenticated; returns customer contact/profile only for ride assigned to current driver, and only accepted/confirmed/ongoing/completed statuses.
- `get_ride_driver_details`: authenticated; returns driver contact/profile only for ride whose customer is current user and qualifying ride status.
- These definitions support participant-only contact checks at function level; runtime isolation tests remain unperformed.

### Registration
- `fr_register_driver_partner`: authenticated session required, role allowlist driver/partner, object payload, name/phone validation, account role must be customer before role change, registration fields required by role, pending approval statuses, account-folder validation for provider QR path.
- Passport/profile photo requirement is not evident in this inspected definition; follow-up validation is needed against frontend payload and profile photo columns.

### Laundry provider transition
- `fr_laundry_provider_transition`: requires authentication, action allowlist, assigned provider ownership, row lock, strict assigned→accepted→in_progress→completed transitions.
- Definition does not independently validate provider role/category beyond booking service_type='laundry' and assigned_provider_id=auth.uid(). Record as a role/category enforcement question for follow-up.

## Not verified
- Live RPC invocation, wrong-role/other-user rejection, concurrency/race behavior, signature-to-frontend payload parity for all 25 present RPCs, or end-to-end UI workflow.
- Admin test account unavailable in prior QA; no live admin test was attempted.

## Frozen estimates
Phase 13C 91%; Planning/Checklist 88% frozen; Overall Audit 12% frozen; progress graph frozen.
