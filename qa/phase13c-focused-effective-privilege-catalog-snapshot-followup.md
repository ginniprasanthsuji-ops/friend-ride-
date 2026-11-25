# Phase 13C — Focused Effective Privilege Catalog Snapshot (Follow-up)

**Scope:** Read-only catalog inspection on the FRIEND RIDE QA Supabase project only.  
**Project:** `pqsangtvietawkfgpgfu`  
**Branch:** `arjuna-x/phase-13-feature-audit`  
**Production/Main:** Not accessed.  
**No user data rows queried; no writes, migrations, DDL, RPC invocation, deployment, or runtime tests performed.**

## Catalog observations

The targeted `information_schema.table_privileges` snapshot confirms:

- `anon` is granted table-level privileges including INSERT, UPDATE, DELETE, TRUNCATE, TRIGGER, REFERENCES, and SELECT on Shared Ride rides, bookings, events, payments, and Road Ride bookings/events (depending on object).
- `authenticated` has broad table privileges on Shared Ride events/payments, and includes DELETE, REFERENCES, TRIGGER, TRUNCATE, SELECT on several Shared Ride tables; Shared Ride events include INSERT/UPDATE/DELETE-related broad grants.
- `authenticated` has broad table-level privileges on `profiles` and `fr_driver_documents`, including DELETE, INSERT, UPDATE, TRIGGER, TRUNCATE, REFERENCES, and SELECT.

## Risk interpretation

These catalog grants are a **least-privilege reconciliation concern**, not proof of exploitable access. Effective risk depends on RLS enabled/forced state, policies, ownership, role inheritance, column-level grants, object exposure, and whether access paths are mediated by RPCs.

## Follow-up priorities

1. Confirm effective ACLs and inherited role membership for each sensitive table.
2. Review whether anonymous grants on booking/event/payment/ride tables are needed at all; public listings should remain read-only and intentionally projected.
3. Narrow authenticated state-changing privileges for Shared Ride bookings, events, payments, and ride tables to the minimum required pathways.
4. Review `profiles` and `fr_driver_documents` column grants, especially approval/review, role, identity, contact, and document-path fields.
5. Verify participant UPDATE policies are complemented by column restrictions or controlled RPC state transitions.
6. Only after authorized remediation, run approved cross-user negative tests and runtime checks; catalog review alone cannot sign off.

## Status

- Phase 13C catalog audit estimate remains **91% frozen as estimate**; no progress value changed by this follow-up.
- Phase 13B remains locked pending Phase 13C completion, reconciliation, and sign-off.
- This is an audit report only; no ACL changes were applied.
