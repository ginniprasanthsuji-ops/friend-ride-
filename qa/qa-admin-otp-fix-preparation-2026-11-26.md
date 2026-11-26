# QA Admin OTP Fix Preparation — 2026-11-26

## Confirmed root cause
- QA frontend calls `/functions/v1/Sms-otp`.
- QA project currently has no `Sms-otp` Edge Function; logs show OPTIONS requests returning 404 NOT_FOUND.
- QA project has no public.phone_otps table.
- Production has an active `Sms-otp` function; its source was copied to this QA branch only, without secrets.

## Prepared on QA branch
- `supabase/functions/Sms-otp/index.ts`: source copied from reviewed active production version 32, no secret values included.
- `supabase/migrations/20261126061000_qa_phone_otps.sql`: creates phone_otps with mobile PK, RLS enabled, client roles revoked, service_role granted.

## Required before QA deploy/test
Set QA-only Edge Function secrets in Supabase Dashboard -> QA project -> Edge Functions -> Secrets:
- `FRIEND_RIDE_DB_KEY`: QA service-role key (never production)
- `APITXT_AUTHKEY`: QA SMS provider key/account
- `APITXT_TEMPLATE_ID`: optional QA-approved template ID
Supabase URL and anon key are project-provided environment variables.

Then apply the QA migration, deploy `Sms-otp` function to QA, verify OPTIONS no longer returns 404, test OTP send and verify, and separately verify admin-role authorization. Real SMS delivery requires a test handset.

## Safety
No migration applied and no Edge Function deployed in this fix-preparation step. Production remains untouched.
