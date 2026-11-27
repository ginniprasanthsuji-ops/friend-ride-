# YF15 Razorpay secure verification — implementation notes

## Backend foundation added
- fr_razorpay_payment_orders stores user-bound server-created Razorpay orders and verified payment state.
- fr-razorpay-create-order creates platform-fee Orders API orders. Fee is calculated server-side at 2.5%, capped at ₹25 (2500 paise).
- fr-razorpay-verify-payment validates HMAC, fetches the payment from Razorpay, and checks captured status, order ID, amount, INR, and user ownership before marking the payment record paid. Idempotent retry of the same captured payment is supported.

## Secrets required (not committed)
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET
- Supabase Edge Function environment provides Supabase URL and service-role key.

## Integration safety gate
The current fr_customer_place_market_order RPC definition is not present in YF15 repository migrations, and is absent from the connected FRIEND RIDE QA database. The client order workflow therefore cannot yet be safely changed to require this verified payment record without reconstructing and validating the authoritative order RPC and price calculation. Do not treat these functions alone as payment gating. Do not deploy or enable checkout until the market-order RPC is updated to enforce the verified payment record atomically.

Subscription uses a fixed Razorpay Payment Link, not a dynamic Razorpay order. Secure automatic verification requires the actual Razorpay payment-link ID and expected subscription amount/plan mapping; these are not available in the repo. Keep manual admin verification until configured.
