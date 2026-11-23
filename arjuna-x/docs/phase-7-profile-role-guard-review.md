# Phase 7 — Profile Role Guard / Registration GUC Review

## Read-only QA source review
- `qa_guard_profile_privileged_fields()` is a SECURITY DEFINER BEFORE UPDATE trigger on public.profiles.
- It blocks role, driver approval status, and partner approval status changes for authenticated non-admin users unless `app.friend_ride_role_registration` equals auth.uid().
- `fr_register_driver_partner()` is SECURITY DEFINER, uses empty search_path, requires auth.uid(), role allowlist (driver/partner), object JSON payload, valid name/phone, customer role existing profile, complete role-specific fields, and provider QR path first segment must match the caller UID.
- Registration function sets the custom GUC with `set_config(..., true)` (transaction-local) immediately before updating profiles. This is the intended registration path.
- Admin check uses existence in public.admin_users.
- Trigger guards only role and approval status fields; it does not validate direct changes to sensitive KYC, vehicle, payment, address, or provider fields. Those need separate column grants and policies.

## Risk analysis
- GUC authorization design is a concern because the trigger trusts a custom setting. Static review alone cannot establish if arbitrary authenticated clients can set this value through available PostgREST/API surfaces; no controlled bypass attempt was performed.
- Registration RPC validation is a positive control, but role/approval authorization should not rely on an externally caller-settable GUC. Recommend redesign so the trigger recognizes a trusted transaction context that is not writable by ordinary clients, or remove the bypass and make privileged registration updates occur through a narrowly scoped trusted function with explicit trigger-safe design.
- SECURITY DEFINER function's empty search_path is a positive setting; ensure every object is schema-qualified.
- GUC value is transaction-local, limiting persistence, but not by itself proof that it cannot be forged in a client SQL session.

## Planned tests (QA fake accounts only)
1. Customer direct REST update role='driver' → deny.
2. Customer direct REST update driver/partner approval → deny.
3. Customer tries setting custom GUC then updating role via any exposed SQL/API path → deny; if path cannot set custom GUC, document limitation and test registration RPC only.
4. Customer registration RPC with valid driver/partner payload → pending state only, no approval.
5. Registration RPC with invalid role, malformed JSON, wrong QR path, invalid phone, missing fields → reject and profile remains unchanged.
6. Admin approval RPC: non-admin deny; verified admin allow; decision allowlist enforced.
7. Direct profile edits to KYC fields and approval flags: privilege/policy restrictions checked field-by-field.

## Status
Static function/trigger source review complete. No runtime exploit test, profile mutation, SQL migration, or DDL executed. QA currently has no profiles; controlled fake-account test requires approval and setup.