# Phase 13B — Effective Grants Reconciliation

Date: 2026-11-26. QA read-only catalog audit.

## Effective table privilege results (`has_table_privilege`)
Across all four Shared Ride tables, anon has SELECT/INSERT/UPDATE/DELETE/TRUNCATE = true. This is a broad direct-grant exposure irrespective of RLS.
- authenticated: rides/bookings SELECT true, INSERT/UPDATE false, DELETE/TRUNCATE true.
- authenticated: events/payments SELECT/INSERT/UPDATE/DELETE/TRUNCATE all true.

## Information-schema column grants
- anon has column-level INSERT/SELECT/UPDATE/REFERENCES on every column for all 4 tables: rides 17, bookings 13, events 7, payments 12 columns.
- authenticated has column-level SELECT/REFERENCES across all columns of rides/bookings; events/payments have column-level INSERT/SELECT/UPDATE/REFERENCES across all columns.
- Column privileges do not replace table-level privileges; both sets were inspected separately.

## Privilege surface summary
| Table | anon effective table DML | authenticated effective table DML | authenticated column grants |
|---|---|---|---|
| fr_shared_rides | INSERT/UPDATE/DELETE + TRUNCATE | DELETE + TRUNCATE (INSERT/UPDATE false) | SELECT/REFERENCES on all 17 columns |
| fr_shared_ride_bookings | INSERT/UPDATE/DELETE + TRUNCATE | DELETE + TRUNCATE (INSERT/UPDATE false) | SELECT/REFERENCES on all 13 columns |
| fr_shared_ride_events | INSERT/UPDATE/DELETE + TRUNCATE | INSERT/UPDATE/DELETE + TRUNCATE | INSERT/SELECT/UPDATE/REFERENCES on all 7 columns |
| fr_shared_ride_payments | INSERT/UPDATE/DELETE + TRUNCATE | INSERT/UPDATE/DELETE + TRUNCATE | INSERT/SELECT/UPDATE/REFERENCES on all 12 columns |

## Interpretation / priority
- The anon effective table grants are confirmed. RLS does not make direct table privileges disappear; RLS filters row access but is not a substitute for grant revocation.
- Authenticated DELETE/TRUNCATE effective grants are confirmed on all four tables, with direct INSERT/UPDATE also confirmed on events/payments.
- Prior ACL drafts target revocation, but remain unapplied. Do not apply until runtime/source dependency mapping is reconciled, because current branch snapshot lacks Shared Ride runtime client code.
- Direct booking/ride INSERT/UPDATE table privilege false for authenticated, despite permissive RLS policy expressions. Thus policy expression concerns are conditional on any column-level or alternate grant path; authenticated direct DELETE/TRUNCATE are still effective.
- No destructive/runtime test performed; no live data read.

## Next safe remediation sequence
1. Confirm anon/authenticated grant origins and whether PUBLIC grants contribute.
2. Capture exact grant/revoke SQL in a reversible reviewed draft and identify function-based app paths.
3. Reconcile deployed client/build source.
4. Apply only after explicit authorization; test QA fixtures first.

No SQL applied; Main/Production untouched. Phase 13B remains 70%.
