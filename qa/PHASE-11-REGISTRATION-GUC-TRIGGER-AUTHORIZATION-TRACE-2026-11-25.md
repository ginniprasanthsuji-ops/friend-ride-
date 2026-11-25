# Phase 11 — Registration GUC / Profile Trigger Authorization Trace

Date: 2026-11-25
QA project: `pqsangtvietawkfgpgfu`
Read-only audit; no changes applied.

## Static trace

### Registration RPC
`public.fr_register_driver_partner(text,jsonb)`
- SECURITY DEFINER, `search_path=''`, owner postgres.
- Requires authenticated `auth.uid()`.
- Restricts role input to driver/partner.
- Validates name/mobile and role-specific registration fields.
- Requires existing profile role to be customer.
- Sets transaction-local custom setting:
  `set_config('app.friend_ride_role_registration', v_uid::text, true)`
- Then updates profile role and pending approval fields.
- Trigger checks this setting against `auth.uid()`.

### Profile policies in QA
- Own-profile UPDATE policy: `id = auth.uid()` for both USING and WITH CHECK.
- Own-profile INSERT allows own id and roles customer/driver/partner.
- Own-profile SELECT policy.
- Separate admin read policy for driver profiles.

## Potential high-risk authorization bypass (NOT runtime-confirmed)
The profile trigger bypass condition accepts the custom setting when it equals the authenticated user's UID. PostgreSQL custom GUCs with application-defined names may be set by session/transaction clients, so the client-side ability to set `app.friend_ride_role_registration` to its own UID must be tested. If a client can set that GUC and has direct UPDATE privileges on sensitive profile columns, the trigger's bypass could allow self-promotion or approval-field modification despite the intended RPC-only path.

This is a priority runtime-negative test. It is not yet confirmed because the audit has not executed an authenticated adversarial session or established the exact column-level grants/client GUC behavior.

## Recommended safe test (QA only, isolated test account)
1. Use a fresh QA test account, not a real user.
2. Check whether the authenticated client can set the custom GUC to its own UID in the transaction/session.
3. Attempt direct own-profile UPDATE changing role and approval status, without calling registration RPC.
4. Verify trigger rejects when GUC is unset and determine whether client-set GUC bypasses it.
5. Verify the intended registration RPC still works and sets the transaction-local GUC internally.
6. Record SQLSTATE/results; do not test against production.

## Status
- Source body trace: completed for the QA RPC and trigger.
- Policy trace: completed for relevant profile policies.
- Column/direct privileges: previously documented as broad table privileges; exact effective ability for sensitive fields remains to be confirmed.
- Runtime test: pending, no test attempted.
- Remediation: none applied; explicit approval required.
