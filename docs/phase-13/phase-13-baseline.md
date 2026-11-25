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
