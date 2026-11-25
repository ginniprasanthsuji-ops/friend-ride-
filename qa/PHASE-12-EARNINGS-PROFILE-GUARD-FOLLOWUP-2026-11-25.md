# Phase 12 QA — Earnings & Profile Guard Follow-up
Date: 2026-11-25
Project: QA pqsangtvietawkfgpgfu only. Production untouched.
Review type: Read-only source/grant/trigger metadata review.

## Earnings balance function
- fr_get_my_earnings_balance() is SECURITY DEFINER, search_path=public.
- Owner: postgres.
- EXECUTE grants observed: authenticated, service_role, postgres.
- Query filters ledger rows by owner_id=auth.uid(); this supports per-user balance scoping in source.
- Runtime cross-user isolation testing remains pending.

## Admin pending earning confirmation
- fr_admin_confirm_pending_earning(uuid): SECURITY DEFINER, search_path=public.
- authenticated EXECUTE granted; function checks public.admin_users against auth.uid().
- Confirms a pending credit by idempotency key and inserts a pending debit clearing entry.
- No runtime tests; ledger behavior must be validated with test entries in QA.

## Admin ledger posting
- fr_admin_post_earnings_ledger(...): SECURITY DEFINER, search_path=public.
- authenticated EXECUTE granted; admin membership check is present.
- Validates positive amount, allowed owner roles, entry types, source types and statuses; direct confirmed posting restricted to admin_adjustment.
- Idempotency key conflict handling present.
- Runtime tests and search-path hardening review pending.

## Notification preference initialization
- fr_create_notification_preferences_for_new_user(): SECURITY DEFINER, search_path=public.
- EXECUTE grant observed for postgres/service_role only, not authenticated or anon.
- Source inserts preferences for NEW.id with ON CONFLICT DO NOTHING; trigger is expected to invoke it.
- Trigger/runtime creation-path verification remains pending.

## Profile privileged-field trigger
- Trigger observed: BEFORE UPDATE ON public.profiles, calls qa_guard_profile_privileged_fields().
- Trigger function SECURITY DEFINER; authenticated/anon EXECUTE not granted (trigger execution path).
- Function checks auth.uid(), admin membership, registration transaction setting, and rejects unauthorized role/driver approval/partner approval changes.
- Runtime negative tests and registration-context edge-case tests pending.

## Follow-up
- Hardening review of functions using search_path=public.
- Runtime authenticated negative tests.
- Balance cross-user isolation and pending/confirmed ledger behavior tests.
- Confirm profile trigger and notification-preference trigger installation/path.
