# Phase 7 — Write-Path Reconciliation & Migration Staging

## Evidence scope
The QA branch repository tree was inspected for currently visible source and migration paths. It contains existing ride-contact and driver-KYC client assets, notification fallback code, and Supabase migration files for TASKO, Laundry, Cycle Delivery, and Learn/Teach. This tree-level check does not prove every client write path has been enumerated; source-by-source call-site review remains required before granting/revoking write privileges.

## Catalog-confirmed risk and staged response

### Profiles
Catalog shows authenticated INSERT/UPDATE grants on role, approval status, Aadhaar/license numbers and document paths, among other fields. Proposed: first inventory profile update call sites; ensure onboarding writes use registration RPC and profile edits use a safe allowlist; then revoke direct sensitive column grants. Keep role/status changes admin/validated RPC-only. Runtime test registration GUC behavior before trusting the trigger guard.

### Rides
Catalog shows direct authenticated INSERT/UPDATE grants for customer_id, driver_id, status, agreed_fare, fare_offer, timestamps, notes. Proposed: inspect all booking/ride workflow call sites and confirm RPCs are used for lifecycle transitions. Direct mutation of assignment/status/final fare should be removed only after call sites are reconciled. Customer ride creation should use an explicit field allowlist.

### Driver locations
Catalog shows direct writes to driver_id, is_online, latitude, longitude, updated_at. Proposed: ensure client insert/update payloads omit driver_id (identity must be auth-derived), and verify policy restricts role/approval and own row. Determine whether online state is managed directly or through a function before narrowing grants.

### Ride notifications
Catalog shows direct writes to user_id, ride_id, title, message, is_read, read_at, created_at. Proposed: if client code only marks read, restrict client update to is_read/read_at; server-owned notification fields should not be writable. Verify any client-created notification use case before removing INSERT.

## Migration staging (proposal only)
1. Source-call-site audit for each table and write path; annotate direct table writes versus RPC writes.
2. QA-only candidate migration: revoke broad authenticated TRUNCATE, TRIGGER, REFERENCES on public application tables, and revoke broad table mutation grants only where call-site inventory confirms safe.
3. Add narrow column-level grants where necessary; remember broad table-level grants supersede narrower restrictions.
4. Sensitive fields remain RPC/admin-owned; review default privileges to prevent future broad grants.
5. Apply only with explicit approval; verify effective privileges via information_schema and pg_catalog.
6. Run role-separated regression (customer, approved driver, unapproved driver, partner, admin, anonymous), cross-user IDOR, role/status mutation, ride lifecycle direct mutation, notification spoof, location spoof, and storage privacy tests.

## Gate
No migration is applied, no SQL is executed beyond read-only catalog inspection, no data changes. QA branch only; production untouched; no merge/deploy. This staging document is not a complete executable migration because source write-path inventory and test accounts/fixtures are not yet verified.