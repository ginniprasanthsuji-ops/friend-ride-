# Phase 13C — Public Road Ride View Security/Privilege Follow-up

**Scope:** QA Supabase catalog-only review; no row reads, mutations, RPC execution, DDL, migrations, deployment, or runtime tests.
**Project:** QA project `pqsangtvietawkfgpgfu` only.
**Object:** `public.fr_road_rides_public`.

## Catalog observations
- View catalog metadata reports `security_invoker=true`.
- View definition selects public listing fields from `fr_road_rides` and filters `status='live'`.
- Selected fields include ride ID, route labels/note, pickup radius, departure/cutoff, fare, status, timestamps, driver display name, and phone_verified.
- Column-privilege catalog output shows column-level privileges for both `anon` and `authenticated` across the view's exposed columns, including SELECT and also INSERT, UPDATE, REFERENCES entries. These catalog entries require reconciliation with view/table grant semantics and the view's updatability; they do not establish successful mutation or exploitable access.
- The table-level grant query returned no rows in the displayed result; column-level grants are nevertheless present. Confirm exact effective privileges and whether these column ACLs are meaningful for this view in a separate authorization review.

## Risk / follow-up
- **High-priority ACL reconciliation:** confirm intended public listing access is SELECT-only, verify effective privileges using role-aware checks, and determine whether the view is automatically updatable or any mutation path exists.
- Confirm `security_invoker=true` ensures underlying `fr_road_rides` RLS/grants are applied as intended.
- Check whether `phone_verified` is an appropriate public listing field; avoid exposing direct phone/contact information in public LIVE listings.
- Runtime negative tests (anon/authenticated unauthorized INSERT/UPDATE/DELETE) are required before any security sign-off; none were run.

## Audit status
Catalog-only finding recorded. No remediation applied. Phase 13C remains incomplete; frozen Phase 13B 70%, Planning/Checklist 88%, Overall Audit 12%, and progress graph remain unchanged.
