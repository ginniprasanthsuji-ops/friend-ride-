# Phase 13D QA — Road Ride Payment Frontend Workflow Review (2026-11-26)

## Scope
Static inspection of QA branch `index.html`; blob SHA `e4d797dcfa741e0648e2d01d7afed8468e0c4c8e`. No runtime payment, SQL, device, or live user-account test performed.

## Customer flow observed
- Payment UI is enabled only when ride status is `completed`.
- Customer calls `fr_get_ride_payment_state`; for `not_started` or `expired`, UI offers QR session creation via `fr_customer_create_ride_payment`.
- Pending state displays QR from private `provider-payment-qr` bucket via signed URL (600 seconds), session expiry timer, UPI Transaction/UTR input, and submit RPC `fr_customer_submit_ride_transaction`.
- Transaction submission refreshes the state; UI states payment is not success until driver verifies and confirms.
- Awaiting-driver-confirmation state polls every 10 seconds (when page visible) and has manual refresh.
- Success state shows confirmed success, amount/reference, customer invoice download/share, and Ride Again action.

## Driver flow observed
- Driver payment box calls `fr_get_ride_payment_state`.
- Pending state displays driver QR (signed URL), session expiry and refresh.
- Awaiting-confirmation state displays transaction ID and requires explicit confirmation prompt; calls `fr_driver_confirm_ride_payment`.
- Success state shows invoice download/share.
- UI warns driver to verify actual UPI/bank receipt before confirmation.

## Static QA notes
- Flow is logically staged and UI does not label customer-submitted transaction as success before driver confirmation.
- QR image depends on `qr_path` and storage signed URL; missing QR path has a visible driver warning.
- Customer payment UI relies on ride status exactly `completed`; other status variants won't start payment session.
- Duplicate interval-clear checks are present near function entry (minor cleanup observation).
- Static frontend review cannot confirm RPC authorization, payment-state transitions, amount calculation, QR storage policies, invoice data integrity, or concurrent payment behavior.

## Runtime tests still required
1. Customer/driver authorized and unauthorized account RPC tests.
2. Create QR, expiry, regenerate, transaction submission and duplicate submissions.
3. Driver confirmation with wrong ride/account, confirm twice, and actual receipt verification.
4. Invoice consistency and ride amount/fare reconciliation.
5. Test completed vs non-completed ride status gate on real QA accounts.
