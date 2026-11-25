# Phase 13C — Role-Based Subscription Badge Display Requirement

Status: Requirement captured for implementation planning only.
Scope: QA branch documentation. No app code, SQL, migrations, deployment, payment verification, or production/Main changes.

## Requirement
Each subscription badge must be displayed only in the dashboard corresponding to the subscription type that the user has purchased and whose subscription status is active.

## Dashboard mapping
- Driver Subscription → Driver Dashboard
- Partner Subscription → Partner/Shop Dashboard
- TASKO Subscription → TASKO Dashboard (Technician and Non-Technician task participants)
- Home Services Technician Partnership Subscription → Home Services / Service Provider Dashboard

## Rules
1. A badge is visible only after the relevant subscription payment is verified and the subscription is active.
2. Badge type must match subscription type; do not show the Driver badge for Partner, TASKO, or Home Services subscriptions.
3. A user with multiple active subscriptions may see the corresponding badge in each eligible dashboard.
4. Expired, cancelled, inactive, or unverified subscriptions must not be displayed as active badges.
5. Badge click should open subscription details/status or the subscription/payment destination according to the app's existing flow; do not assume payment is verified merely because a payment link was opened.
6. Subscription status and badge visibility must be driven by backend-authoritative subscription/payment state, not a client-side visual toggle.
7. Dashboard role/eligibility must be checked so one role's subscription badge is not exposed as another role's entitlement.

## Acceptance checklist (not tested)
- [ ] Driver active subscription shows Driver badge in Driver Dashboard only.
- [ ] Partner active subscription shows Partner badge in Partner Dashboard only.
- [ ] TASKO active subscription shows TASKO badge in TASKO Dashboard for Technician or Non-Technician subscriber as applicable.
- [ ] Home Services active subscription shows Home Services Technician Partnership badge in its provider dashboard.
- [ ] No active subscription → no active badge.
- [ ] Expired/cancelled/unverified → no active badge.
- [ ] Multiple active subscriptions → each matching badge appears only in its eligible dashboard.
- [ ] Clicking badge opens the intended subscription details/action.
- [ ] Negative role-crossing checks verify badges do not appear in unrelated dashboards.

## Audit boundary
This is a captured requirement and proposed acceptance checklist only. No runtime tests were performed, and implementation readiness is not claimed. Continue to preserve frozen Phase 13 tracking values: Planning/Checklist 88%, Overall Audit estimate 12%, progress graph frozen, and Phase 13B Shared Ride Hardening 70% frozen. Production/Main Supabase must not be accessed or changed.
