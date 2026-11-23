# Phase 7 — Frontend Write-Path Reconciliation (Static Source Audit)

**Branch:** `arjuna-x/phase-7-ai-intelligence-safety`  
**Source:** `index.html` on the Phase 7 branch; read-only inspection of client call sites.  
**No SQL executed, no database/storage writes, no live provider calls, no production/main changes.**

## Result

A source scan confirms the earlier privilege-tightening proposal cannot safely be applied wholesale yet. Several direct client writes are present and need migration to RPCs or explicit narrow grants, while role/admin actions are already RPC-backed in some flows. This document records evidence and flags—not changes—those write paths.

## Write-path inventory

| Area | Client write observed | Classification / next gate |
|---|---|---|
| Driver/Partner registration | `fr_register_driver_partner` RPC, followed by direct `profiles.update(registrationPaths)` and direct `fr_driver_documents.upsert` | RPC handles role registration; document/path writes need owner/path validation and direct-write review. |
| Customer registration | Direct `profiles.insert/update` of customer fields and registration paths | Needs exact allowlist; sensitive fields/path restrictions before column-grant remediation. |
| Ride request creation | Direct `rides.insert` with customer_id, pickup/drop, fare_offer, status=requested and optional coordinates | Prefer validated booking RPC or confirm insert RLS/column constraints; direct insert may be a required path. |
| Driver GPS/online | Direct `driver_locations.upsert/update`; direct `ride_live_locations.upsert` | Must ensure UID is auth-derived, approved-driver condition, participant/destination-ride checks, coordinate bounds and lifecycle. |
| Customer live GPS | Direct `ride_live_locations.upsert` after customer-owned ride lookup | Client lookup is not authorization; RLS must enforce ride participation and prevent retargeting. |
| SOS | Direct `fr_ride_sos.insert` with ride ID, sender ID, coordinates | RLS must bind sender to auth.uid() and ride participation; sender field must not be trusted alone. |
| Notification read | Direct update only `is_read/read_at` filtered by user_id | Good candidate for narrowly scoped UPDATE columns, after confirming both notification tables' effective grants/policies. |
| Push subscription | Direct `fr_push_subscriptions.update/upsert` for endpoint, keys, user ID, activation state | Needs endpoint ownership/conflict semantics and server-side token ownership checks. |
| TASKO booking | Direct `fr_service_bookings.insert` customer request | Candidate for client insert with strict column allowlist and owner/status defaults. |
| TASKO admin assignment/status | Direct admin UI updates to booking assignment/status and provider application status | UI role check is not authorization. Move admin mutation to verified admin RPC or confirm RLS policy proves admin membership. |
| TASKO payment review | `fr_tasko_admin_verify_payment` RPC | RPC-backed; inspect internal admin check and transition constraints. |
| Profile photo | Direct Storage upload followed by direct `profiles.update({photo_path})` | Owner-path and column grant checks required; cleanup is client-attempted and not a security boundary. |
| Admin driver/partner review | Reviewed driver/partner/document decisions mostly RPC-backed | Keep RPC checks and validate negative-role tests; do not add direct DML. |

## Critical reconciliation notes

1. Frontend role checks are UX controls only. Database/RPC authorization must enforce admin, role, owner, participant, approval and workflow-state constraints.
2. The previous broad grant-revoke proposal is only a first-stage candidate for non-row-filtered privileges. Even that must be approved and tested on isolated QA.
3. Sensitive direct-write grants (profiles, rides, locations, SOS, notifications, provider applications, bookings, push subscriptions, documents) must not be narrowed until complete write call sites, column inventory and migration history are reconciled.
4. For client-owned writes, use RPC or a strict column allowlist. Admin-owned mutations should be RPC-only with an internal verified-admin check.
5. Live GPS/SOS requires controlled fake-account tests; no runtime test was run in this audit.

## Suggested next remediation sequence

- **R1:** Move direct admin TASKO booking/application updates to admin-validated RPCs; test non-admin denial and valid admin transitions.
- **R2:** Reconcile registration direct writes (profiles document paths and driver-document rows) with secure registration/document RPCs or narrow policies.
- **R3:** Reconcile ride creation direct insert with a validated booking RPC.
- **R4:** Reconcile live location and SOS participant policies against exact ride lifecycle rules.
- **R5:** Reconcile notification-read and push-subscription direct writes to narrow owner-only grants.
- **R6:** Only then author table-by-table grants migration, apply to isolated QA after explicit approval, and run role regression.

## Evidence boundary

Static source scan only. No claim is made that the live Supabase RLS, RPC, Storage, OTP, push or payment behavior passed. Phase 7 remains a release/security gate, not certification.
