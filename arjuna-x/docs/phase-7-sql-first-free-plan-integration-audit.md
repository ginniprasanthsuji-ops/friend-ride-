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
