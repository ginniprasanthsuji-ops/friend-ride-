# Phase 7 — Final Column Grant Remediation Review (QA Catalog)

## Confirmed current catalog grants
Authenticated has table-level INSERT/UPDATE/DELETE/TRUNCATE/TRIGGER/REFERENCES on the reviewed core tables, plus broad column-level INSERT/UPDATE grants.

### profiles sensitive column grants
Authenticated INSERT/UPDATE column grants include role, driver_approval_status, partner_approval_status, driver Aadhaar number/document path, driver license numbers/document paths, and profile metadata. Profile trigger guards role and approval status changes for UPDATE, but INSERT paths and custom GUC role-registration bypass require runtime-controlled verification. This is a critical least-privilege gap to address through column-level grant narrowing/RPC-only privileged changes.

### rides sensitive column grants
Authenticated INSERT/UPDATE grants include customer_id, driver_id, status, agreed_fare, fare_offer, notes, completed_at, created_at, updated_at. Workflow RPCs contain state/ownership predicates, but broad direct table grants mean review direct API access and RLS policies together. Potential privilege escalation or workflow bypass is not proven without runtime tests.

### fr_ride_notifications
Authenticated INSERT/UPDATE grants include user_id, ride_id, title, message, is_read, read_at, created_at. Own-row policy may constrain rows, but users may be able to create or edit notification content for themselves; verify intended UI capability and restrict writes to read-state fields if notifications are server-authored.

### driver_locations
Authenticated INSERT/UPDATE grants include driver_id, is_online, latitude, longitude, updated_at. Ensure own-driver identity policy plus approval/role conditions, and prevent clients from changing driver_id or spoofing timestamps/online state. RLS policy catalog and runtime tests are required.

## Proposed least-privilege principles (not applied)
1. Revoke table-level mutation grants from authenticated on core workflow/admin tables, including TRUNCATE/TRIGGER/REFERENCES; retain only necessary SELECT and narrowly scoped INSERT/UPDATE columns.
2. Privileged profile role/status/document fields: write through validated registration/admin RPCs; no direct client column writes.
3. Rides: creation allowlist only customer-owned requested ride fields; assignment/status/fare agreed transitions through validated RPCs; direct client UPDATE on lifecycle fields denied.
4. Notifications: client write limited to read-state fields only, if required; server owns user_id/ride_id/title/message/timestamps.
5. Driver location: driver_id derived from auth UID; clients may update only approved location/online fields and timestamp policy, with role/approval RLS.
6. Reconcile table-level vs column-level grants; column grants can be ineffective where broader table grants remain. Verify effective privileges after migration.
7. Restrict default privileges for future public tables/functions to prevent broad grants from reappearing.

## Safe execution gate
No SQL is included for immediate execution in this document. Build exact migration only after frontend write paths, RPC usage, RLS policies, and current migration history are reconciled. Apply in QA after explicit user approval; then verify effective grants and run two-account tests. Never apply to production from this audit.

## Status
Catalog-only verification. No SQL applied, no data changed, no runtime authorization tests performed.