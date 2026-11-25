# Phase 13 — Registration / Role Login / Dashboard Routing Trace

Date: 2026-11-26
Branch: arjuna-x/phase-13-feature-audit
Source: QA branch index.html; static trace only.

## Flow observed
- Role launcher selects Customer / Driver / Partner / Admin and persists selected role.
- OTP verification obtains session, then calls role-authoritative acceptSession(authUser, requestedRole).
- Profile lookup retries up to 3 times; if query fails, profile-cache fallback is used.
- Admin membership is queried from admin_users.
- Expected selected role must match authenticated profile/admin-derived role.
- Role dashboard is selected through dashboardFor(role).
- Driver and Partner approval state is separately checked; pending operational access is restricted.
- Admin self-registration is blocked in frValidateRegistration.
- Driver/Partner registration calls fr_register_driver_partner RPC and stores related document paths; Customer path is handled separately.

## Security concern — admin membership read failure fallback
The final role-authoritative handler computes:
`isAdmin = admin_users membership found OR (admin_users query error AND profile.role === 'admin')`.
The same handler can fall back to a cached profile when profile retrieval fails.

Assessment: **Potential fail-open admin authentication path**. If the membership query errors and a cached/stored profile contains role=admin, the handler treats the user as Admin despite the membership table not being verified. This is not runtime-proven and depends on cache provenance/RLS/query failure, but it violates the safer fail-closed rule for privileged membership. Recommended QA fix: if admin_users query errors, do not grant admin based on profile role; show retry/temporary permission-check error and preserve session without opening Admin dashboard. Admin membership should be verified successfully before Admin access.

## Static positives
- Login role mismatch is rejected.
- Admin registration blocked.
- Driver/Partner pending approvals are handled separately.
- Dashboard mapping is explicit by role.
- Registration field groups are role-specific; earlier test spec covers this.

## Validation limitation
This is static source review only. No OTP, live auth session, or role/dashboard runtime tests executed. Production/Main untouched.
