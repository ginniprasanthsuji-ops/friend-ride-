# Phase 13C — Service Booking/Request ACL, RLS & Payment-State Catalog Review

Date: 2026-11-26
Project: QA Supabase only (`pqsangtvietawkfgpgfu`)
Branch: `arjuna-x/phase-13-feature-audit`
Scope: Read-only catalog inspection. No customer rows queried.

## Tables inspected
- `fr_service_bookings`
- `fr_service_requests`
- `fr_service_providers`
- `fr_service_provider_applications`

## Catalog findings
### Service bookings
- Insert policy: authenticated customer can insert only own row (`customer_id = auth.uid()`), with initial `status='pending'` and `payment_status='not_due'`.
- Read policy: customer, assigned provider, or admin.
- Update policy: admin only in inspected policy catalog.
- Authenticated has broad table grants including DELETE/TRUNCATE, but no corresponding DELETE policy appeared in inspected policy list. Runtime deny verification remains required.
- Payment columns include status, reference, submitted timestamp, verified timestamp, and verifier ID. This is booking-payment workflow, not subscription billing.

### Service requests
- Customer insert policy requires own customer ID, initial status `requested`, and provider_id NULL.
- Read policy restricts to customer, owner of linked provider, or admin.
- Update policy is admin-only in inspected catalog.
- Authenticated has broad grants including DELETE/TRUNCATE; no delete policy appeared. Runtime deny verification remains required.

### Service-provider applications
- Insert policy requires `provider_id=auth.uid()` and `status='pending'`.
- Read policy: application owner or admin.
- Update policy: admin only.
- Authenticated broad grants include DELETE/TRUNCATE; no delete policy appeared in inspected policy catalog. Runtime deny verification remains required.

### Service providers
- Read policy permits approved provider rows, owner, or admin.
- Admin-only ALL policy for management.
- Authenticated broad grants include DELETE/TRUNCATE; RLS catalog did not show a non-admin delete policy. Runtime checks remain pending.

## SECURITY DEFINER service functions catalog
- `fr_admin_assign_service_provider(p_request_id uuid,p_provider_id uuid)`
- `fr_customer_create_service_request(...)`
- `fr_customer_list_approved_service_providers(p_category_slug text)` returns provider id/display name/phone/service area/category slug
- `fr_service_provider_update_request(p_request_id uuid,p_status text)`

Catalog confirms these routines are SECURITY DEFINER; their implementation authorization and state validation must be code-reviewed separately. No runtime invocation was performed.

## Risk / verification notes
- Broad authenticated grants combined with RLS are not themselves proof of exposure. Missing DELETE policies in the inspected catalog suggest RLS should block deletes, but this must be validated with role-scoped negative tests.
- Service provider listing RPC includes phone in its return shape; verify that it only returns approved providers and that frontend displays contact information in intended context.
- Payment status/verification columns are present but no live payment flow, verification RPC, webhook, or UI confirmation was tested.
- No subscription plan/status/expiry or invoice fields observed in these service tables.

## No changes performed
No DDL, writes, migrations, application edits, deployments, runtime tests, or production/Main access.

## Frozen tracking
- Phase 13B Shared Ride Hardening: 70% FROZEN
- Planning/Checklist: 88% FROZEN
- Overall Audit estimate: 12% FROZEN
- Progress graph: FROZEN
