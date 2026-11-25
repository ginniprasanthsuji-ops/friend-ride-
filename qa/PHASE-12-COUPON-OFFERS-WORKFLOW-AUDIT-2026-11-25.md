# Phase 12 — Coupon & Offers Workflow Audit (2026-11-25)

QA-only inspection: pqsangtvietawkfgpgfu. Read-only schema and repository search. Production untouched. No SQL changes.

## Findings
- GitHub repository search for coupon, offers coupon, store coupon, redeem offer, discount promo returned no matching implementation files.
- QA public-schema table search for names containing offer returned no tables.
- Coupon/offer workflow implementation therefore was not located in the reviewed source/catalog. This is a scoped finding, not a claim that no code exists anywhere.
- No runtime coupon workflow was exercised.

## Required business workflow for future validation
1. Admin or eligible store creates coupon and sets eligibility, price/discount, usage limits, expiry, and status.
2. Coupon is visible only to eligible customer roles and during its valid window.
3. Customer purchases/claims coupon; payment status must be verified before marking purchased.
4. If the approved rule is direct-to-store payment, payment recipient/confirmation and store recognition must be explicit and consistent.
5. Coupon code/QR/token is uniquely bound to purchase and protected against replay.
6. Store validates coupon and redemption is atomically recorded once.
7. Refund/cancel/expiry/duplicate claim rules are applied consistently.
8. Admin audit log captures creation, edits, approval, purchase, payment confirmation, redemption, refunds and disputes.
9. Customer, store, and admin dashboards reconcile coupon state and any platform fee/commission.
10. Negative tests: expired, inactive, wrong store, wrong customer, already redeemed, concurrent duplicate redemption, unpaid purchase, refund after redemption, forged status.

## Test cases not run
- Admin/store coupon creation and publication
- Customer claim/purchase
- Direct payment/recipient confirmation
- Store recognition
- One-time redemption and duplicate/replay prevention
- Expiry/refund and audit trail
- Dashboard and financial reconciliation

## Status
Static source/schema discovery: complete for the search scope.
Runtime tests: not run.
SQL changes: 0.
Production: untouched.
