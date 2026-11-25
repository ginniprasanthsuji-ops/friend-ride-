# Phase 13 — Supabase QA Read-only Security Audit

Date: 2026-11-26
Project: FRIEND RIDE QA (`pqsangtvietawkfgpgfu`)
Scope: Read-only schema, security/performance advisors, SECURITY DEFINER RPC grants/definitions, and selected RLS policies.
Production project was not modified.

## Advisor snapshot
- 1 anonymous-executable SECURITY DEFINER RPC warning: `public.fr_public_homepage_feedback()`.
- 47 authenticated-executable SECURITY DEFINER RPC warnings. This is an advisor exposure count, not 47 confirmed vulnerabilities.
- Performance advisor: 32 unindexed foreign keys (INFO), 48 auth RLS initplan warnings (WARN), 18 unused indexes (INFO), 9 multiple permissive policies (WARN).

## Positive controls observed (sampled)
- Admin listing/review RPC examples check membership in `public.admin_users`.
- Driver ride accept/counter-offer RPCs check approved driver role/status.
- Customer ride update RPC examples scope mutations by `customer_id=auth.uid()`.
- SECURITY DEFINER functions generally set an empty search_path.
- `admin_users` table RLS is enabled; observed SELECT policy permits authenticated users to read only their own membership row.
- `fr_driver_documents` policies include owner/admin read and own pending-document write conditions.
- `fr_earnings_ledger` read policy scopes owners or admins.

## Items requiring targeted follow-up
1. Review `fr_public_homepage_feedback()` output fields and intended public visibility. It is callable by anon and authenticated; it exposes public-feedback rows and display name/message fields.
2. Review the 47 authenticated-callable SECURITY DEFINER functions individually. Advisor warnings are exposure flags; sampled definitions contain authorization checks, but this audit is not a complete semantic proof.
3. Inspect/verify the profile privileged-field guard trigger is enabled and attached to `profiles`, because the own-profile UPDATE policy exists. Trigger logic was visible in sampled function inventory and checks role/approval-field changes for non-admins.
4. Review public customer listing RPCs for minimization: approved provider/store listing functions return phone/address/coordinates as part of customer-facing discovery. Confirm these fields are intentionally public.
5. Performance remediation should be separate from security fixes: indexes, auth RLS initplan rewrites, multiple permissive policy consolidation. No changes made.

## Status
Read-only audit completed for this snapshot. No SQL changes applied. No runtime authorization tests were performed. Production untouched.
