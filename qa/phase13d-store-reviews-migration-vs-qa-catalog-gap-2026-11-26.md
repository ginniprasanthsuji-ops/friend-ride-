# Phase 13D QA — Store Reviews Migration vs QA Catalog Gap (2026-11-26)

## Scope
Read-only comparison of the Phase 13 store-review frontend, repository migration source, and QA Supabase catalog. No SQL writes or migrations were applied. Production/Main was not touched.

## Evidence
- Frontend source: `assets/phase13-store-reviews.js` submits to `fr_store_reviews`, uses pending moderation, sets `purchase_verified=false`, and calls `fr_store_review_admin_moderate` for admin decisions.
- Repository migration `supabase/migrations/20261125200500_phase13_store_reviews_moderation_foundation.sql` defines the expected table, RLS policies, moderation RPC, and authenticated grant.
- QA catalog read-only checks returned `to_regclass('public.fr_store_reviews') = NULL`, `to_regprocedure('public.fr_store_review_admin_moderate(uuid,text,text)') = NULL`, and zero policies for the table. QA catalog did not contain the store-review foundation.
- Therefore, frontend integration is source-present but cannot be QA-backend verified or exercised against the current QA schema.
- Migration source uses `SECURITY DEFINER` with `SET search_path=public`; it contains explicit auth and `is_friend_ride_admin()` checks, and revokes execute from PUBLIC/anon while granting authenticated. For future hardening, prefer an empty search_path and fully-qualified object names, consistent with other Phase 13D RPC reviews.

## QA disposition
**BLOCKED / NOT BACKEND-READY IN QA CATALOG.** Do not claim store-review submission/moderation runtime success. This is a catalog absence finding, not proof the migration is absent from every environment.

## Recommended next action
In a separately approved QA-only migration step, reconcile the missing store-review migration in the QA project, then re-run read-only table/policy/function/grant checks and authenticated role tests. No production migration is recommended or performed in this audit.
