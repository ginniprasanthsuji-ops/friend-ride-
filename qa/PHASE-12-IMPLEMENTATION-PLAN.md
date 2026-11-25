# FRIEND RIDE — Phase 12 Implementation Plan

Status: audit and review-only coupon schema draft staged on branch `phase-12-implementation-plan`.
No database migration has been applied. Production database and production app code remain unchanged.

## Guardrails
- Preserve existing app flows, backend functions, tables, permissions, and role dashboards.
- Use only SQL, GitHub, Firebase, and Supabase; no Python, AI API, or additional paid services.
- All database changes must be additive migrations, reviewed, and tested in QA before production.
- No feature may be marked complete based on UI labels or simulations alone.

## Work order

### P0 — Payment and fee consistency
- [ ] Define and implement the user-approved platform fee rule in a centralized SQL function/config, after confirming rounding behavior:
  - ₹100 → ₹2.50
  - ₹500 → ₹11.50
  - ₹1,000 → ₹25
  - Above ₹1,000 → fee capped at ₹25
- [ ] Ensure checkout/order totals clearly separate subtotal, delivery fee, platform fee, tax (if applicable/configured), and payable total.
- [ ] Record fee and payment reconciliation entries in the ledger only when a verified payment/order event occurs.
- [ ] Add idempotency and duplicate-payment protections.
- [ ] Validate that direct-to-store payments and existing payment-confirmation workflows are not broken.

### P1 — Coupon foundation
- [ ] Admin coupon create/edit/activate/deactivate; expiry, usage limits, eligible service/store, and terms.
- [ ] Partner-owned coupon creation limited to approved shop owner.
- [ ] Customer coupon browse, purchase, and My Coupons status.
- [ ] Store-directed payment flow and automatic paid-purchase recognition by that store.
- [ ] One-time redemption token/QR; prevent replay, duplicate redemption, unauthorized store redemption, and expired redemption.
- [ ] Ride coupon service types: Bike, Auto, Car.
- [ ] Reporting: sales, redemptions, expirations, store-wise, and coupon-wise.

### P1 — Referral and offer consistency
- [ ] Reconcile driver referral frontend promise (2 rides) against backend requirement (4 rides each); choose approved policy before code change.
- [ ] Audit customer ₹50 offer and Partner 1-month free offer for backend eligibility, redemption, and duplicate protection.
- [ ] Do not fabricate reward balances or subscription entitlements.

### P2 — QA and release evidence
- [ ] Add SQL contract tests and UI regression tests for fee and coupon lifecycle.
- [ ] Run QA-project migration and tests first; compare QA schema to expected inventory.
- [ ] Test customer, partner, driver, and admin permissions.
- [ ] Test duplicate payment/redemption, expiry, cancellation, failed payment, and retry.
- [ ] Re-run existing workflows and report actual CI result.
- [ ] Real-device OTP, push, GPS/live tracking, and payment checks remain separately required.
- [ ] Maintain Play Store release gate as BLOCKED until required evidence is complete.

## Acceptance criteria
- No existing workflow regression.
- Correct role owns every coupon and order/payment record.
- Payment status and ledger records are consistent and idempotent.
- Fee calculation is centralized, deterministic, and matches the approved examples/cap.
- Coupon redemption is single-use and verifiable.
- Referral/offers shown in UI match backend rules.
- QA evidence is attached; no simulation is represented as live proof.
