# Phase 13C — Admin SECURITY DEFINER Authorization Paths Review

Date: 2026-11-26
QA Supabase project: `pqsangtvietawkfgpgfu`
Read-only catalog/function-definition inspection.

## ACL catalog
Admin-named functions reviewed have SECURITY DEFINER, empty search_path configuration, and authenticated EXECUTE grants. Anon EXECUTE was false for returned functions. Because authenticated can execute these functions, each function must perform internal authorization checks.

## Function body findings
Positive evidence from inspected definitions:
- `admin_list_driver_documents()`: checks membership in `public.admin_users` before returning document/profile data.
- `admin_review_driver_document(uuid,text,text)`: checks admin membership, restricts decision to verified/rejected, sets reviewed_by=auth.uid() and reviewed_at=now(), and limits review note length to 500.
- `fr_admin_confirm_pending_earning(uuid)`: checks admin membership and only selects a pending credit entry; uses idempotency keys for confirmed credit and pending clear entries.
- `fr_admin_post_earnings_ledger(...)`: checks admin membership; validates positive amount, owner role, entry/source/status enumerations; blocks directly confirmed non-admin-adjustment sources.
- `is_friend_ride_admin()`: returns whether auth.uid() exists in admin_users.

## Security risk and runtime priorities
1. Test all admin SECURITY DEFINER RPCs with non-admin authenticated user: must reject before sensitive output or mutation.
2. Test admin RPCs with admin session and validate expected workflow.
3. Ensure JWT/session auth.uid() is required and unauthenticated calls fail.
4. Verify admin_users membership cannot be self-added through direct table write or alternate RPC.
5. Verify authenticated execute grants are intended; internal guard is the actual enforcement layer.
6. Check other admin-named functions not inspected in this sample: list-driver/partner application, review driver/partner, provider assignment, referral review/reward.
7. Verify audit trail for privileged state changes.

## Limits
This is catalog ACL and function-definition review only. No function invoked; no runtime results. No mutations, migration, deployment, or production/main access.
