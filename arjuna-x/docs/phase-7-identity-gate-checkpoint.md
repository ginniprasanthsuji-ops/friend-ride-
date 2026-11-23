# Phase 7 identity gate checkpoint

Added an identity/session-bound core policy helper:
- Requires authenticated identity with non-empty actor and session actor IDs.
- Requires actor ID to match session actor ID.
- Allows only explicit roles: customer, driver, partner, admin, teacher, student.
- Admin approvals/complaints feature is admin-only at this helper.
- Feature dependency safe-mode and action permission checks remain in force after identity validation.

This is an isolated core policy helper; app route/runtime wiring and full role-feature matrix audit remain outstanding. No SQL was needed for this helper. No production SQL, merge, or deployment.
