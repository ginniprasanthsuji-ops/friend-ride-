# Phase 7 — Remediation Package Review (Not Applied)

## Package 001 — broad non-row-filtered privileges
Existing proposal 001 removes authenticated TRUNCATE/TRIGGER/REFERENCES across public tables. This is the strongest low-risk first-stage candidate, but still requires QA workflow validation and explicit approval before application. It intentionally leaves SELECT/INSERT/UPDATE/DELETE grants unchanged pending per-table review.

## Package 002 — sensitive direct-write permissions (design only)
Do not apply column-only REVOKEs while authenticated retains broad table-level INSERT/UPDATE; table-level privileges can still permit those writes. Correct migration pattern must first remove table-level grants for each target table, then re-grant a reviewed allowlist of columns or use RPC-only writes. The complete column allowlist cannot yet be safely authored because frontend call-sites, full table column inventory, and migration lineage are not fully reconciled.

### Profiles — target design
- Direct client writes: only ordinary self-profile fields proven needed by UI.
- Role and approval status: validated registration RPC/admin-only path.
- Aadhaar/license numbers and document paths: secure onboarding path; direct client update restricted.
- Ensure registration trigger/GUC guard cannot be client-controlled to bypass role protections.

### Rides — target design
- Client insert: customer UID must be auth-derived; only pickup/drop, service type and request data allowed by validated booking path.
- Client update: lifecycle status, driver assignment, agreed fare, completion timestamps must not be directly mutable; use existing workflow RPCs.
- Confirm direct frontend writes are not still required before revoking/regranting.

### Driver locations — target design
- Client identity must be derived from auth UID, never payload driver_id.
- Only necessary coordinate/online fields writable; validate approved driver and own-row policy.
- Ensure updated_at server controlled or bounded policy.

### Ride notifications — target design
- Server-owned: user_id, ride_id, title, message, created_at.
- If client read operation needed, allow only is_read/read_at update after row ownership policy.
- Remove direct INSERT if server/RPC creates notifications; confirm frontend call sites first.

## Pre-apply gate
1. Full frontend source search for direct writes to these tables and RPC call sites.
2. QA migration history reconciliation and backup/rollback plan.
3. Full column inventory and current effective table/column grants.
4. QA disposable test accounts: customer, approved driver, pending driver, partner, admin, anonymous.
5. Explicit user approval.

## Post-apply test matrix
- Role/approval spoof attempts via direct INSERT and UPDATE.
- Cross-user profile/ride/location/notification access.
- Ride direct status/driver/fare mutation bypass.
- Notification spoofing (target user/title/message/ride ID).
- Driver location UID and coordinate spoofing.
- Workflow regression through intended RPC/UI.
- Effective grants, RLS, and default privileges recheck.

Status: static package review only. No SQL executed; no database objects or data changed. QA branch only; production untouched.