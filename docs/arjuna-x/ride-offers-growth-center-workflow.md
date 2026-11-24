# FRIEND RIDE Ride Offers & Growth Center — Workflow

Status: implementation design committed to QA branch; not deployed.

## Roles and entry points
- **Admin:** create platform campaigns, approve driver campaign requests, configure budgets/discount caps/eligibility, pause or cancel, review metrics.
- **Driver:** request/create a promotional campaign using a unique promo code; cannot activate or set fare rules independently. Campaign approval is required.
- **Customer:** discover eligible offers in Home, Ride Booking before confirmation, Ride Offers & Growth Center, and coupon wallet.
- **Backend:** authoritative eligibility, price/discount calculation, promo attribution, limits, campaign budget, booking state and completion validation.

## Campaign types
1. First Ride offer.
2. Repeat Ride / Ride Again offer (limited window).
3. Off-Peak campaign (admin-defined times).
4. Referral Ride offer (integrates existing referral system; no duplicate rewards module).
5. Fixed amount or percentage discount with max discount cap.
6. Ride target challenge (e.g. qualifying ride target then reward coupon).
7. Daily/Weekly ride pass (limited usage, dates, service eligibility).
8. Area/locality campaign where supported by existing location schema.
9. Festival/event campaign.
10. Morning/night campaign with time window.
11. Return-trip campaign.
12. Driver promo campaign and driver attribution.
13. Student/family/group promotion only if eligibility verification exists; otherwise disabled or admin-managed rules.

## Lifecycle
draft -> pending_approval -> approved -> scheduled -> active -> paused -> expired | cancelled | rejected
- Admin campaign may use trusted admin creation/approval path.
- Driver campaigns begin pending approval.
- Store coupons remain in Coupon Market, not Ride campaign UI, unless campaign explicitly supports ride scope.
- Start/end dates, available budget, campaign quantity, per-customer cap and terms are mandatory.
- Never allow client writes to campaign status, campaign spend, claimed count, reward status or discount result.

## Customer booking workflow
1. Customer opens Ride Booking and enters route/service details.
2. Backend fetches active campaigns and evaluates eligibility (customer, first/repeat status, time, area, ride type, pass balance, campaign cap).
3. App displays applicable offers with expiry, terms, maximum discount and estimated fare impact.
4. Customer selects coupon/campaign; backend recalculates quote. If fare or campaign eligibility changes, refresh quote.
5. Booking is created with immutable campaign/coupon attribution and quote snapshot.
6. Payment/ride flow uses existing verified booking/payment logic.
7. On completion, trusted backend checks ride completed, no cancellation/fraud flags, and unique qualifying ride; only then updates campaign counters/challenges/rewards.
8. Customer sees completion/reward state and issued coupon in wallet.
9. Driver campaign attribution is recorded; reward/credit is issued only by server rules after verified completed qualifying ride.

## Driver promotion workflow
1. Driver opens Driver Dashboard > Promotions.
2. Creates draft request: campaign title, goal, promo code (system generated or validated), offer type, suggested value (within admin guardrails), dates, target area/service if supported, cap, description/terms.
3. Submit -> pending admin review.
4. Admin reviews safety, discount caps, overlap, budget, eligibility, fraud risk, and campaign wording; approve/reject/request edits.
5. Approval activates/schedules it; driver cannot edit approved rule fields. Admin may pause/revoke.
6. Driver shares approved code/link through allowed sharing UI. Customer opens FRIEND RIDE and code/offer is validated.
7. Verified completed rides are attributed to campaign. Driver sees limited stats (eligible completed rides, bookings, status, reward status); no private customer data.
8. Fraud checks: self-referral, driver/customer same identity or linked accounts, repeated device/payment abuse where supported by existing data, duplicate/cancelled rides, ride completion validation, per-user and campaign caps.

## Admin campaign workflow
1. Admin creates campaign and configures scope, eligible ride type, area/time, offer, min fare, max discount, budget/coupon count, per-user cap, validity, terms.
2. System validates overlap and constraints; campaign saved draft.
3. Admin activates or schedules.
4. Customer sees only eligible active campaign.
5. Campaign automatically stops on expiry, budget/quantity cap, or admin pause.
6. Admin report: impressions (if instrumented), offer selections, bookings, verified completed rides, cancellations, discount cost, repeat booking rate and driver attribution. Do not fabricate metrics when events are not instrumented.

## Coupon and challenge wallet
- Each issued ride coupon has a unique token/QR and status: issued, redeemed, expired, cancelled.
- Redemption or discount application is server-validated, single-use where applicable, and recorded with ride/booking reference.
- Challenges track qualifying verified rides, target, expiry, reward state; idempotent event processing prevents duplicate progress/rewards.
- Passes track remaining uses and validity, and must not be double-consumed.

## Required backend validations
- Discount is computed server-side and cannot exceed campaign cap, fare, or configured budget.
- Campaign state and dates checked at quote and booking.
- Atomic cap/budget claim with rollback on failed booking/payment.
- Unique attribution and idempotency for booking, completion, issue, redeem.
- No reward for cancelled, duplicate, unverified or self-referred rides.
- Role-based RLS and admin actions audited.
- Notifications are informational; notification delivery is not proof of booking, payment, reward, or redemption.
- Existing referral, ride, fare, payment, notification and coupon systems must be audited and integrated rather than duplicated.
- Keep implementation within GitHub, Supabase SQL, Firebase; no paid AI APIs/services.

## UI placement
- Customer: Home offer tile, booking quote offer selector, Ride Offers & Growth Center, Coupon Wallet.
- Driver: Driver Dashboard > Promotions, My Campaign, qualifying ride stats, share promo code.
- Admin: Admin Dashboard > Ride Campaigns, approvals queue, campaign controls and reports.

## QA workflows (simulation first)
1. Admin create first-ride campaign -> active -> eligible new customer sees offer -> quote discount -> booking -> verified completion -> one reward.
2. Repeat-ride coupon -> qualifying prior ride -> offer shown within window -> use once.
3. Driver creates promo -> pending -> Admin rejects; driver cannot activate.
4. Driver promo -> Admin approves -> customer booking attribution -> completed ride counts once.
5. Self-referred or linked driver/customer identity -> reward blocked.
6. Campaign cap reached -> new claims blocked atomically.
7. Expired/paused campaign -> offer not selectable.
8. Cancelled ride -> no challenge progress/reward.
9. Challenge duplicate completion event -> count once.
10. Pass use concurrent booking attempt -> only one consumption per use.
11. Area/time/service eligibility mismatch -> offer hidden or rejected by backend.
12. Admin pauses campaign -> new claims blocked, existing booking snapshot handled per policy.
13. Verify RLS: customer cannot read private campaign admin data; driver sees only their campaign summary; partner/store coupon data is isolated.
14. Validate real push/OTP on separate devices later; browser simulation is not proof of device delivery.

## Current implementation status
Workflow is documented. SQL proposal, role enforcement RPCs, campaign UI, integration, and QA execution are still pending. No live schema execution or deployment.
