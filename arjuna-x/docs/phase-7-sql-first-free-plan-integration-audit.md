# Phase 7 — SQL-first feasibility and legacy integration audit

Date: 2026-11-23

## Free-plan feasibility check
Supabase organization is confirmed tier_free. Read-only database size checks:
- Production friend-ride: 29 MB
- QA FRIEND RIDE QA: 13 MB
These sizes are comfortably below the stated Free database quota of 500 MB per project. This is not a complete capacity certification: egress, storage, function usage, realtime, active users, project pause/backup limitations and workload performance remain to be monitored.

## SQL-first compact backend direction
Prefer existing Supabase PostgreSQL for shared workflow state and logic: tables, indexes, constraints, RLS, reusable SQL/RPC functions, triggers, views, and existing Cron where supported. GitHub remains the source for frontend, tests, and CI. Avoid duplicate workflow implementations and redundant tables. Preserve schema, migration history, user data and existing policies unless an explicit safe migration is reviewed.

## Repository evidence to investigate (not yet runtime verified)
- Release gate documents an active Sms-otp Edge Function and APITXT-related response/log history. This conflicts with the user's approved-provider restriction. Do not assume OTP delivery is compliant/operational; inspect source/config and de-scope external SMS provider if still wired.
- Cashfree/payment references exist in QA/blueprint/source search. Payment gateway processing is disabled by current approved catalog; inspect runtime controls and disable/de-scope from active app without destructive changes.
- WhatsApp references exist in README, SQL contact migration, release gate, and tests. Manual contact-sharing must be distinguished from third-party messaging API; remove external messaging automation/provider if active.
- CIBIL appears in blueprint only from this search. External bureau/credit decisions remain disabled.
- Zoom search returned no matching results. Do not infer integration active.
- Prior Phase 7 dependency catalog already marks external AI, external voice, Zoom, CIBIL/bureau, DigiLocker, external maps/GPS provider, WhatsApp/calling APIs, lender/NBFC APIs, and gateway processing as disabled.

## Safety next actions
1. Inspect source references/config and actual runtime controls for the above integrations.
2. Build a feature-to-table/RPC/RLS inventory and identify duplicate backend logic suitable for SQL consolidation.
3. Make only reversible QA-branch changes, with tests and no production SQL/deploy/merge.
4. Reconcile UI: disabled provider-backed capabilities must be visibly manual/disabled rather than claiming integration.
5. Recheck Free-plan limits with current official docs before launch; the read-only size check alone is not full capacity validation.

No SQL was executed in this audit. No production writes, main merge, or live deployment occurred.

## Source/runtime evidence checkpoint (2026-11-23)
- Root `README.md` explicitly describes SMS OTP, Google Maps point-to-point links, realtime updates while app open, call/WhatsApp links, browser notification permission and a service-worker push handler. It explicitly says closed-app push is not activated and requires a trusted sender/VAPID/subscription setup. These are documentation claims; source runtime and backend behavior still need validation.
- Root `index.html` loads Leaflet from `unpkg.com` and Supabase JS from `cdn.jsdelivr.net`. The CDN dependency itself is an external distribution host and should be assessed against the approved-stack policy. Do not break app initialization by removing dependencies without a replacement plan.
- Release-gate/test documentation says the SMS OTP Edge Function is active and mentions APITXT logs; actual function source path was not available in this branch fetch. Treat SMS delivery as restricted/unverified pending source/config inspection.
- QA test marker for Cashfree confirms the app source is intended to avoid unsafe client-side charging and marks secure payment verification as live-only/blocked. This is not evidence that payment processing is active.
- Existing README contact links are direct call/WhatsApp links, not evidence of a WhatsApp API integration. Manual links are still de-scoped by current feature catalog and should be reviewed as user-visible actions.
- Zoom search returned no matches; no active Zoom integration evidence.

## Phase 7 correction
- A literal escaped newline was introduced in the role-feature matrix source during a prior edit. It has been corrected in commit `689c0325`.
- Role-feature tests now assert distinct unknown-feature denial and disabled external-provider denials in commit `992d9f74`.
- No CI workflow runs were returned for commit `992d9f74`; automated test execution is not verified.

## QA Supabase RLS metadata audit (read-only)
Project: FRIEND RIDE QA (pqsangtvietawkfgpgfu). No SQL mutations were executed.
- 21 public base tables inspected; RLS enabled on all 21.
- RLS is not forced on any listed table (relforcerowsecurity=false); this is not inherently a defect, but privileged bypass roles and function behavior require review.
- Policies inspected for all public tables. Key observed ownership/role constraints: profiles own-row select/update; rides customer-owned insert and customer/assigned-driver select; live-location access limited to ride participants; notifications own-user; bank enquiries and driver documents admin-restricted; provider/service requests have customer/provider/admin scopes.
- 28 public SECURITY DEFINER functions detected. These are high-priority audit targets: verify explicit auth.uid() checks, role/ownership checks, safe search_path, and EXECUTE grants. Metadata alone cannot certify function safety.
- QA tables with RLS enabled but no visible policy in returned policy list were not individually tested for intended access. Table access and function execution behavior remain untested.
- No production RLS inspection or SQL changes in this turn.

## RLS findings / next checks
1. Review SECURITY DEFINER bodies and grants for all 28 functions, beginning with ride participant detail RPCs, admin review, driver registration, service-provider transition and notification claim.
2. Test RLS matrix with actual anon/authenticated roles and test identities (read-only / controlled QA data only): customer, driver, partner, teacher, student, admin.
3. Check profiles UPDATE policy/trigger for privileged role/approval fields; existing QA guard function is present but body and trigger binding need confirmation.
4. Inspect storage bucket policies and private KYC buckets separately.
5. Route runtime must use database-backed identity/role, not client role values alone.

## Selected SECURITY DEFINER function-body review (read-only)
Reviewed definitions for accept_ride, admin_review_driver, fr_register_driver_partner, fr_tasko_provider_transition, fr_laundry_provider_transition, get_ride_customer_details_v2, get_ride_driver_details.
Positive observations in these selected definitions:
- all inspected functions set an empty search_path;
- accept_ride validates authenticated approved driver, active-ride restriction and only accepts an unassigned requested ride;
- admin_review_driver checks membership in admin_users and decision allowlist;
- driver/partner registration requires auth.uid(), validates role/profile input and keeps approval pending;
- TASKO/Laundry transitions require the assigned provider and validate state transitions;
- customer/driver contact detail RPCs require auth and match ride participant + eligible ride status.
Limitations / follow-up:
- This is a selected-body review, not a full review of all 28 SECURITY DEFINER functions.
- EXECUTE grants/ACLs were not checked yet; test unauthorized callers and grants before sign-off.
- Registration RPC accepts sensitive identity fields; confirm KYC document storage/access and data minimization.
- Review all function bodies for safe search_path, role/ownership checks, and privileged writes.
- QA-only, read-only; no schema or data mutations.

## Additional QA SQL audits for Phase 1–7 continuation (read-only)
- Public base-table RLS coverage: 21/21 tables have RLS enabled; 0 are FORCE RLS. Policy counts were returned per table; tables show policies rather than blanket access.
- SECURITY DEFINER ACL metadata: 28 functions. Authenticated EXECUTE appears granted to workflow functions; anon EXECUTE is observed on fr_public_homepage_feedback only. Notification-preference bootstrap, notification-claim batch, and privileged-field guard are not granted to authenticated in the reported ACLs. ACLs are metadata; body review is still required.
- profiles has a BEFORE UPDATE trigger qa_guard_profile_privileged_fields calling qa_guard_profile_privileged_fields(). Trigger presence confirmed; trigger body not yet reviewed.
- Storage buckets query returned no rows in QA project. This is a significant QA readiness concern: confirm whether KYC/profile uploads are expected in this project and whether bucket setup was omitted. No buckets/policies were created.
- Extensions installed: pg_cron 1.6.4, pg_stat_statements 1.11, pgcrypto 1.3, plpgsql 1.0, supabase_vault 0.3.2, uuid-ossp 1.1.
- No data/schema mutation, production query, migration, merge or deployment.
## Priority blockers from this SQL checkpoint
1. QA storage buckets absent (verify project and app environment before considering KYC upload flow testable).
2. Review all SECURITY DEFINER function bodies and execute ACLs, especially admin and notification workflows.
3. Inspect profile guard trigger function body; test role/approval-field tampering.
4. Run actual auth-role integration tests in controlled QA identities; metadata alone does not prove behavior.

## Selected full SECURITY DEFINER pass + profile guard review (QA, read-only)
Reviewed definitions for all 28 SECURITY DEFINER public functions in QA, plus exact Storage bucket state and profile guard trigger.
Positive checks observed:
- Most workflow functions use empty search_path and fully-qualified public objects.
- Admin review/list functions check admin_users membership.
- Ride accept/counter-offer/start/complete enforce approved-driver identity, ownership, or state predicates.
- Service-request creation checks customer role, active category, input bounds, and provider approval/availability.
- Provider transition functions verify assigned provider and transition states.
- Customer/driver ride detail RPCs match authenticated participant and eligible ride states.
- Notification claim function is granted to service_role only; public feedback RPC is anon-readable but filters to published homepage feedback.
- Profile trigger exists and checks role/approval field changes, but a high-priority bypass concern follows.
## HIGH-PRIORITY REVIEW FINDING — custom GUC bypass candidate
qa_guard_profile_privileged_fields() trusts current_setting('app.friend_ride_role_registration', true) matching auth.uid() as a bypass for role/approval fields. fr_register_driver_partner sets that custom GUC. PostgreSQL custom GUCs may be user-settable by clients; if authenticated users can set the same GUC themselves, they could potentially bypass the guard via direct profile UPDATE. This is not confirmed exploit-tested; mark HIGH PRIORITY and require controlled QA verification and a safer registration authorization mechanism before sign-off. Do not patch production.
Other observations:
- Guard function uses search_path='public' (rather than empty); its referenced table is schema-qualified. Still review hardening.
- QA Storage buckets query returned no buckets; app's KYC upload flow cannot be verified in this QA project until setup discrepancy is resolved.
- Nearby-driver function exposes online approved driver coordinates within requested radius (max 15 km) to authenticated customer/admin; confirm this is required and minimize precision/retention.
- Function body/ACL metadata checks are not equivalent to role-based live tests. No exploitation or data modification performed.

## Continued SQL checks: ACL resolution, cron, constraints and indexes (QA read-only)
- Resolved ACL OIDs: 16384=postgres, 16480=anon, 16481=authenticated, 16482=service_role.
- Most reviewed SECURITY DEFINER RPCs have EXECUTE for postgres/authenticated/service_role. Exceptions: notification-preferences trigger function and notification claim batch only postgres/service_role; profile guard postgres/service_role only. Homepage feedback is also anon EXECUTE, but function filters to published homepage feedback.
- QA cron contains one active job: fr-hourly-notification-enqueue, hourly at minute 0 UTC. It queues hourly notification events for opted-in users while applying quiet-hours logic; it does not itself demonstrate push delivery. Delivery provider/API remains disabled/deferred under current constraints.
- Notification queue has category/status checks, unique event_key, FK user_id->auth.users ON DELETE CASCADE; indexes for claim/status and user timeline.
- Key inspected tables have baseline indexes: rides customer/driver/status-created; service requests customer/provider; driver docs unique driver+type and storage path. fr_service_bookings shows only primary-key index in this summary; query-path index adequacy should be checked against workload before suggesting DDL.
- No changes to DB, policies, grants, cron, or data were made.
## Remaining follow-up
1. Controlled QA test for custom-GUC profile guard bypass, with disposable test account and rollback-safe approach; do not execute until explicitly approved.
2. Resolve missing QA Storage buckets/environment discrepancy; no bucket creation without approval.
3. Verify hourly enqueue idempotency/quiet-hours edge cases and inspect status backlog counts read-only.
4. Review authenticated RPC grants and test actual role behavior; catalog ACL alone is not live security testing.
