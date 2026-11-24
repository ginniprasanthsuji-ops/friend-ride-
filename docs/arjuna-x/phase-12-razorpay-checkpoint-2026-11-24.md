# Project Arjuna X — Phase 12 Continuation Checkpoint
Date: 2026-11-24
Branch: `qa/phase12-native-motion-audit-2026-11-24`
Environment: QA branch only; production/main unchanged.

## Progress estimate
**Phase 12: 87% (estimate; not a test pass).**
Previous checkpoint: ~86%. This increment added Razorpay Standard Checkout QA code and strengthened server verification. Deploy and real Test Mode transaction remain unverified.

## Completed in this continuation
- Razorpay Standard Checkout front-end integration uses the existing Partner plan UI.
- Authenticated Supabase Edge Function creates Razorpay orders.
- Approved plan allow-list: Basic ₹299, Growth ₹599, Premium ₹999.
- Server-side HMAC-SHA256 signature verification.
- Server fetches Razorpay Order and checks account ownership, approved plan, amount, INR currency.
- Server fetches Razorpay Payment and checks order linkage, captured status, amount and currency.
- Payment cancel and failure messages.
- Added contract tests covering these markers; **tests authored, not executed here**.
- Setup guide updated.

## Approved payment/commission rules (still require backend enforcement)
- Customer platform charge: 2.5%, capped at ₹25.
- Driver/Partner subscription active: waive their 1.5% commission.
- Driver/Partner subscription inactive/unsubscribed: 1.5% commission applies.
- Refund/cancellation reconciliation must reverse or adjust ledger amounts.
- Cash/UPI or gateway collection must be distinguished from pending dues.

## Pending / blockers
1. Deploy Supabase Edge Function in QA and configure rotated Test Mode secrets.
2. Execute Node contract test and capture results.
3. Run Razorpay Test Mode transaction end-to-end.
4. Map captured, verified payment to the existing subscription backend model (do not activate from frontend alone).
5. Persist plan, start/end dates, active/expired state, and payment reference using existing schema or inspect/approve schema change before creating new tables.
6. Enforce commission exemption and 1.5% non-subscriber deduction in ride and marketplace settlement paths.
7. Verify 2.5% customer platform fee, ₹25 cap, refund/cancel reconciliation and pending-vs-collected ledger reporting.
8. Complete workflow regressions, security review and release gate.

## No production action
No production deployment, live payment, schema change or merge was performed.
