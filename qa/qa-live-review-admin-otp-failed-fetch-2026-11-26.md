# QA Live Review Finding — Admin SMS OTP Failed to Fetch (2026-11-26)

## User-observed symptom
Admin Login shows "SMS OTP Function: Failed to fetch" when attempting to send an OTP.

## Confirmed QA backend findings (read-only)
- QA project ref: pqsangtvietawkfgpgfu.
- QA Edge Function inventory: 6 functions; no `Sms-otp` function.
- QA Edge logs show OPTIONS requests to `/functions/v1/Sms-otp` returning 404 / NOT_FOUND at 2026-11-26 06:00:09Z, 06:00:17Z, and 06:04:47Z. This confirms the QA endpoint is missing, causing the browser fetch/preflight to fail.
- QA public schema has no `phone_otps` table.
- Production project has active `Sms-otp` Edge Function version 32. Its source requires QA-specific secrets `FRIEND_RIDE_DB_KEY` and `APITXT_AUTHKEY`; optional `APITXT_TEMPLATE_ID`; and the OTP table. Do not copy production secrets or use the production service-role key in QA.

## Safe fix required (QA only)
1. Add/deploy the reviewed OTP Edge Function source to QA project.
2. Create the required QA `phone_otps` table with a QA-only migration.
3. Configure QA secrets in Supabase Dashboard using QA credentials/provider configuration; never copy production service-role/provider secrets.
4. Test CORS OPTIONS, OTP send response, real delivery to a test phone, OTP verification, and admin authorization. Real SMS delivery requires separate user/device evidence.
5. Verify that QA frontend still uses QA Supabase URL and key.

## Status
- Root cause: confirmed missing QA Edge Function (404); table also absent.
- Function deployment, QA schema changes, and secrets configuration: not performed in this report.
- Production: untouched.
