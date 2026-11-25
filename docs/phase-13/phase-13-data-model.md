# Phase 13 — Shared Offer / Coupon Data Model (Task 2)

Date: 2026-11-25
Branch: `arjuna-x/phase-13-feature-audit`

## Design principles
- Reuse the existing `profiles` role identity (`auth.uid()`) and existing feedback/referral structures where compatible.
- Do not merge ride fare offers (`ride_offers`) with store campaigns; `ride_offers` is driver-to-ride fare negotiation.
- Keep customer DOB private and opt-in. Existing `profiles` columns audited do not include DOB; birthday offers must not infer it.
- Keep direct/offline store payments separate from FRIEND RIDE payment collection. Coupon recognition is not payment verification.
- No new paid external service or Python. Use Supabase SQL/RLS, current frontend, and existing Firebase notifications if configured.
- All redemption/reward operations should be server-side RPC/transactional with idempotency keys and unique constraints; client-side price/eligibility is never trusted.

## Proposed entities

### A. `fr_store_campaigns` (shared campaign/offer master)
Fields:
- `id uuid PK`
- `campaign_code text unique` (normalized uppercase, unique)
- `campaign_type text` check in `flash_sale, birthday, special_day, referral_reward, coupon`
- `title, description`
- `partner_id uuid nullable` (null means platform-wide; otherwise store-specific)
- `discount_type text` check `percentage, fixed_amount, free_delivery`
- `discount_value numeric` nullable (required for percentage/fixed; range checks)
- `minimum_order_amount numeric default 0`
- `maximum_discount_amount numeric nullable`
- `starts_at, ends_at timestamptz`
- `quantity_limit integer nullable` and `quantity_redeemed integer default 0`
- `per_user_limit integer default 1`
- `eligibility jsonb` (restricted documented keys; admin-managed, never arbitrary SQL)
- `is_active boolean default false`, `approval_status text` (draft/pending/approved/rejected)
- `created_by, approved_by uuid`, `created_at, updated_at`

Constraints: starts_at < ends_at; quantity_limit positive when present; counters nonnegative; percentage discount 0–100; fixed amount >=0; max discount >=0. Approval and activation require admin policy/transaction. Flash-sale stock decrement must be atomic.

### B. `fr_store_campaign_redemptions`
- `id uuid PK`
- `campaign_id uuid FK`
- `customer_id uuid FK profiles`
- `order_id uuid nullable` (add FK only after exact store-order table is confirmed)
- `redemption_code text nullable`
- `status text` check `reserved, redeemed, cancelled, expired`
- `discount_amount numeric`
- `idempotency_key text unique`
- `reserved_at, redeemed_at, created_at`
- unique constraints appropriate to campaign/user and order/campaign, based on configured per-user limit.
Redemption RPC rechecks campaign time, approval, eligibility, minimum spend, remaining quantity, per-user limit, and computes discount server-side; it locks the campaign row for atomic stock/redeem changes.

### C. Customer Refer-a-Friend
`fr_customer_referral_codes`: id, owner_customer_id (unique), code (unique), created_at, active.
`fr_customer_referrals`: id, referral_code_id, referred_customer_id unique, referrer_customer_id, status (registered/qualified/reward_pending/rewarded/rejected), qualifying_order_id nullable (FK pending exact order table), reward_campaign_id nullable, created_at, qualified_at, rewarded_at, rejection_reason.
- Self-referral forbidden; referred customer unique prevents multiple codes; code owner must be a customer.
- Qualification and reward grant require server-side qualifying conditions, verified order state and admin-configured reward policy.
- Reuse `driver_referrals` and `driver_referral_rewards` only for driver referral program; do not mix customer IDs into driver-only schemas.

### D. Birthday / Special-Day privacy
`fr_customer_dates`: customer_id PK/FK profiles, birth_month smallint, birth_day smallint, optional special_day_month/day, consent boolean default false, updated_at. Prefer month/day only unless full DOB is required; do not expose date to partners. Validate month/day, consent, and profile owner/admin-only read. Offer generation should use a server-side date window, no public DOB query.

### E. Store/product reviews
Reuse `fr_ride_feedback` for ride-specific feedback and `fr_support_feedback` for support tickets/public testimonials. Do not repurpose support feedback as product reviews.
Proposed `fr_store_reviews`: id, customer_id, partner_id, product_id nullable (exact product table/FK to be confirmed), order_id nullable (exact store-order table/FK to be confirmed), rating 1–5, review_text, status (pending/published/rejected), admin_note, created_at, updated_at. Verified-order status must be checked server-side; one review per verified order/item; publication is moderation-controlled. Keep customer phone/private.

### F. Direct-to-Store Coupon Recognition
Use campaign/redemption records, not payment transaction rows. For direct payment:
1. Customer selects a campaign coupon and submits claim/redemption request.
2. Store partner sees claim and confirms eligibility and payment was received directly (if confirmation is part of the offer rule).
3. Backend records partner confirmation, coupon redemption, actor/time, order reference if known, and idempotency key.
4. Admin can inspect audit history and revoke only with a reason.
- Never create a FRIEND RIDE payment success/settlement record from direct payment confirmation.
- Never let a customer mark a coupon redeemed without server validation.
- Optional proof attachment is a secure private storage path only; not required by default.

## Permission / RLS plan
- Customers: read active public campaign details; read their own redemption/referral/review/date records; create own claims/reviews/referral registration only through guarded RPC or narrow INSERT policy.
- Partners: read campaigns for their own store and customer claims relevant to their store; confirm eligible coupon claims via RPC; no access to customer DOB or other stores' data.
- Admin: approve campaigns, moderate reviews, manage special-day policy, inspect audit/reward status.
- Anonymous: only public active campaign display; no redemption/referral/review data.
- Enable RLS on every new table; avoid broad authenticated policies. RPCs should have explicit auth checks, safe search_path, and revoke default execute from public where applicable.

## Required RPCs (implementation tasks)
- `fr_campaign_validate_and_redeem` — atomic campaign eligibility/quantity/per-user/idempotency.
- `fr_customer_referral_register` — self-referral/duplicate prevention.
- `fr_customer_referral_qualify` — verified qualifying-order transition.
- `fr_customer_referral_reward` — reward ledger/campaign grant with idempotency.
- `fr_customer_date_offer_match` — consent-based date matching; returns only eligible campaign/customer IDs to authorized callers.
- `fr_store_review_submit` — verified order/item check, duplicate guard.
- `fr_store_coupon_partner_confirm` — direct payment/coupon confirmation without creating platform payment records.

## Dependency notes / unresolved schema references
- Exact store-order, order-item, product/catalogue, partner/store, and payment tables must be identified before foreign keys or RPC logic are finalized.
- No new table/DDL is applied in this design task. This file is design-only.
- Task 2 acceptance: schema model and security/payment separation documented; PASS. Implementation waits for exact dependency table names and migration review.
