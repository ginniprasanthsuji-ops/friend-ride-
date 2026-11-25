# Phase 13C — Public Ride View Security and Effective Grant Catalog Review

**Date:** 2026-11-26  
**Environment:** QA Supabase project `pqsangtvietawkfgpgfu` only  
**Method:** Read-only catalog queries. No data rows, RPC invocation, writes, DDL, migrations, deployments, or Production/Main access.

## Reviewed object
- View: `public.fr_road_rides_public`
- View owner: `postgres`
- View option: `security_invoker=true`
- View source: `public.fr_road_rides`
- Filter: `status = 'live'`
- Selected fields: id, from_label, to_label, route_note, pickup_radius_km, departure_at, booking_cutoff_at, fare, status, timestamps, driver_display_name, phone_verified.
- No direct phone-number column appears in this view definition.

## Grant observation
Catalog privilege checks report anon and authenticated have SELECT, INSERT, UPDATE, DELETE privileges on this view; information_schema also lists REFERENCES, TRIGGER, and TRUNCATE grants. These are unusual/over-broad mutation grants for a public-facing live-ride view and should be reconciled.

## Underlying RLS observation
The base table `fr_road_rides` has a SELECT policy scoped to authenticated role: live rides, own driver rows, or passenger rows. Catalog does not show a policy for anon or mutation commands on the base table in the inspected output. Because the view uses `security_invoker=true`, underlying access is evaluated using the invoking user's privileges/policies. Catalog-only evidence does not establish whether anonymous view access or view mutation requests succeed; runtime tests are required.

## Risk / follow-up
- **Priority catalog finding:** anon/authenticated mutation grants on `fr_road_rides_public` view despite intended public listing semantics.
- Review/reconcile grants to SELECT-only for public view where appropriate, via authorized change process; do not modify in this audit.
- Confirm column projection and base-table RLS remain the intended privacy boundary.
- Run isolated QA negative tests (anon SELECT, anon INSERT/UPDATE/DELETE; authenticated INSERT/UPDATE/DELETE via view; direct base-table access) only when authorized and with safe test identities. No runtime tests executed in this review.

## Scope
No user rows queried, no changes applied, no app changes, no Production/Main access. Frozen progress values unchanged.
