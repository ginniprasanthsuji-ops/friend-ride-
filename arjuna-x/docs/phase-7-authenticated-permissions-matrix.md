# Phase 7 — Authenticated Permission Matrix (QA Catalog Evidence)

**Status:** read-only inventory; proposed fixes only. QA database contains zero test records in key workflows, so runtime role checks are unverified.

## Catalog snapshot

| Area | Observed authenticated grants | RLS / runtime evidence | Review status |
|---|---|---|---|
| profiles | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | Own-row SELECT/UPDATE and own-row INSERT policies; admin driver-profile read policy. Trigger guard present but custom-GUC bypass concern remains. | HIGH: tighten grants, sensitive columns, and test role guard |
| rides | broad table grants including TRUNCATE | RLS enabled; policy/function review previously done; no QA data | HIGH: remove TRUNCATE; runtime tests pending |
| driver_locations / ride_live_locations | broad table grants incl. TRUNCATE | RLS enabled; location exposure needs precision/retention review | HIGH: sensitive location data |
| fr_driver_documents | broad table grants incl. TRUNCATE | RLS enabled; storage bucket inventory mismatch (no buckets found) | HIGH: KYC document storage path and access verification blocked |
| fr_service_requests / fr_service_bookings / fr_service_providers | broad grants incl. TRUNCATE | RLS enabled; zero QA rows | HIGH: test customer/provider/admin boundaries |
| notification preference/token/subscription tables | broad grants incl. TRUNCATE | RLS enabled; queue and cron catalog audited, push delivery unverified | HIGH: device-token privacy and grant minimization |
| fr_notification_events | SELECT-only table grant | RLS enabled, queue-related policies reviewed | lower direct DML risk; confirm reads are user-scoped |
| admin_users | broad table grants incl. TRUNCATE | RLS enabled; admin membership checks reviewed | CRITICAL: ensure client role cannot mutate admin membership |

## Proposed permission strategy (not applied)

1. Revoke TRUNCATE, TRIGGER, REFERENCES from authenticated on public tables (proposal file arjuna-x/sql/phase-7/001_authenticated_privilege_tightening_proposal.sql).
2. Build table-by-table grant allowlist. Preserve only necessary SELECT/INSERT/UPDATE/DELETE and rely on RLS plus validated RPCs for ownership/role boundaries.
3. Remove direct authenticated mutation grants from admin membership tables; only admin-validated server/RPC flow should manage membership.
4. For profiles, move sensitive fields (Aadhaar, license identifiers, KYC paths, approval state) behind explicit column privileges or secure RPCs; avoid broad direct profile SELECT grants to admins where not needed.
5. Run disposable QA role tests (customer, driver pending/approved, partner pending/approved, admin, anonymous) using fake data; test cross-user reads/writes, role escalation, approval bypass, delete, and TRUNCATE denied.
6. No changes to production, no migrations applied, no data deletion, no external providers.
