# Phase 12 QA — SECURITY DEFINER Inventory Checkpoint
Date: 2026-11-25
Project: QA pqsangtvietawkfgpgfu only. Production untouched.
Review type: Read-only metadata/source review. No runtime testing, no schema/code changes.

## Inventory highlights
All reviewed SECURITY DEFINER functions have anon EXECUTE disabled except the explicitly public read function fr_public_homepage_feedback(). Most functions set empty search_path. Functions observed with search_path=public:
- fr_admin_confirm_pending_earning(uuid)
- fr_admin_post_earnings_ledger(uuid,text,text,text,uuid,numeric,text,text,text)
- fr_get_my_earnings_balance()
- fr_create_notification_preferences_for_new_user()
- fr_notification_claim_batch(uuid,integer)
- qa_guard_profile_privileged_fields()

## Function access and checks
- Public homepage feedback function is anon/authenticated executable and is a read-only public feedback listing; its query filters to published feedback and limits to 20.
- Authenticated ride/customer/driver/provider workflow functions were source-reviewed at a high level; many contain auth.uid() checks and role/ownership/state checks.
- Admin SECURITY DEFINER functions require membership in public.admin_users.
- Notification claim function has anon/authenticated EXECUTE disabled; appears intended for trusted worker/backend invocation.
- Profile guard trigger function has EXECUTE disabled for anon/authenticated and runs as trigger.

## Follow-up risk review items (not confirmed vulnerabilities)
1. Review and consider hardening search_path=public functions, particularly admin earnings functions, with approved changes.
2. Confirm public homepage feedback does not expose any unintended personal data. It returns a display name fallback, rating, message, timestamp for published entries; publication consent/data minimization should be checked.
3. Customer-facing approved-store/provider list functions are executable by authenticated users but source excerpts do not show an explicit auth.uid() check. Confirm intended audience and data fields; do not label as vulnerability without full contextual review.
4. Notification claim function service-role/backend execution pathway and credential handling remain to verify.
5. Runtime negative tests and real workflow/device tests remain outstanding.

## Status
Static inventory expanded. Findings documented for next review; release readiness not established.
