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


## Continued X2 verification — 2026-11-27
- Current branch head: `18d6080bbe9f9a587ea73091d4d13c91572af942` (RRS post-handler repair).
- RRS handler fix was deployed in YF15 Preview Deploy #30 and passed Playwright Regression #107, Button/JS Audit #112, and Pages Build #479.
- Connected FRIEND RIDE QA Supabase project `pqsangtvietawkfgpgfu`: confirmed deployed RRS guest-post RPC signature includes passenger capacity, departure timestamp, and driver photo data.
- Negative backend validation check: malformed RRS payload rejected by the deployed RPC (PASS); no test ride was inserted.
- The QA database does not currently contain the market-order RPC/table definitions or the X2 payment-order ledger. Therefore the secure Razorpay integration remains code-only and cannot safely gate real market orders yet.
- Main/production untouched; work remains restricted to `yf-test-1-to-15`.


## Current continuation report — 2026-11-27 (YF15)
**Verified branch HEAD at this check:** `357bf9ca02f21b3871ff6f315666179d6be2e73f`

### Current CI / deploy results for this commit
- YF15 Preview Deploy #31: **PASS** — https://github.com/ginniprasanthsuji-ops/friend-ride-/actions/runs/45936669079
- Button & JavaScript Audit #113: **PASS** — https://github.com/ginniprasanthsuji-ops/friend-ride-/actions/runs/45936669060
- Playwright Regression & E2E #108: **PASS** — https://github.com/ginniprasanthsuji-ops/friend-ride-/actions/runs/45936669135
- GitHub Pages Build #480: was still running at the last status poll; Pages #479 on previous commit `18d6080b` passed. Do not claim #480 PASS until it completes.

### Release readiness
Project X2 is **not yet 100% complete**. Automated CI, JavaScript/button audit, preview deployment and Playwright regression/E2E are passing on the current YF15 commit, but secure platform-fee payment integration is incomplete and not deployed. Real staging persistence tests (RRS/ERS departure time and guest photo), real device OTP/SMS/push/live tracking, subscription payment verification, and final full workflow release gate remain outstanding. No production/main deployment or merge is authorized.

### User's launch sequence
- Continue X2 exclusively on `yf-test-1-to-15` for the planned test period.
- Mark X2 100% only after implementation blockers are resolved and final CI, regression, E2E, Playwright, deployment and backend/device checks are completed with evidence.
- Then work on Project Arjuna X separately; main production launch only after Arjuna X is complete and its release gate passes.


## Project X2 continuation — 2026-11-27 safety hardening
- Reviewed connected QA database `pqsangtvietawkfgpgfu`: no market-order RPC/table or Razorpay payment-order ledger exists in this QA project.
- Disabled real Razorpay order creation in `fr-razorpay-create-order` by failing closed with HTTP 503 until server-authoritative cart/catalog pricing RPC is implemented. This prevents client-submitted subtotal from generating a real payment order.
- Commit: `642e1c676d322130ee11cc7e4a2779f6dd2b4473` on `yf-test-1-to-15`.
- This is a safety gate, not payment integration completion. Checkout remains blocked pending trusted catalog pricing, market-order RPC and atomic verified-payment gate.


## Project X2 user-provided Razorpay links and banner update — 2026-11-27
- Subscription Payment Link: `https://rzp.io/rzp/54cMN1g`. Added four role banners (Partner, Driver, Technician, Non-Technician) on the Subscription page, all pointing to the same supplied subscription link.
- Platform fee link: `https://rzp.io/rzp/VDAnsnXS`. Existing ride fee and market-cart fee calculations changed from 2.5% capped at ₹25 to uncapped 2.5%, rounded to paise. This link is static; it may not accept a dynamically calculated amount automatically. UI calculates the fee and tells the user to confirm/pay the exact amount; no verified server payment completion is claimed.
- The four uploaded image artworks are not yet stored in repository assets because the GitHub connector cannot upload binary image files. Current subscription banners are responsive styled cards; original artwork assets remain pending.
- Commit: `3d14fa449ef63da2d36b43932db044efa1ce9603` on `yf-test-1-to-15`.
