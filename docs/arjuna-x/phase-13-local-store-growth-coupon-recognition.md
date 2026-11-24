# FRIEND RIDE — Phase 13 Local Store Growth + Coupon Recognition

Status: Phase 13 scope recorded on QA branch. Requirements/design only; implementation, payment provider configuration, live SQL execution, and deployment are not complete.

## Phase 13 scope (user-selected)
- **#2 Flash Sale:** Partner/admin offers for time-limited store discounts; backend-enforced eligibility, dates, item/category scope, quantity/claim caps and status.
- **#5 Refer a Friend:** Referral attribution and reward ledger. Reward only after verified qualifying event; self-referral and duplicate abuse checks; caps/admin review.
- **#8 Birthday & Special Day Offers:** Customer opt-in, date supplied with consent, offer eligibility/frequency/expiry; opt-out honored.
- **#9 Customer Feedback & Reviews:** Review linked to completed order when possible; duplicate-per-order checks, moderation/reporting, partner response where supported.

## Coupon Market — Direct-to-Store Payment + Automatic Recognition (included in Phase 13)
1. Store Partner lists coupon with benefit/value, sale price, terms, expiry, stock and customer limits.
2. Customer purchases; payment is routed directly to Store Partner only if the configured payment integration supports recipient/direct settlement.
3. Trusted provider confirmation validates payment success, amount/currency, payment reference, store recipient mapping and idempotency. Screenshots/client-paid flags do not count.
4. Backend atomically issues/activates coupon after verified payment; unique opaque QR/token appears in Customer My Coupons.
5. Store Partner scans QR or enters token manually; backend checks verified payment, correct store/recipient, dates, refund/cancellation, status and previous redemption.
6. Partner sees Payment Verified / Coupon Valid, coupon details and benefit.
7. Partner taps Redeem; atomic one-time redemption records store/partner/time. Duplicate or cross-store redemption is blocked.

## Role surfaces
- Customer: Flash Sale cards, Referral, opt-in Birthday Offers, Reviews after eligible orders, Coupon Market and My Coupons QR.
- Partner: Flash Sale manager, review responses, store coupon creation, coupon recognition scanner/manual lookup and redemption confirmation.
- Admin: campaign/referral moderation and caps, offer controls, reviews moderation, coupon/payment/refund/redemption audit.

## Security and constraints
- Supabase SQL/RLS is authoritative for eligibility, reward status, coupon issue and redemption.
- Payment verification and issue/redemption must be trusted server-side and idempotent.
- Client cannot set paid, reward-issued, coupon-issued or redeemed states.
- Direct store settlement is conditional on existing provider support; audit provider and partner recipient setup before implementation.
- Firebase notifications are informational; consent and opt-out honored.
- Existing features must be audited and reused; do not duplicate modules or remove other selected features.
- No new paid APIs/subscriptions, AI APIs, Python, or production deployment.

## Acceptance / QA
- Flash Sale: inactive/expired, eligible item, cap reached and duplicate claim checks.
- Referral: qualifying event only, self-referral and duplicate reward rejection.
- Birthday: no consent means no marketing offer; opt-out respected; expiry/frequency checks.
- Reviews: completed order eligibility, duplicate review, moderation, partner response.
- Coupon payment: pending/fail/refund/mismatched amount/recipient does not activate; successful verified payment issues once; duplicate callback is idempotent.
- Recognition: correct store accepted; other store rejected; expired/redeemed token rejected; QR fallback manual lookup uses same checks.
- Two concurrent redemption attempts: exactly one succeeds.
- Run static/regression and browser simulation; staging provider/camera/device verification is separate.

## Delivery order
1. Audit current app/payment/partner identity schema and existing modules.
2. Reuse or additive schema/RLS contract.
3. Trusted payment confirmation + atomic coupon issuance/redemption.
4. Flash Sale backend workflows.
5. Referral reward workflow.
6. Consent-based Birthday Offers.
7. Reviews/moderation workflow.
8. Customer/Partner/Admin UI integration.
9. YF Test workflow simulations and QA; staging checks before release.

No live SQL execution, payment configuration, production deployment, or release is authorized by this plan.
