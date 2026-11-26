# Phase 13D QA — Home Service Provider RPC Authorization & Phone Exposure Review (2026-11-26)

Read-only QA metadata/definition review, project `pqsangtvietawkfgpgfu`. Production/Main untouched.

## RPCs inspected
1. `fr_admin_assign_service_provider(p_request_id uuid,p_provider_id uuid)`
2. `fr_service_provider_update_request(p_request_id uuid,p_status text)`
3. `fr_customer_list_approved_service_providers(p_category_slug text)`

## Static guard findings
### Admin assignment
- SECURITY DEFINER; empty search_path.
- Explicit admin_users membership check using auth.uid().
- Request must be requested/assigned.
- Provider must be approved, online, and category match.
- Updates request to assigned.
- Guard appears present in function definition; runtime behavior not tested.

### Provider request status transition
- SECURITY DEFINER; empty search_path.
- Requires authenticated user and an approved provider owned by auth.uid().
- Status allowlist: accepted/rejected/in_progress/completed.
- Update is constrained to the request assigned to that provider owner and allowed status sequence: assigned -> accepted/rejected; accepted -> in_progress; in_progress -> completed.
- Guard appears present in definition; runtime negative tests not performed.

### Customer provider listing / phone exposure
- SECURITY DEFINER, empty search_path.
- Returns provider_id, display_name, phone, service_area, category_slug for approved, online providers in active category, optionally filtered by category.
- The function returns phone numbers to callers with authenticated EXECUTE privilege. An explicit customer-role check, phone masking, or contact-use limiter is not visible in this function definition.
- This is a privacy review concern to validate against intended UX and role-specific front end; do not claim exploit/runtime confirmed. Consider returning phone only after a qualifying service request/booking, or ensuring only intended customer roles can call and phone visibility is consented/controlled.

## Execute ACL
- anon EXECUTE: false for all three.
- authenticated EXECUTE: true for all three.
- service_role and postgres listed in ACL.

## Limits
Static SQL catalog review only; no role impersonation/runtime RPC tests, no writes, no migrations, no contact-data query performed. Production/Main untouched.
