# Phase 13 — Role Routing Static Source Audit

Date: 2026-11-25
Branch: `arjuna-x/phase-13-feature-audit`
Scope: Static inspection of root `index.html` only. No runtime/browser/device execution in this audit.
Production/main: untouched.

## Verified source facts

- `dashboardFor(role)` maps customer → customerDashboard, driver → driverDashboard, partner → partnerDashboard, admin → adminDashboard.
- `menuGo(id)` has explicit required-role mappings for the four dashboard IDs.
- `menuGo` checks the current profile role before opening role-protected pages; partner pages allow admin as an override.
- Admin pages are listed in an explicit `adminPages` array and require admin role in `menuGo`.
- `acceptSession(user)` reads profile role and performs an `admin_users` membership check. Admin membership is treated as authoritative; a profile claiming admin without admin_users membership is rejected.
- `frRoleAuthSelfTest` exists in source and exercises the four role titles/selected-role values; this is a source-defined self-test, not a live auth test.
- Existing Playwright test file includes assertions for dashboard role mapping and requested-role mismatch handling. Tests were inspected, not executed here.

## Findings / next validation

### RTA-01 — Unknown dashboard role fallback (low / defensive)
`dashboardFor(r)` defaults unknown role values to `customerDashboard`. Current allowlist/session checks should normally prevent unknown roles, but a defensive change should return null/blocked for unknown roles instead of silently mapping them to Customer. Do not change without confirming all callers and adding regression tests.

### RTA-02 — Admin role authorization (verification required)
Source uses `admin_users` membership check. Confirm the table's RLS policy, failure/error behavior, and that a failed membership query cannot grant admin. Real session and unauthorized role-switch tests remain required.

### RTA-03 — Page-level authorization coverage (verification required)
`menuGo` gates listed admin/partner pages, but direct `showPage(id)` calls and other navigation handlers need an inventory to ensure protected pages cannot be opened without passing through `menuGo`. Source inspection of this function alone does not certify every route.

## Release blockers still open

- Execute browser regression on this branch and capture CI evidence.
- Test real Customer/Driver/Partner/Admin accounts and unauthorized role switching.
- Review Supabase RLS, RPC permissions, and admin membership policies.
- Perform live OTP, push, GPS/tracking, SOS, payment, QR and end-to-end order tests on staging/device.
- Validate Android signed AAB and Play Console/privacy/data safety checks.

## Audit status
Static source inspection only. No code changed. No test PASS claimed. No production writes.
