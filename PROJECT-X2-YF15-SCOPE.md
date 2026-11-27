# Project X2 — YF15 Current App Branch Scope

**Active app branch:** `yf-test-1-to-15`  
**Production main:** intentionally untouched.  
**Project Arjuna X:** separate main-project QA and final production deployment after completion.

## Final implementation scope
1. RRS guest-driver photo: preview, compression (≤1 MB), persistence and authorized booking retrieval.
2. RRS departure date/time.
3. ERS departure date/time.
4. Customer platform fee: 2.5% of order/ride subtotal, capped at ₹25, using FRIEND RIDE platform Razorpay link `https://rzp.io/rzp/VDAnsnXS`.
5. Driver/Partner subscription payment link: `https://rzp.io/rzp/54cMN1g`.
6. RRS safety poster with bold/highlighted Telugu safety wording.
7. Regression QA for RRS/ERS, guest photo storage, departure-time persistence, payment-link/fee display, and critical workflows.

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
- Server-side Razorpay verification/webhook is not implemented. Secure order gating/payment confirmation remains pending.
- Verify Razorpay link configuration/amount behavior manually before real use.
- Partner/Driver subscription link is present; subscription payment verification and admin approval workflow must be tested.
- Partner QR/direct payment remains separate from FRIEND RIDE platform-fee payment.

## Release rule
Changes and preview deployments are limited to `yf-test-1-to-15`. Do not merge or deploy to `main`. Project Arjuna X production release will be handled separately after its QA/regression gate.

## Remaining checks
- Real-device OTP, SMS, push notification, and live tracking testing (not covered by browser-only QA).
- Confirm RRS/ERS departure-time persistence and RRS photo workflow in staging against deployed Supabase schema.
- Payment provider configuration and server-side verification.
- Original FRIEND RIDE logo asset upload/integration, if still pending.
