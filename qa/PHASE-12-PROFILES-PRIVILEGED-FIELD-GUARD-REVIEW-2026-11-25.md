# Phase 12 QA — Profiles Privileged Field Guard Review
Date: 2026-11-25
Project: QA Supabase only (pqsangtvietawkfgpgfu)
Scope: Metadata and function-definition review. No profile rows read; no runtime tests; production untouched.

## Privileged column grants observed
Authenticated role has column-level UPDATE privileges on profiles including:
- role
- driver_approval_status
- partner_approval_status
The broad column privilege is guarded by BEFORE UPDATE trigger qa_guard_profile_privileged_fields.

## Guard trigger
Trigger: qa_guard_profile_privileged_fields (BEFORE UPDATE)
Function: public.qa_guard_profile_privileged_fields()
Security: DEFINER; search_path=public.
Function compares NEW vs OLD for role, driver_approval_status, partner_approval_status and raises exception for authenticated non-admin users unless app.friend_ride_role_registration setting equals auth.uid().

## Registration function reviewed
public.fr_register_driver_partner(text,jsonb), SECURITY DEFINER, search_path empty.
Observed validations:
- Requires authenticated OTP session (auth.uid non-null).
- Accepts only driver/partner role and object JSON profile.
- Validates name and Indian mobile format.
- QR path must begin with account UID.
- Locks existing profile row; permits registration only from customer role.
- Requires role-specific fields.
- Sets transaction-local app.friend_ride_role_registration to current UID before profile update.
- Sets requested role and corresponding approval status to pending.
- Returns ok/role/pending/user_id.

## Risk status
The trigger and function definitions show an intended controlled registration bypass. No exploit confirmed.
Authenticated UPDATE grants to privileged columns remain a defense-in-depth concern; trigger effectiveness and bypass setting trust boundary require authenticated negative tests and review of all other call paths.
No schema change or code change was performed during this audit.

## Pending tests
1. Customer authenticated direct UPDATE of role must be rejected.
2. Customer authenticated direct UPDATE of driver approval must be rejected.
3. Customer authenticated direct UPDATE of partner approval must be rejected.
4. Driver/partner registration function succeeds only for eligible customer profile and assigns pending approval.
5. Repeat/role-switch registration is rejected.
6. Admin approval workflow works as intended.
7. Verify app.friend_ride_role_registration cannot be forged through ordinary authenticated client requests; confirm function-only transaction-local setter path.
