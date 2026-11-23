# Phase 7 runtime/route integration audit — checkpoint

## Current evidence
- Phase 7 core feature catalog and identity/role policy helpers exist on this branch.
- Helpers are policy-only and do not establish application route/runtime enforcement.
- GitHub Actions runs have not been returned for recent commits; execution is unverified.

## Required runtime audit
1. Enumerate app routes and screen entry points, grouped by customer, driver, partner, admin, teacher, student.
2. Trace role/session source and verify no client-only role flag can elevate permissions.
3. Check each write/action handler for authenticated identity and ownership checks.
4. Compare application checks with Supabase RLS policies and existing Edge Function authorization.
5. Find references and runtime wiring for disabled provider features: payment gateway, external AI, voice provider, Zoom, CIBIL/bureau, DigiLocker, external map/GPS, WhatsApp/calling, lender/NBFC.
6. De-scope provider integrations from active runtime and user-facing controls without deleting migration history or user data.
7. Verify notification delivery claims: Firebase remains manual/unverified until token storage, sender and permission checks are verified.
8. Add tests for every role-route pair and unauthorized action; run QA tests before claiming completion.

## Read-only SQL inspection (QA only)
Use catalog queries to inspect RLS status and policy metadata; do not mutate schema during the audit:
- public table RLS enabled/forced flags
- policy names, commands, roles, expressions
- triggers and function security-definer metadata
- migration history comparison

## Safety
No production SQL, live deployment, main merge, data deletion, or schema mutation without explicit approval. QA SQL changes only after a reviewed migration plan and verification.
