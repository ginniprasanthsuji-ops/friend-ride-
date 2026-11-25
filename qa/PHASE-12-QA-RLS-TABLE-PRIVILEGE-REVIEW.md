# Phase 12 — RLS Policy + Table Privilege Review (Read-only)

**QA project:** pqsangtvietawkfgpgfu  
**Branch:** phase-12-implementation-plan  
**Method:** pg_policies + information_schema.table_privileges catalog queries. No table data read, no writes, no migrations, no production changes.

## RLS policy observations
Reviewed policy definitions for profiles, rides, driver_locations, service requests/bookings/providers, support feedback, notification events, and admin_users.

- `profiles`: own SELECT/UPDATE/INSERT policies; admin SELECT policy limited to driver profiles. Profile update policy itself is row-level (own row); privileged-field protection relies additionally on trigger logic previously reviewed.
- `rides`: authenticated SELECT limited to customer or assigned driver; INSERT policy checks customer_id=auth.uid(). UPDATE/DELETE policy not present in snapshot.
- `driver_locations`: ALL policy scopes rows to driver_id=auth.uid(); check restricts online status to approved drivers. This is row-level only.
- `fr_service_bookings`: SELECT parties/admin; INSERT customer-owned with pending/not_due initial state; UPDATE admin policy observed.
- `fr_service_requests`: SELECT customer, assigned provider owner, or admin; INSERT customer-owned requested/unassigned; UPDATE admin policy observed.
- `fr_service_providers`: admin ALL; SELECT approved, owner, or admin.
- `fr_support_feedback`: own/admin SELECT; INSERT own with new status, homepage false, admin_note null; admin UPDATE.
- `fr_notification_events`: own-user SELECT.
- `admin_users`: self SELECT only.

## High priority table-privilege finding

The `information_schema.table_privileges` snapshot shows authenticated has broad table privileges on multiple RLS-enabled tables, including `TRUNCATE`, `DELETE`, `INSERT`, `UPDATE`, and `SELECT` for:
- profiles
- rides
- driver_locations
- fr_service_bookings
- fr_service_requests
- fr_support_feedback

**Critical review point:** PostgreSQL RLS does not govern TRUNCATE. Authenticated TRUNCATE privilege can therefore be destructive and is not made safe by row policies. The catalog snapshot reports the privilege; runtime/effective privilege verification is still needed. Review and revoke unnecessary TRUNCATE/DELETE/REFERENCES/TRIGGER privileges from authenticated via a migration, preserving only required table/column permissions. Do not execute changes in this audit.

## Required remediation gate (not performed)
1. Verify effective privilege with `has_table_privilege('authenticated', ...)` for each table.
2. Remove unnecessary broad grants; especially TRUNCATE and DELETE.
3. Prefer explicit grants by operation and column where needed.
4. Re-check policies and security-definer RPCs after grant changes.
5. Role-based runtime QA with separate accounts and test fixtures.
6. SQL migration must be reviewed and explicitly approved before apply.

**Status:** static catalog finding. No exploit attempt, no runtime test, no PASS certification.
