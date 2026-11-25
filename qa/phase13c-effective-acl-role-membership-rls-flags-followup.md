# Phase 13C — Effective ACL, Role Membership, and RLS Flag Follow-up

**Scope:** Read-only catalog checks on FRIEND RIDE QA Supabase only.  
**Project:** `pqsangtvietawkfgpgfu`  
**Branch:** `arjuna-x/phase-13-feature-audit`  
**Production/Main:** Not accessed.  
**No user rows queried, no writes, migrations, DDL, RPC invocation, deployments, or runtime tests.**

## 1. Effective privilege checks

Targeted `has_table_privilege` checks corroborated broad effective grants:

- Anonymous role: INSERT/UPDATE/DELETE effective privileges are true on Shared Ride rides/bookings/events/payments and Road Ride booking/events tables.
- Authenticated: broad mutation effective privileges are true for Shared Ride events/payments; DELETE true for Shared Ride bookings/rides; INSERT/UPDATE false for those two in this effective snapshot.
- Authenticated: INSERT/UPDATE/DELETE effective privileges true for profiles and driver documents.
- Anonymous mutation privileges are false for profiles and driver documents.

These checks show privileges at the PostgreSQL privilege layer; RLS policies remain a separate enforcement layer.

## 2. Role membership snapshot

Membership catalog shows `authenticator` is a member of `anon`, `authenticated`, and `service_role`; `postgres` has admin-option memberships in these roles. `supabase_realtime_admin` also has memberships in anon/authenticated/service_role. This is a role-routing/admin catalog snapshot and is not evidence of a user-facing privilege escalation.

## 3. RLS flags

All eight reviewed tables have RLS enabled. None has FORCE ROW LEVEL SECURITY enabled. Owners are postgres:
- `fr_driver_documents`
- `fr_road_ride_bookings`
- `fr_road_ride_events`
- `fr_shared_ride_bookings`
- `fr_shared_ride_events`
- `fr_shared_ride_payments`
- `fr_shared_rides`
- `profiles`

RLS not forced means table-owner behavior is a separate consideration; owner-bypass is not a claim about ordinary anon/authenticated API roles.

## 4. Risk and recommended reconciliation

- **High-priority catalog concern:** broad anonymous mutation privileges on ride/booking/event/payment objects.
- **High-priority catalog concern:** broad authenticated mutation privileges on Shared Ride events/payments and profiles/driver documents.
- Verify whether mutations are intended to be exclusively through controlled RPCs or narrowly column-scoped operations.
- Review role/owner/admin exception paths and document why privileged roles need their permissions.
- After approved remediation only, validate cross-user negative cases and runtime behavior; catalog-only review cannot certify security.

## Status

Phase 13C remains **91% estimate (frozen)**. Phase 13B remains locked. All frozen progress metrics and graph unchanged. No ACL changes made.
