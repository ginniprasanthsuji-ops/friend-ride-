# Phase 13C — Sensitive RLS/Privilege Reconciliation Follow-up

**Scope:** Read-only QA Supabase catalog review.  
**Project:** `pqsangtvietawkfgpgfu`  
**Branch:** `arjuna-x/phase-13-feature-audit`

## Frozen progress (unchanged)
- Phase 13C: 91% estimate; no sign-off
- Planning/checklist: 88% FROZEN
- Overall audit: 12% FROZEN
- Phase 13B: 70% FROZEN
- Progress graph: FROZEN

## Reviewed policy groups
Catalog policies include owner/participant/admin scope for profiles, notifications, documents, emergency contacts, SOS, live locations, service bookings/requests, Road Ride, Shared Ride, referral/reward, feedback, and campaign objects. These policy predicates are catalog observations only; runtime access was not tested.

## Potential grant reconciliation findings
Table-level privileges catalog showed broad privilege lists for several sensitive tables:
- anon: broad DELETE/INSERT/SELECT/UPDATE plus REFERENCES/TRIGGER/TRUNCATE on Shared Ride bookings, events, payments, rides; Road Ride bookings and events.
- authenticated: broad privileges on Shared Ride events and payments; SELECT/DELETE/REFERENCES/TRIGGER/TRUNCATE on Shared Ride bookings/rides, with separate RLS policies in catalog.
- authenticated: broad privileges on profiles, driver documents, driver locations, SOS, and live locations, with owner/participant/admin RLS policies present in catalog.

Important: This does not prove that anonymous or authenticated requests can perform these actions. Effective behavior depends on object type, RLS enabled/forced status, policies, inherited privileges, column grants, and PostgREST/API exposure. However, broad ACLs—especially anon mutation grants on ride/payment-related tables—are a priority to reconcile against intended API access. Recommend least-privilege grants, ideally no anon mutations to sensitive booking/payment/ride objects and only necessary authenticated table/column privileges, through an authorized change process.

## Column privilege notes
The column-level catalog output showed authenticated privileges across sensitive profiles fields (including role/approval/document identifiers and paths) and driver-document review/status columns. These should be reconciled with self-service requirements and admin-only review flows. No runtime testing was done.

## Shared Ride policy concern
Participant UPDATE policy exists for Shared Ride bookings. Because participant qualification alone does not constrain which columns may be updated, reconcile table and column UPDATE privileges plus RPC-only state transitions. The catalog output included broad authenticated DELETE/INSERT/UPDATE-related permissions on related Shared Ride objects; actual effective permissions were not tested.

## Restrictions respected
- QA catalog only; production/main project not accessed.
- No user data rows queried.
- No RPCs, writes, DDL, migrations, deployment, or runtime tests.
- Catalog findings are potential risks, not confirmed vulnerabilities or sign-off.
