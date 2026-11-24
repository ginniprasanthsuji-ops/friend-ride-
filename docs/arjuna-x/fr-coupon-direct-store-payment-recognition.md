# FR Coupon Market — Direct-to-Store Payment & Automatic Recognition

Status: requirements/design committed to QA branch; no live payment integration, SQL execution, or deployment performed.

## Confirmed business rule
For store-issued paid coupons, customer payment is routed directly to the Store Partner's payment account. FRIEND RIDE does not hold or manually transfer coupon sale proceeds. After trusted payment confirmation, backend automatically issues/activates customer's coupon and creates recognition record.

## Flow
1. Store Partner creates listing with face value/benefit, sale price, terms, dates, quantity and per-customer cap.
2. Customer selects coupon and proceeds to checkout.
3. Checkout uses configured payment integration with Store Partner as payment recipient/beneficiary (direct settlement model).
4. Trusted payment confirmation (provider callback/webhook or supported verified server-side status check) is received and validated. Screenshot or client-submitted paid flag is never sufficient.
5. Backend verifies payment reference uniqueness, recipient/store mapping, coupon ID, amount/currency, success and idempotency.
6. Backend atomically records verified purchase and issues one unique opaque coupon redemption token per purchased unit. Coupon status becomes issued only after verified payment.
7. Customer My Coupons displays terms, store, validity, benefit, status and QR/token.
8. Store Partner opens Dashboard > Coupon Recognition / Scan Coupon and scans QR. Manual coupon ID/token lookup is fallback.
9. Server validates token, coupon and purchase; verified payment; correct store/recipient; validity; status; refund/cancellation; prior redemption.
10. Partner sees Payment Verified / Coupon Valid and coupon details/benefit.
11. Partner taps Redeem/Accept. Server-side atomic redemption changes status to redeemed, records partner/store and timestamp. Duplicate attempts are rejected.

## Failure and safety rules
- Pending, failed, reversed, refunded, mismatched-amount, mismatched-recipient, or unverified payments do not issue redeemable coupons.
- QR carries only an opaque unique token; authenticated server lookup performs recognition.
- Coupon store owner/recipient must match authenticated Partner. Driver/Admin-issued coupons follow approved scope and validation rules.
- Payment callback and coupon issuance must be idempotent.
- Redemption is atomic to prevent concurrent double-use.
- Store client cannot mark payment verified, issue coupons, alter payment references, or edit redemption status directly.
- Admin can audit purchase, payment verification, issue, refund/reversal and redemption.
- Direct settlement depends on existing provider's supported recipient/settlement features and verified configuration. Do not promise it until provider setup is confirmed.

## Suggested states
Payment: pending -> verified -> refunded/reversed (provider-specific states mapped server-side).
Coupon: not_issued -> issued -> redeemed; terminal alternatives: expired, cancelled.Uncertain payment remains non-redeemable.

## UI placement
- Customer: Coupon Market checkout; My Coupons with QR/token and status.
- Store Partner: Coupon Market management; Coupon Recognition/Scan; Manual token verification; redemption confirmation.
- Admin: payment/reconciliation audit and coupon issue/redemption audit.

## Implementation checklist
- Audit current payment provider and store recipient/partner identity model.
- Confirm existing integration supports direct-to-store routing/recipient settlement.
- Design trusted payment confirmation handler and idempotency.
- Design atomic purchase issue and redemption RPCs, with schema validated against current DB.
- Implement UI using existing QR scanning pattern; manual verification fallback.
- Simulate pending/success/failure/refund/mismatched store/duplicate webhook/expired coupon/double redemption.
- Real provider and camera/device testing remains staging verification.

## QA scenarios
1. Successful payment to Store A -> coupon issued -> Store A recognizes -> redeem once.
2. Store B attempts Store A coupon -> rejected.
3. Pending or failed payment -> no redeemable coupon.
4. Refund/reversal -> coupon cancelled or blocked per provider final status.
5. Duplicate callback -> no duplicate purchase or issued token.
6. Expired coupon -> rejected.
7. Two simultaneous redemption attempts -> exactly one succeeds.
8. QR scan fails -> manual token lookup uses same validation rules.
