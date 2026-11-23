# Phase 7 — R1 TASKO Admin Write Authorization Audit

Branch: `arjuna-x/phase-7-ai-intelligence-safety`
Scope: static source and migration review only. No database, Storage, payment, OTP, or production actions performed.

## Findings

### R1-A: TASKO booking assignment — direct client update
`frAdminAssignTasko(id)` checks `currentProfile.role` and `selectedRole` in the browser, then directly updates `fr_service_bookings` with `assigned_provider_id`, `quoted_amount`, `status='assigned'`, and `updated_at`.

The UI guard is not database authorization. Assignment must be protected by a server-side admin check and constrained to TASKO booking records, approved provider IDs, and the quote range ₹150–₹400.

### R1-B: TASKO application review — direct client update
`frAdminReviewTaskoApplication(id,status)` uses browser-only admin checks, then directly updates `fr_service_provider_applications` including status, reviewer ID, and timestamps.

The database/RPC must verify admin identity, permitted status transitions, and reviewer identity server-side.

### R1-C: TASKO booking status — direct client update
`frAdminSetTaskoStatus(id,status)` checks the browser role and an allowed status list, then directly updates `fr_service_bookings.status`. A client-side allowlist is not an authorization boundary and does not validate the booking lifecycle or service type.

### R1-D: TASKO payment verification — existing RPC boundary
`frAdminVerifyTaskoPayment(id,decision)` calls `fr_tasko_admin_verify_payment`. The reviewed migration defines a SECURITY DEFINER RPC with an `admin_users` identity check and only accepts `verified`/`rejected` decisions for submitted TASKO payment records. This is a stronger existing pattern, but runtime tests and deployed migration verification remain outstanding.

### R1-E: TASKO admin listing
`frAdminLoadTasko()` has a browser-side role guard and reads applications/bookings. Data access must still be governed by database RLS and verified admin identity.

## Safe remediation order

1. Confirm the existing deployed schema/migrations and admin authorization helper patterns without executing SQL.
2. Design narrowly scoped admin RPCs for assignment, application review, and booking status transitions, each with server-side admin verification and lifecycle constraints.
3. Add QA tests for unauthorized rejection, allowed admin transitions, invalid provider/status/quote, non-TASKO records, and no unintended row changes.
4. Only after contracts and tests are reviewed, implement client calls against verified RPC names.
5. Obtain explicit approval before applying any database migration or changing live grants/policies.

## Evidence limits

This is a static source audit. It does not prove deployed RLS, grants, RPC definitions, authenticated behavior, or runtime security. No security certification/release approval is implied.
