# FRIEND RIDE Phase 13 — Admin APITXT SMS Test & OTP Function Call Static Review (2026-11-26)

## Scope
Static inspection of QA branch `index.html`, blob `6b18c4ae088c733c6d9b64139ad688573e3875e6`. No SMS was sent and no backend function was executed.

## Source findings
- Admin dashboard has APITXT SMS test panel and test mobile field.
- Test handler `adminTestApitxtSms()` requires selected role Admin and current user.
- It validates Indian mobile format (10 digits beginning 6–9), shows progress, and calls `callApitxtOtp({action:'send',mobile:p})`.
- Success is shown only when response `ok===true`; otherwise it reports failure.
- Shared OTP function sends POST to `FR_OTP_FUNCTION_URL`, uses CORS mode, JSON body, and Supabase anon key header; parses response and surfaces non-2xx errors.
- The frontend test sends a real SMS request if executed; this review did not trigger it.

## Verification gaps / risks
1. Admin authorization appears frontend role/selection based in the inspected handler; server-side admin authorization and rate limits in OTP function were not verified.
2. Confirm secrets (APITXT credentials) are server-side only and never embedded in frontend.
3. Verify OTP send throttling, abuse controls, provider response handling, and cost controls.
4. Verify OTP function URL and deployment/configuration match staging; source inspection does not establish availability.
5. No actual SMS delivery, provider response, OTP verification, DB tests, or runtime tests were performed.

## Test status
- Static review: completed.
- SMS send: **not triggered**.
- Runtime/database tests: not executed.
- Production changes/deployments: 0.
- Fixes: 0.

## Release posture
The Admin SMS test UI and function call are source-wired. Live API connectivity and delivery are unverified; release gate remains blocked pending backend auth/config/security checks and controlled staging SMS test.
