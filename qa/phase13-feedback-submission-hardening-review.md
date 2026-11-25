# Phase 13 — Feedback Submission Hardening Review

Date: 2026-11-26
Branch: arjuna-x/phase-13-feature-audit
Read-only Supabase QA inspection.

## Submission path observed
Authenticated feedback INSERT policy requires:
- `user_id = auth.uid()`
- `show_on_homepage = false`
- `status = 'new'`
- `admin_note IS NULL`

This protects initial submission from self-publishing and setting admin notes.

## Database constraints snapshot
- `kind`: CHECK restricted to `complaint` or `feedback`.
- `ride_id`: FK to rides, ON DELETE SET NULL.
- `user_id`: FK to auth.users, ON DELETE CASCADE.
- `rating`: no CHECK constraint observed in this constraint query.
- `message`: TEXT, no length cap observed.
- `submitter_name`, `submitter_phone`: TEXT columns.

## Hardening recommendation
Review app-level validation for rating range and message size. If not reliably enforced, add database constraints (e.g., rating bounds where rating is required, maximum message length) via a separate approved migration. Do not apply without explicit authorization.

## Assessment
No direct self-publish or admin-note injection path observed in the insert policy. Missing database-level bounds for rating/message are hardening candidates, not confirmed exploit findings. Runtime tests and app-side validation review remain outstanding.
