# FRIEND RIDE — Phase 13 Baseline & Feature Audit

Date: 2026-11-25
Repository: `ginniprasanthsuji-ops/friend-ride-`
Branch: `arjuna-x/phase-13-feature-audit`
Supabase production project: `fglyplxcczdjtfwobtzh`

## Phase 13 scope (user-selected)
- #2 Flash Sale
- #5 Refer a Friend
- #8 Birthday / Special-Day Offers
- #9 Feedback / Reviews
- Direct-to-Store Payment Coupon Recognition

Digital Loyalty Card (#1) is excluded. Phase 13 must not add paid external APIs/services or Python; keep implementation within existing GitHub, SQL/Supabase, Firebase app stack.

## Baseline database audit (read-only, 2026-11-25)
Tables matching feature names currently found:
- `driver_referral_rewards` — existing driver-referral rewards table; RLS enabled.
- `driver_referrals` — existing driver referral records; RLS enabled.
- `fr_ride_feedback` — existing ride-feedback table; RLS enabled.
- `fr_support_feedback` — existing support feedback table; RLS enabled.
- `ride_offers` — ride fare offers; RLS enabled (not Flash Sale).
- `fr_notification_preferences` — notification settings; RLS enabled.

No matching public table was found for store coupons, flash sales, birthday offers, or customer/store referrals in this name-based audit. This is a baseline, not a full schema/function search.

## Important separation
- Existing ride QR/token payment flow is not a reusable store coupon.
- Direct-to-store payments must not be represented as platform payment collection or falsely marked as paid by FRIEND RIDE.
- Coupon recognition should record eligible proof/confirmation and coupon redemption, with single-use/idempotent protection, rather than fabricate payment status.

## Proposed task order
1. Read-only schema/function/policy audit and frontend feature search (avoid duplicate implementation).
2. Design shared offer/coupon data model with scope, dates, eligibility, redemption limit, status, owner/admin controls, and audit fields.
3. Flash Sale: merchant/admin configuration, time-window enforcement, stock/quantity caps, customer display, and expired-sale rejection.
4. Refer-a-Friend: customer referral codes, fraud/duplicate protection, reward eligibility, and reward ledger; reuse existing driver referral tables only for driver referrals.
5. Birthday/Special-Day Offers: opt-in/eligible profile date handling, privacy-aware matching, offer validity window, and notification preference checks.
6. Feedback/Reviews: reuse existing feedback tables where appropriate; add store/product review model only if absent; moderation and verified-order linkage.
7. Direct-to-Store Payment Coupon Recognition: coupon claim/recognition flow; single-use redemption and idempotency; never treat offline/direct payment as platform-collected payment.
8. RLS and permission review for each new or reused table/function; least-privilege customer/partner/admin access.
9. QA matrix and regression tests; document items requiring real-device/live payment proof separately.

## Acceptance / closure rules
- Each task is processed once; no endless Continue/checkpoint loop.
- Statuses are only PASS, FAIL, BLOCKED, or PENDING with evidence.
- PASS requires code/SQL/test evidence, not a plan or draft.
- SQL migrations must be reviewed and applied through the appropriate Supabase migration process; no production DDL is run by this baseline document.
- Do not claim production deployment or real payment verification unless actually observed.

## Baseline status
- Branch created: PASS.
- Live Supabase read-only name/column/RLS-enabled audit: PASS.
- Full policy/function/frontend search: PENDING.
- Implementation and tests: PENDING.

## Additional read-only audit findings (2026-11-25)

### Frontend / repository search
- Search for `flash sale`, `birthday offer`, and `coupon redeem`: no indexed matching code results returned.
- `referral code` search found the release-gate document noting referral approvals and cash rewards are BLOCKED pending server-side eligibility/SQL mapping; BLUEPRINT lists referral as a planned user feature.
- `review feedback` search found existing support feedback/homepage ratings flows and QA checks; these are support feedback/rating publication, not a verified store/product review system.
- Search is index-based and incomplete; this does not prove a feature is absent from all frontend files.

### RLS policy read-only review
- Driver referrals: authenticated users can read their own referrals; admins can read all. Driver reward rows are readable by the referrer/admin.
- Ride feedback: insert is restricted to the authenticated ride participant and a completed ride; participant read policy exists.
- Support feedback: own-read and own-insert restrictions exist; admin read/update policies exist. Insert defaults restrict status to new, homepage publication false, and admin note null.
- RLS is enabled on the audited tables. This is not a complete security review of functions/triggers/grants or all policies.

### Feature inventory disposition
- Flash Sale: no matching table identified; frontend search returned no indexed result. Design/build needed.
- Customer Refer-a-Friend: existing referral structures are driver-only; customer referral/reward workflow remains to be audited/designed.
- Birthday/Special-Day Offers: no matching table identified; frontend search returned no indexed result. Design/build needed.
- Feedback/Reviews: existing ride feedback and support feedback structures; verified store/product review workflow not confirmed.
- Direct-to-Store Payment Coupon Recognition: no coupon table found in this baseline. Must be separate from ride QR/payment flow and have one-time redemption protection.

## Audit checkpoint
- Repository branch and baseline documentation: PASS (commit created on feature-audit branch).
- Live Supabase schema and RLS-policy read-only audit: PASS for the limited matching-table scope.
- Full function/trigger/grant audit and complete frontend file search: PENDING.
- No production SQL or app-code feature implementation has been applied in this checkpoint.

## Phase 13 Task 3 — Flash Sale UI checkpoint (2026-11-25)
- Added Admin Dashboard tile and campaign screen in `index.html`.
- Added campaign creation fields: code, title/description, discount type/value, minimum spend, optional max discount, start/end, quantity cap, per-customer limit, optional store partner UUID.
- Admin campaign create uses authenticated Supabase client + existing admin RLS; sets active/approved fields and records creator/approver IDs. DB policy remains the authorization gate.
- Added customer Flash Sale listing within Offers & Rewards. Customers can reserve/cancel a reservation using the authenticated RPCs and view calculated discount/code.
- Supabase verified: campaign table has RLS enabled and 2 policies; redemption table has RLS enabled and 1 policy.
- Static integration checks: asset include, Admin page/tile, customer container and expected UI functions all present.
- **Important limitation:** reservation is not yet tied to the store checkout/order table. UI explicitly labels reservation as not order/payment confirmation. Checkout integration and authenticated browser end-to-end tests remain pending.
- Commits: UI/index `b9002842`; asset `daf96f01`; globals fix `a33b9c43`.
- Task 3 status: foundation and UI integration PASS; order/checkout integration and E2E QA PENDING.

## Phase 13 Task 4 — Customer Referral foundation (2026-11-25)
- Supabase migration applied: `phase13_customer_referral_foundation`.
- Created `fr_customer_referral_codes` (one unique customer code per customer) and `fr_customer_referrals` (referred-customer unique, referrer/referred IDs, eligibility count/status, ₹50 reward record, admin review fields).
- RLS enabled on both tables; verified each has 2 policies. Participant read access is restricted to involved users/admin; direct client writes are not enabled by policies.
- Secure RPC `fr_customer_referral_get_or_create_code()` creates/returns a code only for authenticated customer-role profile; execute granted to authenticated, revoked from public/anon.
- Added customer Offers page card to fetch, copy, and share code.
- Static checks: UI asset included; card and functions present; referral insert is not done client-side.
- **Pending:** referred-code capture during customer signup, referral binding RPC, completed-order eligibility trigger/workflow, anti-abuse/self-referral checks beyond schema, admin approval queue UI, actual ₹50 ledger credit. Do not show rewards as credited until backend payout/ledger integration exists.
- Migration GitHub commit: `27eff64f`; UI commit: `8a304a98`; JS commit: `2d750b8c`.

## Phase 13 order-schema discovery checkpoint
- Store-order candidates include `fr_market_orders`, `shop_orders`, `fr_food_orders`; schema/units/status differ. `fr_market_orders` stores subtotal and total in paise; `shop_orders` stores numeric rupees. Current HTML contains market-order partner/customer flows referencing `fr_market_orders`.
- Checkout/payment integration is deferred until a specific authoritative store checkout/order flow and status transitions are mapped. No order/payment tables were changed.

### Customer referral signup binding added
- Added optional customer referral code field to customer registration only (role visibility controlled by existing registration field-sync function).
- Added authenticated SECURITY DEFINER RPC `fr_customer_referral_bind_code(text)`: validates customer role, active referral code, self-referral, and one referral per referred customer; creates pending referral record, no immediate reward credit.
- Verified both referral RPCs are SECURITY DEFINER; anon execute=false; authenticated execute=true.
- Registration continues even if code invalid, with a warning displayed; referral does not block account creation.
- E2E signup and referral reward eligibility still not device/browser tested.
- Binding migration commit: `cfb36311`; registration UI commit: `ebac8b73`.

## Phase 13 Task 4 continued — Customer Referral Admin Review
- Applied secure RPC `fr_customer_referral_admin_review(uuid,text,text)`: Admin-only approval/rejection, row locking, final-state guard, reviewer and review timestamp stored.
- Verified SECURITY DEFINER; anon execute=false; authenticated execute=true (RPC internally requires admin).
- Added Admin Dashboard tile and referral-review page. Admin list shows code, referral/reward statuses, eligible-order count, participant UUIDs, notes; approve/reject controls with optional note.
- Explicitly states approval does not credit wallet. Reward ledger/payment credit remains pending until ledger schema and eligibility are verified.
- Static checks PASS: page, dashboard tile, JS asset include, list/review handlers and RPC invocation found.
- No real referral records exist yet; E2E review test pending.
- Migration commit `61bc2d38`; page commit `72a399d9`; JS commit `abce217b`.

## Referral order eligibility investigation
- `shop_orders` and `fr_market_orders` schemas exist but current data query returned no order-status rows. No completed-order status values/constraints were discoverable from the inspected schema, and repository UI code does not show a direct checkout/order-status integration.
- Therefore automatic 2-order eligibility trigger was **not** added; this avoids counting unverified statuses or unrelated order types.
