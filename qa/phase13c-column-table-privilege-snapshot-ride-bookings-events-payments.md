# Phase 13C — Table and Column Privilege Snapshot (Ride Booking/Event/Payment Tables)

**Audit mode:** read-only catalog inspection only  
**Project:** QA project `pqsangtvietawkfgpgfu`  
**Production:** not accessed  
**No DDL, writes, row data, RPC calls, or deployment performed.**

## Objects inspected
- `public.fr_shared_ride_bookings`
- `public.fr_shared_ride_payments`
- `public.fr_shared_ride_events`
- `public.fr_road_ride_bookings`
- `public.fr_road_ride_events`

## Catalog findings
Information-schema table privileges and column privileges were queried for `anon`, `authenticated`, and `PUBLIC`.

### Anonymous role (anon)
Catalog output shows broad table-level privileges including DELETE, INSERT, SELECT, UPDATE and additional privileges such as REFERENCES, TRIGGER, and TRUNCATE on the inspected booking/event/payment tables. This includes Shared Ride booking/event/payment tables and Road Ride booking/event tables.

### Authenticated role
Catalog output shows broad privileges on the inspected objects as well, including SELECT plus additional privileges. In particular, authenticated has DELETE on Shared Ride bookings and INSERT/UPDATE/DELETE on Shared Ride events. The table privilege snapshot also reports additional REFERENCES/TRIGGER/TRUNCATE grants.

### Column-level grants
Column privilege inventory confirms grants are present across all columns of the inspected objects (11 columns for Road Ride bookings, 7 for Road Ride events, 13 for Shared Ride bookings, 7 for Shared Ride events, and 12 for Shared Ride payments in the grouped snapshot). These column grants do not appear to narrow the broad table-level grants reported above.

## Risk / interpretation
This is a **high-priority catalog reconciliation finding**: broad mutation privileges granted to `anon` and `authenticated` roles on booking, event, and payment tables should be checked against intended API workflows and policies. Table grants, column grants, RLS policies, role inheritance, object exposure, and RPC authorization must be reconciled together.

Catalog grants alone do **not** establish that a cross-user mutation is exploitable or succeeds at runtime. RLS is enabled on the inspected objects in the prior Phase 13C snapshot; runtime behavior, policy edge cases, and actual API requests were not tested in this read-only audit.

## Recommended follow-up
1. Reconcile intended operations table-by-table and role-by-role.
2. Review anon grants first, especially mutation privileges on booking/event/payment records.
3. Confirm state-changing actions are implemented through narrow authorized RPCs where appropriate.
4. Evaluate whether direct table mutation grants should be revoked or narrowed; do not apply changes in this audit.
5. Require runtime negative tests (unauthorized user, cross-booking user, forged status/payment values, direct API attempts) before security sign-off.

## Status
Catalog finding documented only. No remediation applied. Phase 13C remains incomplete; no sign-off or frozen progress metric changed.
