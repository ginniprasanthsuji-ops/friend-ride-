# Phase 13 — Profile Privileged-Field Guard & Registration RPC Trace

Date: 2026-11-26
Branch: arjuna-x/phase-13-feature-audit
Read-only Supabase QA inspection.

## Trigger verified
- Trigger: `qa_guard_profile_privileged_fields`
- Table: `public.profiles`
- Timing: BEFORE UPDATE
- Status: enabled (`tgenabled=O`)
- Function: SECURITY DEFINER, empty search_path.

## Guard behavior observed
For authenticated non-admins, changes to `role`, `driver_approval_status`, or `partner_approval_status` are rejected unless the transaction-local `app.friend_ride_role_registration` setting equals the caller's auth UID.

## Registration RPC trace
`fr_register_driver_partner(text,jsonb)`:
- requires authenticated OTP session;
- only allows driver or partner role and object payload;
- validates name and 10-digit Indian mobile;
- requires current profile role customer (locks profile row);
- validates required role-specific fields;
- sets transaction-local guard bypass setting to caller UID only after validation;
- changes profile role and sets approval status pending;
- writes role fields via this RPC's validated registration flow.

## Assessment
The observed guard exception is tied to the registration RPC's transaction-local setting and the function itself is SECURITY DEFINER. This design appears intentionally scoped; however, live API tests are still required to prove callers cannot manipulate the setting outside the RPC or alter privileged fields directly.

No SQL changes. No runtime tests. Production untouched.
