# FRIEND RIDE Phase 13 QA Evidence — 2026-11-25

## Frozen handover (unchanged)
- Planning/Checklist: **88%** (frozen)
- Overall Audit estimate: **12%** (frozen; inventory estimate, not a pass rate)
- Progress graph: **frozen**
- Production/main: **untouched**
- Release state: **BLOCKED**

## Environment
- Repository: `ginniprasanthsuji-ops/friend-ride-`
- QA branch: `arjuna-x/phase-13-feature-audit`
- QA Supabase project: `pqsangtvietawkfgpgfu`
- Branch comparison: **91 commits ahead of main, 0 behind** (base `ac47fcd3766aad43525506dfa68a7378ec412eb7)).
- All test fixtures were created inside SQL transactions and rolled back. Final QA counts: **0 auth users, profiles, admin users, rides/bookings, service requests, referrals, campaign redemptions**.

## Verified QA-only changes

### 1) Security / RLS / Admin
- Corrected participant correlation in Road Ride and Shared Ride SELECT policies; original expression used booking-row self-comparison `b.ride_id=b.id`.
- Added passenger helpers and updated ride policies to avoid recursive RLS.
- Verified customer self-role elevation to admin is rejected by profile guard.
- Verified non-admin cannot call admin review.
- Public tables in the QA project currently have RLS enabled; no production policy changes were made.

### 2) RRS contact privacy and booking confirmation
- Limited direct `fr_road_rides` SELECT to safe listing columns; private phone/photo paths and exact coordinates are not directly readable.
- Added `fr_road_rides_public` safe live-listing view.
- Added driver-only booking confirmation RPC.
- Added participant contact RPC; phone details are available only after confirmed/active booking states. Contact RPC does not return photo paths.
- Driver photo bucket `road-ride-driver-photos` is private with owner-folder policies.
- SQL transaction tests verified: pending contact blocked; driver confirms; passenger receives driver phone; driver receives passenger phone; unrelated user cannot read booked ride or booking; direct phone-column access denied; live safe listing remains visible.

### 3) Main ride workflow
- SQL transaction test verified driver accept → start → complete.
- Customer and driver contact-detail RPCs returned only the assigned participants.
- Customer could read the completed ride; unrelated user could not.
- Two ride notifications were created across the tested lifecycle.
- Main-ride payment confirmation/QR backend is **not present in this QA schema**.

### 4) Home services
- SQL transaction test verified customer request → admin assigns an approved/online provider → provider accepts → starts → completes.
- Customer and assigned provider could read the request; outsider read returned 0.
- Live payment and KYC file upload are not verified; required storage buckets are missing in QA.

### 5) Referral rewards
- Fixed the older referral apply-code RPC to SECURITY DEFINER with empty search path; previously it could not read another user's referral code under RLS.
- Verified old referral: valid apply, duplicate/self/invalid rejection; admin reward verification produced exactly two ledger rows of **5000 paise each**; replay did not add rows; unrelated user saw no ledger.
- Applied/tested the newer customer-referral foundation, bind, admin eligibility guard and ledger-credit migrations in QA.
- Verified code generation, valid bind, duplicate/self/invalid rejection, approval blocked before eligibility, credit blocked before approval, simulated eligibility of 2 orders, admin approval, exactly one **5000-paise** credit, replay returned already-credited, participant visibility and outsider denial.
- The 2-order eligibility value was **simulated inside a rollback transaction**. The real completed-order eligibility trigger could not be applied/tested because `fr_market_orders` is missing.

### 6) Flash Sale
- Applied QA campaign/reservation foundation and hardened reserve/cancel RPCs.
- Corrected redemption-code generation to use `extensions.gen_random_bytes`, empty search path, explicit grants, and linked-order cancellation guard.
- Verified admin campaign insert, anonymous active-campaign read, reserve discount **₹5.00** (10% capped at ₹5), idempotent replay, minimum-order rejection, per-user limit, quantity exhaustion, cross-user idempotency-key rejection, cancellation releasing quantity, and re-reservation.
- Verified linked reservation cancellation is blocked while the order backend is absent.
- Reservation-to-order link and quote-acceptance discount/payment migrations remain **unapplied/unverified** because the market-order tables do not exist.

## Release blockers verified in QA
- Missing `fr_market_orders` and `fr_market_order_items` tables; market checkout/order RPCs are absent.
- Missing catalogue save/list RPCs and `fr-partner-catalogue` storage bucket.
- Missing `fr_partner_save_payment_details`, partner QR buckets `partner-qr` and `provider-payment-qr`, and main-ride QR details RPC.
- Missing registration/KYC buckets `driver-kyc-documents`, `driver-profile-photos`, `fr-service-provider-kyc`; only Road Ride driver-photo bucket exists in QA.
- RRS frontend is not integrated into the main app; backend privacy/confirmation tests are SQL-only.
- ERS/RRS combined station files are prototypes; the ERS channel-payment draft is not applied.
- Older and newer referral systems coexist; partner/driver one-month subscription reward backend was not verified.
- No Play Store build, real OTP/SMS, push, GPS/live tracking, SOS device test, or full browser/E2E regression was run in this audit.

## Regression evidence
- GitHub combined commit status returned no status entries.
- Connector returned no PR-triggered workflow runs for the audited commit; push workflow evidence was not available.
- `npm test`, `npm run test:unit`, `npm run test:core`, typechecks and Playwright were **not executed** in this run.

## Decision
**Release remains BLOCKED.** QA SQL transaction tests verified the targeted security/workflow behaviors above; they do not certify the full frontend, payment, storage, device, or Play Store release. Frozen progress values and graph remain unchanged.
