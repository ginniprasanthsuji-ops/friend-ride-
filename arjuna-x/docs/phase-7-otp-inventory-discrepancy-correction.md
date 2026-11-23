# Phase 7 — OTP Inventory Discrepancy Correction

Date: 2026-11-23. QA-only read-only cross-check.

## Correction to earlier checkpoint
The earlier statement that OTP endpoint is “missing/unverified” needs precise wording. QA Supabase live Edge Function inventory currently returns exactly 6 active functions and does not list `Sms-otp`. However, a legacy release-gate document on the repository default branch (audit dated 2026-11-09, branch main, commit 11269614f66b5ff21c361675a14d4791b0ce6cfa) claims `Sms-otp` was ACTIVE and cites APITXT accepted/rate-limit log responses.

The older report is historical evidence, not current QA evidence. The live QA project inventory is the authoritative current deployment inventory for this checkpoint. Therefore:
- `Sms-otp` current QA deployment: not listed / deployment discrepancy.
- Historical main-branch report: claims active on its older audit date.
- Client source still calls `/functions/v1/Sms-otp`.
- Real SMS receipt, current OTP endpoint status, function logs, and authentication runtime remain unverified.
Do not infer that the function is absent from every project or production; only the QA project inventory has been checked.

## Current QA active Edge Function inventory
6 listed: fr-notification-register-token, create-zoom-meeting, fr-notification-dispatch, confirm-zoom-session, create-external-classroom-session, get-zoom-classroom-link.
No `Sms-otp` entry.

## Next evidence needed
- Identify which Supabase project the historical release-gate report referenced.
- If permitted, inspect the QA function deployment history/endpoint without reading secrets or sending SMS.
- Test OTP using approved synthetic QA account and a user-approved test phone only; no bypass/fake OTP.
- Until reconciled, authentication release gate remains BLOCKED.

## Safety
No secrets read, no SMS sent, no Edge Function deployment/change, no database writes, no production access, no merge/deploy.
