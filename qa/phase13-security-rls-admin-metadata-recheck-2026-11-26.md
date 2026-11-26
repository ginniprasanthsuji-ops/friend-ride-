# Phase 13 QA — Security/RLS/Admin Role Metadata Recheck (2026-11-26)

Scope: QA branch source `arjuna-x/phase-13-feature-audit` and QA Supabase project `pqsangtvietawkfgpgfu` only. Production/Main untouched. Read-only catalog/function metadata review; no live user-data tests, writes, migrations, or policy changes.

## Access confirmed
- Repository source `index.html` fetched from the QA branch (approximately 1 MB).
- QA Supabase SQL metadata query access confirmed.
- This confirms source/QA access is available; work is not blocked on source availability.

## Table security metadata
- All 39 public base tables in the QA catalog report RLS enabled.
- FORCE RLS is false for all 39 tables (metadata). This is not by itself a client exploit, but is a privileged-owner/bypass hardening note.
- Anon table privileges were found on referral-related tables and Shared/Road Ride tables, and on store campaign tables. Policies are predominantly scoped to authenticated role. The active store-campaign SELECT policy explicitly allows anon but restricts to active, approved, current-window rows.
- For these anon-granted tables, metadata shows RLS policies with role `authenticated` only, except the store campaign public-read policy. Thus anon grants alone do not establish data exposure; policy-effective behavior was not tested. Review least-privilege grant cleanup separately.
- No anon EXECUTE grants on sampled admin functions. Authenticated EXECUTE exists, with function-level admin guards reviewed below.

## Admin/security function definition review
Definitions inspected:
- `admin_list_driver_applications`, `admin_list_driver_documents`, `fr_admin_list_partner_applications`: explicit `admin_users` membership guard.
- `admin_review_driver`, `admin_review_driver_document`, `fr_admin_review_partner`: explicit admin guard, decision allowlists, scoped role/document update.
- `fr_admin_assign_service_provider`: admin guard and requires approved, online, category-matched provider.
- `fr_admin_confirm_pending_earning`, `fr_admin_post_earnings_ledger`: admin guard, pending-credit/ledger validations, idempotency-key handling.
- `fr_admin_verify_and_reward_referral`, `fr_customer_referral_admin_review`: admin guard, lock/referral-state/eligibility checks and idempotent reward insert pattern (for the former).
- `is_friend_ride_admin`: SECURITY DEFINER predicate checks admin_users membership by auth.uid().

Sampled functions are SECURITY DEFINER and use empty search_path setting. Definition inspection is static; guards have not been runtime tested with non-admin/admin identities.

## Risk notes / unverified
1. RLS is enabled on all 39 public tables, but FORCE RLS is 0/39.
2. Anon privileges exist on a subset of tables with authenticated-only policies; effective anon denial was not tested. Consider least-privilege revoke/grant review with migration owner, without changing QA/production in this audit.
3. Admin function checks are present in sampled definitions; no admin test identity exists in the QA project handover, and no impersonation/negative authorization test was run.
4. No policy DDL, data writes, migrations, or runtime access probes performed.

## Frozen progress
Planning/Checklist 88% frozen; Overall Audit 12% frozen; progress graph frozen. Phase 13C progress remains frozen at 91%.
