# Phase 13 QA — Catalogue/Checkout, Home Services, Referral, Flash Sale and ERS/RRS recheck (2026-11-26)

QA branch source and QA Supabase project only. Read-only metadata/static source review; no backend writes, migrations, production changes, or live customer workflows.

## Catalogue/cart/order
- QA catalog query for market/catalog/cart/order/parcel/store families returned only `fr_store_campaigns` and `fr_store_campaign_redemptions` (campaign tables); no market order/catalog/cart/parcel table family was returned.
- Public function catalog query for market/catalog/cart/order/parcel names returned no functions.
- Frontend static RPC inventory includes market/store operations such as partner catalogue save/list, customer catalogue/list/orders/place order/multi-market order, quote and payment functions. Name-level QA catalog parity is absent for the sampled operations (prior 58-RPC comparison documented 33 frontend references absent).
- The standalone Flash Sale checkout asset calls `fr_customer_accept_market_quote`; that exact function is absent from QA catalog.
- Therefore full catalogue/cart/order checkout is not runtime verifiable against this QA schema.

## Home services
- QA tables exist: `fr_service_bookings`, `fr_service_categories`, `fr_service_provider_applications`, `fr_service_providers`, `fr_service_requests`.
- Read-only RLS metadata shows provider application insert is own UID + pending; application read own/admin; provider manage admin-only, read approved/owner/admin; customer service-request insert own/requested/unassigned; requests read customer/provider/admin; admin-only update.
- RPC definitions reviewed: customer request requires customer role, active category and valid request fields; optional provider must be approved, online, and category-matched. Admin assignment checks admin membership and approved/online/category match. Provider request transitions require approved owner and valid state progression. TASKO/Laundry provider transitions enforce assigned-owner, service-type and sequential state checks.
- `fr_service_bookings` has payment-status/reference/submitted/verified columns. Frontend references `fr_tasko_submit_payment` and `fr_tasko_admin_verify_payment`; QA catalog has neither exact function. Payment workflow remains a schema/function mismatch.
- No runtime booking/provider/assignment/payment test was executed.

## Referral
- Customer referral code get/create and bind functions exist in QA catalog; customer-code UI asset uses get/create.
- Admin review and reward-credit RPCs exist. Reviewed definitions: admin membership check, approval decision validation, >=2 eligible-order gate, ₹50 configured reward check for credit, idempotent ledger insert/duplicate handling.
- QA contains both legacy and customer-referral table families. Market order tables/RPCs are absent, so the eligible-order counter's runtime fulfillment and end-to-end referral earning/credit cannot be verified.

## Flash Sale
- QA tables `fr_store_campaigns` and `fr_store_campaign_redemptions` exist.
- RLS metadata: admin-all campaign policy via `is_friend_ride_admin()`; public SELECT limited to active, approved, in-window campaigns.
- Reservation and cancellation RPCs exist. Reservation definition checks authenticated customer, subtotal, idempotency-key ownership, campaign type/approval/active window, minimum amount, per-user limit and quantity limit. Cancel checks reservation owner/status and linked-order state; if order table is unavailable it fails closed for linked reservations.
- Frontend has explicit message that reservation is not checkout/payment discount. It attempts `fr_store_flash_sale_attach_order`; exact RPC is absent. Reservation-to-order linking and discount application therefore not connected/verified.
- `fr_customer_special_day_set` frontend reference is absent from QA catalog.

## ERS/RRS
- Existing focused QA evidence `qa/phase13c-ers-rrs-focused-verification-2026-11-26.md` remains applicable: ERS/RRS is not wired into inspected main source; role guards missing on sampled road ride create/book; driver contact branch returns latest passenger only; draft SQL not applied.
- Static tests exist, but this run did not execute Node/Playwright locally. CI is the test executor; statuses must be checked after evidence commit.

## Frozen progress
No new checklist stage created and no estimates changed. Planning/Checklist 88% frozen; Overall Audit 12% frozen; graph frozen; Phase 13C 91% frozen.
