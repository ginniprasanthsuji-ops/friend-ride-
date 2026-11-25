# Phase 12 — Ledger Write-Path & Access Review (Read-only)

## Observed main-project findings
- No policies were returned for `fr_v8_order_ledger` by the read-only pg_policies query.
- Table grants inventory returned PostgreSQL privileges for `postgres`; service_role was shown with REFERENCES/TRIGGER/TRUNCATE privileges only. No authenticated/anon SELECT/INSERT/UPDATE grants appeared in the returned inventory.
- Trigger inventory query returned no triggers for the ledger table.
- Searches of information_schema routines and public functions for routine definitions referencing `fr_v8_order_ledger` returned no matches in the inspected results.

## Interpretation / limitations
- The above suggests no visible direct client CRUD grants or table triggers in the inspected metadata; it does not prove there are no ledger write paths in edge functions, application code, private schemas, or other indirect mechanisms.
- No routine writing the ledger was identified from these metadata searches. Therefore the actual ledger event/write path remains unverified.
- The lack of observed RLS policies is not a permission vulnerability by itself if table privileges are restricted, but the table's RLS enabled state and all role grants must be verified with a complete privilege/security audit before relying on this conclusion.

## Implementation requirements before platform fee entries
1. Trace ledger writers across app/backend code and all relevant database functions.
2. Confirm RLS state, grants, service-role usage, and any private-schema functions.
3. Define a stable event key and uniqueness strategy that permits valid multiple entry types for an order/checkout.
4. Insert ledger rows only inside trusted server/database workflows tied to verified payment/order events.
5. Verify atomicity/idempotency under retries and concurrency.
6. Confirm amount_paise sign convention and reference/metadata contract.

Read-only only. No production modifications.