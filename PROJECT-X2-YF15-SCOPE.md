# Project X2 — YF15 Current App Branch Scope

**Active app branch:** `yf-test-1-to-15`  
**Production main:** intentionally untouched.  
**Project Arjuna X:** separate main-project QA and final production deployment after completion.

## Final implementation scope
1. RRS guest-driver photo: preview, private storage upload, booking persistence, secure retrieval for authorized workflow.
2. RRS departure date/time.
3. ERS departure date/time.
4. Customer platform fee: 2.5% of order/ride subtotal, capped at ₹25, using FRIEND RIDE platform Razorpay link `https://rzp.io/rzp/VDAnsnXS`.
5. Driver/Partner subscription payment link: `https://rzp.io/rzp/54cMN1g`.
6. RRS safety poster with bold/highlighted, grammatically correct Telugu safety wording.
7. Regression QA for RRS/ERS, guest photo storage, departure-time persistence, payment-link/fee display, and critical workflows.

## Payment safety
- Static Razorpay links and amount settings must be verified; don't claim dynamic amounts or server-side payment verification unless implemented and tested.
- Customer fee calculation: 2.5%, maximum ₹25.
- Partner/Driver QR or direct payment remains separate from FRIEND RIDE platform-fee payment.

## Release rule
Changes and preview deployments are limited to `yf-test-1-to-15`. Do not merge or deploy to `main`. Project Arjuna X production release will be handled separately after its QA/regression gate.
