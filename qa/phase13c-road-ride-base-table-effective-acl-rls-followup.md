# Phase 13C — Road Ride Base Table Effective ACL & RLS Follow-up

**Scope:** QA project catalog-only inspection; no row access, mutation, DDL, migration, RPC execution, deployment, or runtime testing.
**QA project:** `pqsangtvietawkfgpgfu`
**Object:** `public.fr_road_rides`

## Catalog observations
- RLS is enabled (`relrowsecurity=true`); FORCE RLS is not enabled (`relforcerowsecurity=false`).
- Catalog effective privilege check reports `anon`: SELECT=false, INSERT=true, UPDATE=true, DELETE=true.
- `authenticated`: SELECT=false, INSERT=false, UPDATE=false, DELETE=false.
- One policy observed: `fr_road_rides_live_or_driver_select`, PERMISSIVE, SELECT, role authenticated. Its condition allows live rows, rows where driver_id matches auth.uid(), or rows where `fr_road_ride_is_passenger(id)` returns true.
- The SELECT policy exists but the catalog effective-privilege check reports authenticated SELECT=false, so policy and grant alignment needs reconciliation.
- No policy for anon was shown in the inspected catalog output. This does not prove all possible authorization paths were exhaustively tested.

## Risk and next review
- **High priority:** anonymous INSERT/UPDATE/DELETE privileges are present while RLS is enabled. Review policies and effective authorization behavior to establish whether those grants are intentionally unusable or permit unauthorized operations.
- Reconcile the authenticated SELECT policy with effective table SELECT grants.
- Verify role inheritance and SECURITY DEFINER/RPC paths separately.
- Runtime negative tests are required before security sign-off; none were performed.

## Boundary / status
Read-only catalog finding only; no remediation applied. Phase 13C remains incomplete. Frozen estimates remain Phase 13B 70%, Planning/Checklist 88%, Overall Audit 12%, graph frozen.
