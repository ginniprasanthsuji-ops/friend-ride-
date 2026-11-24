# Phase 7 — OTP/Auth Security Audit R7

**Branch:** `arjuna-x/phase-7-ai-intelligence-safety`  
**Scope:** Static frontend review of OTP send/verify, registration, session establishment, role selection, admin membership, and logout.  
**Status:** Static audit only. No code, auth configuration, Edge Function, database, RLS, or production changes.

## R6 CI confirmation
R6 audit commit `325d4e6d5523fbabf38c22b509903d10085d3050` — GitHub Actions run `45306176725` completed **successfully**.

## Reviewed frontend paths
- OTP endpoint is `SUPABASE_URL/functions/v1/Sms-otp`; requests use POST JSON and the Supabase anon key in the `apikey` header.
- Login OTP send sends only `action: send` and mobile; selected role is not sent to the OTP endpoint.
- Frontend validates Indian 10-digit mobile format, tracks requested mobile locally, and imposes a 60-second client-side cooldown.
- Login verify sends `action: verify`, mobile, OTP. It requires `verified === true` and both access/refresh tokens, then calls `sb.auth.setSession()` and `acceptSession(user, requestedRole)`.
- Registration uses same OTP service; before verification the frontend validates required profile/application fields. It verifies OTP, establishes the returned Supabase session, then uploads KYC files and creates registration/profile records.
- Admin login is selected in UI; frontend admin membership check queries `admin_users`. The profile role is not authoritative if an admin membership exists; a profile role of admin without membership is rejected.
- `acceptSession` checks selected role against resolved database role; driver approval status is checked before driver dashboard access.
- Logout uses `sb.auth.signOut({scope:'local'})`, clears current frontend user/profile and selected-role localStorage, returns home.

## Risks / backend verification required
1. **OTP Edge Function source not present in the reviewed branch tree.** Deployed implementation and secrets are not verified; function must enforce OTP expiry, single-use, attempt limits, resend throttling, mobile binding, and server-side provider verification.
2. **Client cooldown is not a security control.** Backend must rate-limit by phone, IP/device and action; protect provider cost and abuse.
3. **Session is set before role acceptance completes.** If `acceptSession` throws for role mismatch/admin authorization/approval, the newly established session may remain. Confirm rejection path signs out or clears session.
4. **Role is client-selected for the acceptance call.** Server-side role/profile and admin membership must be authoritative; no role elevation from request payload or user metadata.
5. **Admin membership query failure/denial behavior needs authenticated runtime testing.** Ensure errors fail closed and admin RPCs independently enforce admin membership.
6. **Registration sequence can establish session and upload documents before all registration steps complete.** Verify failed registration cleanup, account state, orphan file cleanup, retry behavior, and server-side registration authorization.
7. **OTP response/session handling:** validate issuer/audience/expiry and ensure Sms-otp only returns a valid Supabase Auth session after server-side OTP verification. Avoid leaking provider error details or OTP secrets.
8. **Mobile normalization:** frontend accepts only 10-digit local format; backend must canonicalize and bind OTP to the exact normalized mobile.
9. **Logout/session lifecycle:** local-only signout may leave other sessions active by design; verify push/realtime cleanup and UI state, plus token refresh and expired-session behavior.
10. **Client request protections:** anon-key Edge Function endpoint must have abuse controls and safe CORS; anon key is public and not an authorization secret.

## QA cases required (not run)
- Wrong/expired/reused OTP; verify attempt lockout and resend cooldown bypass attempts.
- Phone mismatch after send; OTP bound to correct normalized phone.
- OTP send/verify provider outage and malformed response.
- Valid OTP but missing/invalid session tokens.
- Customer/Driver/Partner/Admin role mismatch; role tampering; profile role tampering.
- Admin membership positive/negative, and database/query error fail-closed.
- Pending driver approval cannot enter driver dashboard.
- Registration partial failure at each upload/profile insert; retry and orphan cleanup.
- Logout, token expiry/refresh, auth-state change, multiple sessions, push/realtime cleanup.
- Cross-account and cross-role authorization tests for admin APIs and protected actions.

## Scope boundary
No live authenticated runtime test performed. No deployed Edge Function source, Supabase Auth configuration, database policies, or admin membership behavior inspected. No changes to app code, Supabase schema, auth, storage, RLS, migrations, or production.
