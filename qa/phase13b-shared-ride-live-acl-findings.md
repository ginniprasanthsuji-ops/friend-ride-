# Phase 13B — Shared Ride live ACL exposure capture

**Read-only capture — QA project only — 2026-11-26**

## Scope
Queried information_schema.table_privileges for `anon` and `authenticated` on `fr_shared_rides` and `fr_shared_ride_bookings`, and pg_policies for both tables. No mutation was performed.

## Findings
- `anon` has listed table privileges on BOTH tables: SELECT, INSERT, UPDATE, DELETE, REFERENCES, TRIGGER, TRUNCATE.
- `authenticated` has listed privileges on BOTH tables: SELECT, DELETE, REFERENCES, TRIGGER, TRUNCATE; prior capture also identified direct authenticated insert/update patterns/policies.
- RLS policies currently found: public LIVE/FULL or own driver/passenger SELECT on rides; driver own INSERT/UPDATE; booking participant SELECT; participant UPDATE; passenger INSERT.
- Anon table grants are a material exposure even where RLS may restrict row access. Do not call it exploited; no unauthenticated requests were run.
- Authenticated TRUNCATE grants are not governed by row-level security and are a high-priority ACL remediation candidate.

## Remediation draft
Review/revoke anon ALL privileges from Shared Ride tables and revoke authenticated TRUNCATE, retaining authenticated SELECT under RLS and RPC access as needed. Do not remove authenticated INSERT/UPDATE/DELETE until RPC/UI dependencies and least-privilege behavior are verified. Draft-only, not applied.

## Next validation
1. Re-capture effective grants including inherited/PUBLIC and column grants.
2. Review all four tables: rides, bookings, events, payments.
3. Check direct PostgREST exposure with negative auth tests in isolated QA.
4. Inspect listing select columns and any views for contact-field leakage.
5. Prepare rollback and verify app dependency impact before ACL change.

No SQL applied, no production access, no merge/deploy, no PASS claim.
