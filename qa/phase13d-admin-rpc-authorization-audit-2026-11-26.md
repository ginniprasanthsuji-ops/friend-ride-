# Phase 13D Admin RPC Authorization Audit — 2026-11-26

## Reviewed functions
- admin_review_driver
- fr_admin_review_partner
- fr_admin_assign_service_provider
- fr_admin_confirm_pending_earning
- fr_admin_post_earnings_ledger

## Static findings
All reviewed functions are SECURITY DEFINER with empty search_path and explicitly check admin_users membership before privileged mutation.
- Driver decision is restricted to approved/rejected/revoked and updates only driver profiles. Non-approved decisions disable driver's online location.
- Partner decision is restricted to approved/rejected/revoked and updates only partner profiles.
- Service-provider assignment requires admin, request status requested/assigned, and provider approved + online + category match.
- Pending earnings confirmation requires admin and a pending credit; uses idempotency keys for confirmed credit and pending-clear debit.
- Ledger posting requires admin, validates positive amount and role/type/source/status enums, and disallows direct confirmed non-admin-adjustment credits.
- EXECUTE grants to authenticated are guarded inside the function; service_role and postgres also granted.

## Risk / runtime limitations
Static review only. Runtime unauthorized-user tests, decision state transition tests, provider assignment race test, and ledger idempotency/ledger-balance checks require controlled QA identities and fixture records. No fixtures created.

## Scope
Dedicated QA project only. Main/Production untouched.
