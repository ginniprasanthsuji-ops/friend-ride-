# Phase 13 Task 12 — Partner Quote and Payment Workflow Audit

- **Branch:** arjuna-x/phase-13-feature-audit
- **Live Supabase project:** fglyplxcczdjtfwobtzh
- **Audit:** `fr_partner_quote_market_order` validates approved partner ownership, order quote state, prices every item and computes subtotal from stored quotes plus delivery fee.
- **Customer acceptance:** `fr_customer_accept_market_quote` locks customer-owned quoted order, checks approved partner UPI setup, recalculates item subtotal from server stored partner quote × quantity, adds delivery fee, sets payment_pending, pending payment and a five-minute payment expiry.
- **Payment details:** `fr_customer_market_payment_details` returns order total/payment info to the owner only while the payment window is active.
- **Timeout:** `fr_customer_tick_market_payment` extends once by three minutes, then expires/cancels.
- **Partner confirmation:** `fr_partner_confirm_market_payment` validates partner ownership, pending payment and unexpired window before marking paid/accepted and recording payment confirmation.
- **Flash Sale integration candidate:** acceptance RPC is the authoritative integration point. A future migration should accept an optional redemption, validate ownership, order/campaign partner match, reservation linkage/status, campaign active/approved window, minimum subtotal, discount cap, and quantity limit; calculate discount from trusted stored quote prices; persist discount/payable totals; finalize redemption only after confirmed payment.
- **Changes this task:** audit and documentation only; no checkout/payment SQL changed.
- **Verification:** live function definitions inspected. No browser/E2E or actual payment tests performed.
- **Status:** audit complete; implementation prerequisite identified.
