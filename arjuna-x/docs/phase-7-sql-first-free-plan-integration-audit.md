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
