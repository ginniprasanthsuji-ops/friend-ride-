# Phase 13 — Central Protected Route Guard (QA branch)

Date: 2026-11-25
Branch: `arjuna-x/phase-13-feature-audit`

## Change applied
Added centralized role checks at the start of `showPage(id)` in `index.html`.

- Admin route allowlist requires logged-in user and profile role `admin`.
- Partner route allowlist requires logged-in user and profile role `partner` or `admin` (preserving the Admin-to-Partner access exception already present in `menuGo`).
- Direct coupon review route requires logged-in Partner or Admin (both dashboards link to it).
- Public/shared routes remain unguarded by this central protected-route check.
- Unauthorized calls return before the page activation loop and show a role-required message.

## Test specification updated
Added/adjusted Playwright authorization spec to test Customer/Driver/Partner denied protected routes, Admin permitted routes, and coupon-review Partner/Admin shared permission. Public `frSuperHub` was removed from Admin-only test list because it is not in the protected route allowlist.

## Scope
QA branch only. Main/production untouched. No tests executed (no run evidence obtained in this continuation). This change is a UI route guard; Supabase RLS/RPC must still enforce data security.

## Review cautions
The allowlists are based on source navigation definitions. Confirm the role and intended access of each destination, especially route names and any route-specific loader/backend permission before release. UI guard does not replace backend authorization.


## Follow-up hardening addendum (same QA branch)
- Added direct route checks for all four role dashboards; dashboard role is exact (Admin cannot silently open Partner Dashboard, and unknown roles fail closed).
- Added Partner-only `referrals` route and moved `partnerPaymentSettings` out of the Admin-only list so Partner/Admin can open it.
- Admin membership-derived role is reflected in the profile used by UI guards; invalid role values fail closed; `dashboardFor` returns null for unknown roles.
- Added direct dashboard-route matrix coverage and corrected Playwright fixtures to assign lexical page role variables rather than `window` properties.
- Local external JavaScript assets are now syntax-checked in CI alongside inline scripts.
