# Phase 12 QA — Admin Provisioning Review & Negative-Test Plan
Date: 2026-11-25
QA project: pqsangtvietawkfgpgfu. Production untouched.
Status: Documentation/static review only; no tests executed and no schema/code changes.

## Admin provisioning / bootstrap
- QA metadata inspection found only a self-SELECT policy on public.admin_users.
- No INSERT/UPDATE/DELETE policies observed.
- Functions referencing admin_users were reviewed; observed privileged functions check membership using auth.uid().
- Repository keyword search for admin_users produced one relevant migration excerpt but did not reveal a provisioning/bootstrap routine in the search results.
- Therefore, the approved administrator bootstrap/provisioning procedure remains UNKNOWN and must be documented/verified by project owner before release.
- Never expose service_role key to client/frontend. Do not add public admin creation or self-service admin escalation.

## Proposed negative tests (must run in isolated QA with test accounts)
1. Non-admin authenticated account attempts SELECT admin_users: expect only own row or no row.
2. Non-admin attempts INSERT into admin_users: expect denied.
3. Non-admin attempts UPDATE admin_users: expect denied.
4. Non-admin attempts DELETE admin_users: expect denied.
5. Non-admin invokes each admin list/review function: expect authorization exception.
6. Non-admin invokes service-provider assignment: expect authorization exception.
7. Non-admin invokes ledger post/confirm: expect authorization exception.
8. Admin attempts invalid decision strings: expect validation error.
9. Admin posts invalid/nonpositive ledger amount or unsupported role/source/status: expect validation error.
10. Retry an idempotent ledger action with same key: verify only one effective entry.
11. Attempt privileged profile field changes as non-admin outside registration context: expect trigger rejection.
12. Confirm admin provisioning can only be performed by a documented trusted server/database operator process.

## Release blockers / gates
- Document bootstrap method and responsible operator.
- Execute negative tests in QA and record outputs.
- Review SECURITY DEFINER functions using search_path=public and harden only with approved change.
- Verify secrets are server-only.
- Complete real-device OTP, push, location, and payment verification as applicable.
