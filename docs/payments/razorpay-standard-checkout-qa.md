# FRIEND RIDE Razorpay Standard Checkout (QA)

## Scope
- Static HTML frontend uses Razorpay Checkout.js.
- Supabase Edge Function: `fr-razorpay-checkout` handles authenticated order creation and HMAC-SHA256 signature verification.
- Only the current Partner subscription plans are accepted: Basic ₹299, Growth ₹599, Premium ₹999.
- No database tables are added.
- Payment signature verified is **not** the same as subscription activated. Subscription persistence/activation must be connected to the existing subscription data model before live use.

## Secrets
After rotating any credentials that were exposed, set these as Supabase Edge Function secrets (never commit actual values):
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Example local file is `.env.example`; it contains placeholders only. `.env` and `.env.*` are gitignored.

## Deploy / test manually
1. Rotate the Razorpay test credentials in the Razorpay Dashboard because previously shared credentials should be treated as exposed.
2. Set the four Supabase Edge Function secrets above using the Supabase dashboard or CLI.
3. Deploy `supabase/functions/fr-razorpay-checkout` to the FRIEND RIDE QA Supabase project; keep live mode disabled.
4. Use the QA app and login to a test Partner account. Choose Basic/Growth/Premium; the server creates the order and the modal opens.
5. Complete a Razorpay test payment. Server verifies signature, fetched order ownership/plan/currency, payment-to-order linkage, amount, and captured status.
6. Try cancel, failed payment, unauthorized request, tampered signature, and invalid amount.
7. Confirm verified/captured payment is **not** displayed as Active subscription until subscription database mapping/activation is implemented.

## QA contract test
Run: `node --test qa/razorpay-contract.test.mjs`

## Pending
- Deploy function and set rotated secrets.
- Real QA checkout in Razorpay Test Mode.
- Persist verified subscription activation/expiry in the existing backend schema and tie the 1.5% commission waiver to transaction-time subscription status.
- Live onboarding and real payment are blocked until Razorpay website/app review completes.
