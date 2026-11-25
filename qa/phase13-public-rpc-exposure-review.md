# Phase 13 — Anonymous/Public RPC Exposure Review

Date: 2026-11-26
Branch: arjuna-x/phase-13-feature-audit
Supabase QA project: read-only inspection.

## Anon EXECUTE inventory
The anon role has EXECUTE on:
- `fr_public_homepage_feedback()` — SECURITY DEFINER, intentionally public display RPC.
- `fr_earnings_ledger_immutable()` — trigger function; execution privilege does not imply direct callable behavior (trigger-only context).

No direct anon table grants were observed on `fr_support_feedback`. Table RLS is enabled; table ACL grants access to authenticated/service_role/postgres, not anon.

## Public feedback RPC definition
Returns only:
- ID
- display name (trimmed, capped at 80 chars; fallback FRIEND RIDE Customer)
- rating
- message
- created timestamp

Filter: `kind='feedback'`, `show_on_homepage=true`, `status='published'`; ordered newest first; limit 20. Empty search_path.

## Assessment
Public RPC exposure is bounded by publication/status flags and result count. Direct anon table access is not granted. No confirmed data exposure flaw identified in this review.

## Remaining review consideration
`message` is TEXT with no observed length limit at the column level. Since admin-published entries appear on the homepage, verify submission UI/server-side length validation and consider a database length cap if not already enforced elsewhere. This is a hardening recommendation, not a confirmed vulnerability.

No changes made to SQL, app, or production.
