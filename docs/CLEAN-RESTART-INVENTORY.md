# ARJUNA Clean Restart — Existing App Inventory & Workflow Source

Project codename: **ARJUNA** (customer product branding remains FRIEND RIDE).
Repository baseline: main `f1ddca35a576b7ecb34d5130e0cc990709ec4b02`
Branch: `friendride-clean-restart/2026-11-22`
This inventory is based on the tracked repository file tree and `BLUEPRINT.md`. It is a scope map, not a claim that every module currently works.

## Existing technical footprint
- Single-page root frontend: `index.html` (large, ~993 KB; preserve as baseline).
- Service worker/PWA: `service-worker.js`, `sw.js`, `manifest.json`, `manifest.webmanifest`.
- Supabase/notifications: `fcm-web-push.js`, `firebase-messaging-sw.js`, `fr-notification-fallback.js`, `FCM-WEB-PUSH-SETUP.md`.
- TypeScript foundation: `src/core/result.ts`, `src/core/validation.ts`, `src/ride-contact.ts`; tests include Node, Vitest, and Playwright.
- Education separate assets: `learn-teach.js`, `learn-teach.css`.
- Existing SQL migrations are present for TASKO/GIGGER, Laundry, cycle-delivery pricing and Learn/Teach. Do not apply migrations during frontend restart without explicit review.
- GitHub Actions workflows: quality gate, FRIEND RIDE regression, workflow regression, TASKO/Laundry integration regression.
- Existing QA and release-gate docs/specs should be reviewed and updated; do not assume old theme-specific tests remain relevant.

## Product roles
- Customer
- Driver/Rider
- Partner/Merchant/Shop Owner
- Service Provider/Gigger
- Admin

Each role must have role-correct navigation, screens, data access and action authorization; common account/auth/profile elements can be shared.

## Customer journey
Registration/OTP → profile → location → home/service discovery → service selection → booking/order → assignment/acceptance → tracking/status → completion → payment/receipt → rating/review → history/support.

Customer service areas:
- Bike, Auto, Car rides
- Cycle delivery
- Parcel and goods transport
- Food delivery
- Grocery/local marketplace, multi-shop catalog
- Medical/pharmacy marketplace (only within applicable partner/legal controls)
- Shopping/catalogue
- Home services
- TASKO/GIGGER
- Laundry
- Education/Vidya Setu
- Financial/recharge/bill-pay and travel integrations only when operational and authorized
- Wallet/offers/referrals/notifications/profile
- Complaints, support, feedback, ratings

## Ride workflow — top priority, no compromise
1. Select Bike/Auto/Car.
2. Pickup search: Google Places autocomplete (required), GPS current location, map pin, reverse geocode and manual fallback.
3. Drop search: Google Places autocomplete, map pin, reverse geocode and manual fallback.
4. Suggestion selection must bind visible address + place identity + latitude/longitude. Text edits invalidate previously selected coordinates.
5. Validate service area and route/availability where supported.
6. Fare offer/quote and transparent charges.
7. Submit only when pickup/drop are valid selected locations and coordinates are present.
8. Searching/matching → driver assigned/accepted.
9. Driver navigation/arrival → OTP/start → in-progress/live tracking.
10. Complete → payment/QR/receipt/history → rating/support.
11. Cancellation, retries, provider outages and GPS denial must have safe recovery paths.
12. Avoid duplicate ride requests, status transitions, completion, payment and reward side effects.

## Driver workflow
OTP → profile/photo → vehicle details → documents/KYC → admin review/approval → online/offline → request accept/reject → pickup navigation → arrived → start (authorized OTP/state) → live location → complete → payment/earnings/history/settlement → SOS, support, complaints, ratings and notifications.

Only approved/eligible drivers should receive or accept rides. Driver status/actions must be server-authorized.

## Partner/merchant workflow
OTP/profile/photo → shop/business details/address/category → KYC/admin approval/subscription if applicable → dashboard → catalog/category/product images, prices, offers, stock → incoming orders → accept/reject → preparation/ready → pickup/delivery → completion → earnings/settlement, ratings, support. Catalog/order ownership and multi-shop mapping must remain correct and persistent.

## Food
Browse/menu → cart → checkout → shop acceptance → preparation → ready → delivery/pickup assignment → tracking → completion/payment/receipt → rating.

## Local stores / grocery / multi-shop
Browse categories and partner stores → item availability and partner price → cart/checkout → shop-wise order linkage → partner acceptance → delivery assignment/status → receipt/history. Categories from blueprint: grocery, medical/pharmacy, meat/chicken, electrical, hardware, appliances and general stores. Multi-shop checkout must correctly link each shop's order to customer/shop/delivery.

## Home services
Select service/category → describe issue → transparent quote/pricing → date/time → provider matching → assignment → visit/work status → payment → rating. Provider onboarding includes skills, docs/KYC, admin approval, availability and earnings.

## TASKO/GIGGER
Categories: office work, government office assistance, personal assistance, errands, document work, field work, daily assistance, other. Configurable price disclosures and service limits must be shown before confirmation. Flow: request → approved provider assignment/acceptance → work start → completion → payment → rating.

## Laundry
Service selection (wash, ironing, steam ironing, dry-cleaning; per kg/per piece) → pickup → partner processing/status → ready → delivery → payment → rating. Partner service prices/orders/earnings.

## Education / Vidya Setu
Student and teacher registration/profile → teacher/learning content → tasks/assignments → submissions/progress → notifications and admin controls. Education permissions and role isolation must be independent of ride roles.

## Finance, EMI, bill pay and travel
Only expose operational, authorized integrations. Financial/EMI flow may include provider eligibility/KYC, admin approval, order, mandate/installment schedule and disclosures; no invented approvals. Recharge/bill pay: validation → confirmation → provider transaction → result/receipt/history. Travel/train booking only via active provider integration or clearly identified redirect.

## Admin/operations
Admin dashboard; users/customers; driver and provider KYC/approval; partners/shops; rides; orders; catalog and delivery; home services; TASKO; Laundry; Education; complaints/feedback/ratings; offers/referrals/subscriptions; payment/refund/settlement; service/configuration/operational monitoring. Role gating and auditability required.

## Shared capabilities
OTP/auth/session, profiles, role launcher/navigation, GPS/location, maps, service-area checks, pricing/charges source of truth, payments/QR/receipts, notifications, help/SOS, support/complaints, ratings, order/ride history, PWA/install/offline/error recovery, Telugu-first notifications with English support, accessibility and responsive/mobile-native-feeling interaction.

## Acceptance/QA rules
- Never delete current app or backup.
- Preserve Supabase schema/auth/payment flow and existing APIs while replacing/refactoring UI incrementally.
- No Dark+Gold theme rollout.
- Google Places autocomplete is a required ride milestone; API key is external configuration and must not be committed.
- Every feature migrated has behavior tests before moving to a new implementation.
- CI release gate: JS syntax, typecheck, unit/core, Playwright/browser E2E, focused module regressions, mobile viewport checks, no console/runtime errors.
- Full ride workflow must be tested with controlled fixtures and, separately, authorized real integration checks. Do not treat mock tests as live-system proof.
- Release remains blocked until high-priority acceptance checks are green and user explicitly approves release.
