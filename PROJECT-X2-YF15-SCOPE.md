# Project X2 — YF15 Current App Branch Scope

**Active app branch:** `yf-test-1-to-15`  
**Production main:** intentionally untouched.  
**Project Arjuna X:** separate main-project QA and final production deployment after completion.

## Final implementation scope / status
1. **RRS guest-driver photo:** preview and automatic compression to ≤1 MB; photo is sent to the guest-post RPC and returned only for confirmed RRS bookings. Static/backend checks present; staging persistence still needs live verification.
2. **RRS departure date/time:** UI and backend RPC support added; live staging persistence still needs verification.
3. **ERS departure date/time:** UI and backend RPC support added; live staging persistence still needs verification.
4. **Customer platform fee:** 2.5% of subtotal, capped at ₹25; platform Razorpay link `https://rzp.io/rzp/VDAnsnXS` is present. Secure dynamic order/verification foundation exists, but authoritative market-order integration remains blocked.
5. **Driver/Partner subscription link:** `https://rzp.io/rzp/54cMN1g` is present; automatic payment verification remains manual until payment-link ID/plan mapping is configured.
6. **RRS safety poster:** Telugu safety copy with highlighted helmet, traffic-rule, and enforcement warnings is present in the UI.
7. **FRIEND RIDE logo:** `friendride-new-logo.svg` is integrated into launcher and drawer.
8. Regression QA for RRS/ERS, photo compression, departure-time persistence, payment display, and critical workflows.

## Latest YF15 QA gate — PASS
**Commit:** `f0d758432301581e81fd0bd8421f4db874b561d6`

- YF15 Preview Deploy #19 — PASS
- Playwright Regression & E2E #96 — PASS
- Button & JavaScript Audit #101 — PASS
- GitHub Pages Deployment #468 — PASS

Workflow links:
- Preview: https://github.com/ginniprasanthsuji-ops/friend-ride-/actions/runs/45927763202
- Playwright: https://github.com/ginniprasanthsuji-ops/friend-ride-/actions/runs/45927763190
- Button/JS audit: https://github.com/ginniprasanthsuji-ops/friend-ride-/actions/runs/45927763197
- Pages: https://github.com/ginniprasanthsuji-ops/friend-ride-/actions/runs/45927763583

## Payment safety / remaining blockers
- Customer fee calculation: 2.5%, maximum ₹25; UI shows fee and Razorpay link.
- Platform-fee payment acknowledgement is **not verified payment**. The current client-side acknowledgement does not verify Razorpay transaction and must not be described as verified.
- Server-side Razorpay order-creation and payment-verification foundation is implemented in branch files, but is not deployed/applied or connected to checkout. Secure order gating/payment confirmation remains pending.
- Verify Razorpay link configuration/amount behavior manually before real use.
- Partner/Driver subscription link is present; subscription payment verification and admin approval workflow must be tested.
- Partner QR/direct payment remains separate from FRIEND RIDE platform-fee payment.

## Release rule
Changes and preview deployments are limited to `yf-test-1-to-15`. Do not merge or deploy to `main`. Project Arjuna X production release will be handled separately after its QA/regression gate.

## Remaining checks
- Real-device OTP, SMS, push notification, and live tracking testing (not covered by browser-only QA).
- Confirm RRS/ERS departure-time persistence and RRS photo compression/storage/retrieval in staging against deployed Supabase schema.
- Payment provider configuration, server-side verification deployment, and atomic market-order RPC integration; authoritative server-side cart pricing is required.
- Verify subscription payment-link amount/plan mapping and admin approval workflow.
- Confirm partner QR/direct payment is distinct from FRIEND RIDE platform-fee payment.


## Razorpay server-side verification foundation (YF15)
- Added migration file: `supabase/migrations/202611270002_fr_razorpay_payment_orders.sql` (not applied to any database).
- Added `fr-razorpay-create-order` Edge Function: authenticated user, Razorpay Orders API, server fee calculation (2.5%, capped at ₹25), and payment order record.
- Added `fr-razorpay-verify-payment` Edge Function: verifies HMAC, independently fetches payment API record, checks captured status/order/amount/currency, and records paid status for the owning user.
- Required secrets: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`; secrets are not committed.
- Functions/migration are repository-only and **not deployed/applied**.
- **Integration blocker:** market-order RPC definition is absent from YF15 repository migrations and the connected FRIEND RIDE QA database. Checkout/order creation cannot yet be enabled safely; market-order RPC must atomically require this verified payment record. Also subtotal is client-supplied at the current function boundary, so server-authoritative cart pricing must be connected before real payment use.
- Subscription static link cannot be auto-verified without actual Razorpay payment-link ID and expected plan amount mapping. Keep manual admin verification.
