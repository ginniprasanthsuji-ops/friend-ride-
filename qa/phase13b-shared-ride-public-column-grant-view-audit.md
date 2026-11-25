# Phase 13B — PUBLIC / column grants / view audit

Read-only QA audit, 2026-11-26. No SQL mutation.

## Table privilege summary
For each of the four Shared Ride tables, anon privileges listed: DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE.
Authenticated:
- fr_shared_rides: DELETE, REFERENCES, SELECT, TRIGGER, TRUNCATE
- fr_shared_ride_bookings: DELETE, REFERENCES, SELECT, TRIGGER, TRUNCATE
- fr_shared_ride_events: DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
- fr_shared_ride_payments: DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
No PUBLIC grantee rows appeared in the queried information_schema.table_privileges result. Treat this as the visible catalog result only; confirm effective inherited grants and role membership separately.

## Column privilege counts
Column-level grant rows returned for anon/authenticated:
- bookings: anon 52; authenticated 26
- events: anon 28; authenticated 28
- payments: anon 48; authenticated 48
- rides: anon 68; authenticated 34
These counts show extensive column grants. They require review, but no column-by-column leakage/exploit test was run.

## Views
No public schema views matching the shared-ride naming pattern were returned by information_schema.views.

## Next
1. Review role membership/inherited grants and effective privileges.
2. Inspect app/API column selection and contact fields, avoiding data reads of actual personal values.
3. RPC dependency map for events/payments writes.
4. Prepare explicit least-privilege ACL proposal plus rollback and staged tests.

No SQL applied; no Main/Production access; no merge/deploy; no PASS claims.
