# Phase 13 — Fresh QA Security Review (2026-11-25)

## Scope
- Repository: `ginniprasanthsuji-ops/friend-ride-`
- Branch: `arjuna-x/phase-13-feature-audit`
- Database: dedicated `FRIEND RIDE QA` project only
- Production/main project was not queried or modified.
- Planning/checklist **88%**, overall audit **12%**, and progress graph remain frozen.

## Verified checks
- Public tables: **39**; RLS enabled: **39**; RLS disabled: **0**.
- Direct authenticated self-insert into `admin_users`: **PASS — RLS rejected it** (despite table grants).
- Authenticated profile role change customer → admin: **PASS — trigger rejected privileged-field change**.
- Non-admin `admin_review_driver`: **PASS — denied**.
- Non-admin `fr_admin_review_partner`: **PASS — denied**.
- Non-admin `fr_admin_post_earnings_ledger`: **PASS — denied**.
- All test fixtures and writes were inside transactions and rolled back.

## Hardening applied in QA
A QA-only migration pins these SECURITY DEFINER functions to empty `search_path`:
- `fr_admin_confirm_pending_earning(uuid)`
- `fr_admin_post_earnings_ledger(...)`
- `fr_get_my_earnings_balance()`
- `fr_create_notification_preferences_for_new_user()` (trigger)
- `qa_guard_profile_privileged_fields()` (trigger)

The migration was applied to the dedicated QA database and the function configuration was read back; all five show `search_path=""`. No function bodies or data were changed by this hardening.

## Advisor notes
- Supabase security advisor still lists **47** authenticated-callable SECURITY DEFINER functions. This generic warning is not itself proof of a vulnerability; admin-related RPCs inspected here enforce `admin_users` checks.
- One anon-callable SECURITY DEFINER function, `fr_public_homepage_feedback()`, intentionally returns only published homepage feedback, a bounded display name, rating/message/date, and at most 20 rows. Public exposure should remain a reviewed intentional surface.

## Not covered yet
Core ride/payment/QR authorization and workflow tests; catalogue/cart/order backend; home-service workflow; referral/Flash Sale/ERS-RRS integration; browser regression and real-device OTP/push/GPS/SOS tests. Release remains **BLOCKED / NOT CERTIFIED**.
