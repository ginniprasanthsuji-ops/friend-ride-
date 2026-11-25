# Phase 12 — Platform Fee & Financial Workflow Static Audit (2026-11-25)

QA project: pqsangtvietawkfgpgfu (catalog-only inspection). Production untouched; no SQL changes.

## Schema/function discovery
- rides schema has fare_offer and agreed_fare, but no platform-fee, commission, payment-status, or coupon columns visible in the inspected rides table.
- QA schema discovery over names containing coupon/offer/fee/payment/wallet/transaction/ride did not return coupon, platform-fee, commission, or ride-payment tables in the inspected result set. This is limited to the returned schema name filters.
- Name-based function searches for fee/platform/coupon/offer did not find a dedicated fee or coupon function.
- Payment confirmation remains an app workflow requiring live test, according to the existing QA release gate.

## Business rule reconciliation
- Repository BLUEPRINT.md text describes a configurable example platform fee of ₹2 per ₹100 and explicitly says not hard-coded; fee display and calculation validation are release-gate live-test items.
- User's recent Phase 12 requirement discussed platform fee as ₹2.50 per ₹100 (with specific amount tiers including ₹500 and ₹1,000 examples). This differs from the repository blueprint example. Treat user-approved business rule as needing formal reconciliation; do not assume the blueprint example is current or calculate implementation claims.
- Coupon creation/sale/redemption and recognition/direct-payment flow not located in the inspected QA schema/function name search. Source search returned no coupon implementation matches. Not proof of absence from all app files.

## Validation checklist
1. Confirm final approved tariff/rounding rules in one canonical document.
2. Map actual frontend and RPC code path for ride/order fees and identify any hard-coded value.
3. Test exact amount cases and edge boundaries: ₹100, ₹500, ₹1,000, just below/above tiers, rounding and cancellation/refund.
4. Verify fee is shown before confirmation and recorded consistently in order/ride, invoice, partner ledger and admin report.
5. Coupon: admin/store create, customer purchase, direct payment to store, automatic store recognition, redemption, duplicate/replay protection, expiry/refund and platform fee.
6. Confirm no customer-visible or partner/admin ledger mismatch using disposable QA records.

## Status
Static schema/function-name discovery: performed.
Implementation source mapping: incomplete.
Runtime financial tests: not run.
SQL changes: 0.
Production: untouched.
