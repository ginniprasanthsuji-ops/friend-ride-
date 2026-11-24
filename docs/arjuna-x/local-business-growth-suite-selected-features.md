# FRIEND RIDE Local Business Growth Suite — Selected Features

Status: planning/contract stage. This document records the user's selected features: 9, 8, 5, 2, 1 from the Local Business Growth suggestions.

## Selected modules
1. Customer Feedback & Reviews (selection #9)
   - Reviews are tied to a completed order when possible; rating, review text, created time, store response/status.
   - Abuse safeguards: customer can review only eligible completed orders; avoid duplicate review per order; admin moderation/reporting.
2. Birthday & Special Day Offers (selection #8)
   - Customer may opt in and provide date; store/admin may configure eligible offer rules.
   - Birthday offers are not sent or issued without consent and valid customer date; define frequency limits and expiry.
3. Refer a Friend (selection #5)
   - Referral attribution, reward eligibility and status ledger; rewards only after qualifying event, not on signup alone.
   - Anti-abuse: self-referral checks, duplicate/account/device signals where available without invasive tracking, caps and admin review.
4. Flash Sale (selection #2)
   - Store Partner creates time-bounded offer: title, eligible items/categories, discount type/value, start/end, stock/claim cap, status.
   - Enforce start/end time and cap on backend; show countdown only as UI.
5. Digital Loyalty Card (selection #1)
   - Store-scoped points/stamps ledger and reward thresholds; earn only on verified eligible purchases.
   - Ledger adjustments require audit reason; reward redemption is atomic and single-use.

## App surfaces
- Customer: Local Store profile/offer pages, Reviews, Birthday Offers (opt-in), Referral, Flash Deals, Loyalty card.
- Partner: manage own reviews/replies, offer creation and status, loyalty settings, referral campaign settings, simple reports.
- Admin: moderation, offer/campaign approval if required, reward adjustments audit, abuse flags and reporting.

## Shared rules
- Keep existing app features intact; role authorization is mandatory and store-scoped.
- Supabase SQL/RLS is the source of truth for eligibility, points, rewards, sale caps, redemption and referral status.
- Firebase is for notifications only; notification delivery does not grant rewards or prove redemption.
- Payment/order verification must use existing trusted backend confirmation; client UI cannot mark a paid purchase as verified.
- No new paid APIs, AI APIs, or third-party subscriptions. No Python.
- No fabricated analytics; report only data actually recorded.
- Use explicit customer consent for birthday reminders and marketing notifications; honor opt-out.
- Build incrementally: schema contract, SQL/RLS, RPC/atomic workflows, UI, QA tests, then release review.

## Proposed rollout / acceptance checks
- Phase A: review existing schema and UI to avoid duplicate modules or conflicting tables.
- Phase B: schema/RLS contract and audit-safe ledgers.
- Phase C: Flash Sale and Loyalty Card core workflows.
- Phase D: Feedback & Reviews, Referral, Birthday offers.
- Phase E: Partner/Admin/Customer UI, notifications and reports.
- Phase F: static contracts, browser simulations and real-device staging checks.
- Verify store ownership for partner writes, customer eligibility, offer expiry, limits, duplicate claims, atomic reward redemption, notification opt-out, and admin audit trails.

## Progress
- Selection confirmed: 5 of 5 modules.
- Design contract recorded.
- Implementation not yet started; no production deployment or merge.


## Coupon Market addition (requested)
- Store creates coupon with title, terms, type, face value, sale price, minimum purchase, validity window, inventory cap, and per-customer limit.
- Customer browses active coupons, buys through existing payment flow, and receives a unique coupon QR/token only after trusted payment verification.
- Store partner redeems one-time token; backend validates coupon validity, store ownership, expiry, and duplicate redemption atomically.
- Admin approval/reporting and coupon sales/redeem metrics.
- Schema proposal committed separately; trusted purchase issuance, payment confirmation, and redemption RPCs/UI remain pending. Do not deploy this migration yet.


## Coupon issuers and ride-growth promotion (user clarification)
- **Store Partners:** create shop/product/service coupons and publish through approval/activation workflow.
- **Admin:** create platform-wide campaigns, ride coupons, category/service coupons, first-ride/new-user campaigns, festival promotions, referral-linked promotions, and targeted offers. Admin campaigns use the trusted admin path.
- **Drivers:** may create driver-specific promotional coupons subject to Admin approval; coupons can promote ride bookings (e.g. limited discount/credit or special fare campaign). Driver attribution and redemption are recorded to prevent misuse and evaluate ride lift.
- **FR app:** surfaces eligible coupons in Customer home, Ride booking before confirmation, Coupon Market, and notification banners (opt-in); show clear expiry, terms, eligibility, and capped availability.
- Ride coupons should have usage limits, validity, service/area constraints where supported, minimum fare, maximum discount, per-user cap, and eligibility/abuse protections. Do not allow client-side fare manipulation; discount is calculated and applied server-side before booking/payment.
- Driver coupon campaigns must not let drivers alter fare rules, claim fake rides, self-redeem, or reward unverified trips. Admin controls approval, caps, suspension, and reporting. Promotion success measured by verified completed rides and incremental usage—not coupon claims alone.


## Paid Coupon Market — confirmed requirement
- Coupons can be sold to customers (paid coupon purchase), not only distributed free.
- Issuers/sellers: Store Partner, Admin, and Driver (Driver paid coupons require approval and eligible ride-campaign scope).
- Coupon categories: store/product/service coupon, ride discount coupon, prepaid value coupon, percent/amount discount, BOGO, and pass where supported.
- Customer-facing listing must show sale price, coupon value/benefit, savings, terms, minimum purchase, expiry, quantity/limits, eligible merchant/service, and seller/issuer.
- Checkout uses the existing payment integration; coupon is redeemable only after trusted payment verification.
- My Coupons wallet provides unique QR/token and status; redemption is backend-validated and one-time, matched to the store or ride eligibility.
- Admin approval, campaign controls, fraud limits, refund/expiry policy, and verified sales/redemption reports.
- No assumed commissions or revenue share without explicit configured rules.


## Phase 13 scope confirmation (latest user selection)
Phase 13 specifically includes selected items **#2 Flash Sale, #5 Refer a Friend, #8 Birthday & Special Day Offers, #9 Customer Feedback & Reviews**, plus **FR Coupon Market Direct-to-Store Payment + Automatic Recognition**. The previously selected Digital Loyalty Card (#1) remains recorded in the broader selected-features list, but is not part of this Phase 13 scope unless reselected.
