# Phase 11 — Remediation Priority & Safe Execution Plan
Date: 2026-11-25
Branch: phase-12-implementation-plan
Environment: QA only; production must remain untouched.
Rule: No SQL/schema/ACL change is applied without explicit user approval.

## Order of work

### P0 — Verify QA isolation and backup/rollback readiness
- Confirm app build points only to QA Supabase project.
- Confirm disposable test accounts and role matrix.
- Export/review current ACL, policies, function definitions, and migration ledger as rollback evidence.
- Stop if any configuration points to production.

### P1 — Least-privilege ACL hardening
- Scope tables: profiles, rides, driver_locations, ride_live_locations, fr_ride_sos, admin_users, notification tables.
- Draft privilege matrix per role (anon, authenticated, service_role).
- Remove unneeded table-level TRUNCATE, DELETE, REFERENCES, TRIGGER and broad UPDATE grants.
- Reintroduce only required SELECT/INSERT/UPDATE column or RPC permissions.
- RLS must not be considered a defense for TRUNCATE.
- Approval required before generating/applying final SQL.

### P2 — Profile registration privileged-field authorization
- Replace custom client-settable GUC as sole authorization signal.
- Restrict direct authenticated profile update permissions to allowed customer-editable fields.
- Ensure role, approvals, payout, document paths, business/admin flags are changed only through validated RPC/admin paths.
- Negative tests: forged GUC, direct role change, direct approval change, direct document/payout field update, delete/truncate.
- Positive tests: valid driver/partner registration; normal profile update; approved admin action.
- Approval required for exact migration.

### P3 — Ride and GPS access boundaries
- Require ride participant and active ride-state checks for live location.
- Deny reads/writes after cancelled/completed unless explicitly approved operational exception.
- Set a retention interval and cleanup process; verify deletion/anonymization.
- Test unrelated user, customer, assigned driver, unassigned driver, completed ride, cancelled ride, stale location.

### P4 — Storage/documents
- Create private bucket(s) only after inventory and explicit approval.
- Define owner-prefix and admin-review policies.
- Validate signed URL access and expiry; prevent public bucket exposure.
- Test cross-user document access, path traversal/forged path, and revoked URLs.

### P5 — Admin approval boundaries
- Verify all approval/list RPCs admin-only and sensitive output minimized.
- Add/verify audit history and concurrency protections.
- Test non-admin denied, admin allowed, invalid decision rejected, duplicate/concurrent approval safely handled.

### P6 — Notification/dispatch
- Minimize payloads and keep push tokens private.
- Allow-list action_url destinations.
- Test claim-token replay, stale claims, concurrent claims, batch limit, service-role-only access.
- Confirm client notification preferences and token cleanup.

### P7 — Auth dashboard configuration
- Verify OTP expiry, resend/rate limits, session and refresh-token settings, revocation, phone-change verification, admin MFA, compromised-password protection.
- Do not claim OTP/SMS/push works until real QA-device tests are completed.

### P8 — App QA / role and workflow validation
- Confirm QA Supabase URL/key injection and fail-closed behavior.
- Test Customer, Driver, Partner, Admin dashboards and cross-role access.
- Execute workflows: registration → approval → catalogue → customer view → cart/order; ride request → accept → live tracking → completion → payment confirmation/QR.
- Browser simulation does not replace separate-device OTP, push, or GPS tests.

## Change execution controls
1. User approves a specific remediation scope.
2. Prepare SQL draft and pre/post catalog checks.
3. Review exact SQL before execution.
4. Execute only against QA.
5. Run negative and positive tests with disposable users.
6. Record evidence and rollback steps.
7. Production remains untouched and requires a separate explicit approval.

## Status
Plan documented. SQL changes: 0. Remediation execution: not started. Runtime tests: not run.
