# Phase 12 — Earnings Ledger RLS & Index Audit
Date: 2026-11-25
Environment: QA Supabase project only; production untouched.

## Verified metadata
- RLS enabled; FORCE RLS is not enabled.
- Authenticated role has SELECT only in the table privilege inventory.
- Single SELECT policy permits owner rows or admin_users membership.
- No authenticated INSERT/UPDATE/DELETE policy was returned in policy inventory.
- Service-role privileges include write/delete (expected privileged backend role; credentials must remain server-side).
- Constraints enforce positive amount, INR currency, approved owner roles, entry types, statuses, source types, valid idempotency key length, and uniqueness for idempotency key and source/owner/entry tuple.
- Existing unique indexes cover idempotency key and source/owner/entry tuple.

## QA optimization applied
- Added index `(owner_id, created_at DESC)` for owner history reads.
- Added index `(owner_id, status, created_at DESC)` for owner/status history filtering.
- Both indexes applied to QA and verified in `pg_indexes`.

## Limits
- Metadata audit only. No authenticated runtime role impersonation or transaction-level tests were performed.
- Does not prove frontend balance display or ledger write workflow.
- Production was not queried or modified.
