# Phase 13D QA — Payment Session RLS Optimization (2026-11-26)

QA project: `pqsangtvietawkfgpgfu` only.

Updated policy `fr_ride_payment_sessions_participant_read` to evaluate auth.uid() through scalar subquery:
`customer_id=(select auth.uid()) OR driver_id=(select auth.uid())`.
This follows Supabase RLS performance guidance while retaining participant-only visibility.

Applied and recorded:
- Migration: `supabase/migrations/20261126000300_phase13d_payment_session_rls_perf.sql`
- Commit: `280480d42ec5048c009e651cfae2b76a4558e880`

Runtime cross-user testing remains pending. Production/Main was not touched.
