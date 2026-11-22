# FRIEND RIDE Clean Restart — Baseline

Date: 2026-11-22

## Safety / source baseline
- Production/main is preserved; this work is isolated to `friendride-clean-restart/2026-11-22`.
- Baseline main commit: `f1ddca35a576b7ecb34d5130e0cc990709ec4b02`.
- Existing root `index.html` backup/baseline tracked in main: blob SHA `6b18c4ae088c733c6d9b64139ad688573e3875e6` (large single-page frontend; fetched and verified).
- Project Arjuna QA branch preserved: `project-arjuna/dark-gold-ui-rollout`, commit `6e6f1a65d3111f9ea6d66cfadce6428b21b1dba0`. Do not delete or merge automatically.
- No production deployment, main merge, database/schema mutation, or destructive deletion performed.

## Restart direction
Rebuild/clean up the frontend experience in controlled milestones while preserving backend contracts, Supabase schema/auth, payments, and working business logic unless a separately approved change requires otherwise. The Dark+Gold rollout is cancelled and is not part of this restart.

## Known findings carried forward
- Ride pickup/drop autocomplete currently uses Photon/OpenStreetMap, not Google Places. Google Maps/Places integration is a required milestone and must be configured securely (restricted browser key; no secrets committed).
- Location workflow must preserve selected suggestion address and coordinates together; editing text must clear stale coordinates; GPS and map-pin selection/reverse-geocoding and manual recovery must be supported; no booking from unselected free-text locations.
- Existing Project Arjuna starter tests cover several location edge cases but are not proof of full ride lifecycle E2E.
- Notification pipeline has a previously observed mismatch between app Web Push subscriptions and FCM dispatch/token path; needs dedicated audit, not assumptions.
- Current single-page frontend is nearly 1 MB; use staged modularization rather than replacing backend behavior blindly.

## Required workflow acceptance
1. Customer chooses Bike/Auto/Car.
2. Pickup and drop: Google Places autocomplete, clear suggestion selection, persisted lat/lng, GPS pickup, map-pin selection, reverse geocoding, service-area checks, and manual fallback when providers fail.
3. Booking submit blocked unless both locations are valid selected locations with coordinates.
4. Fare offer/quote, driver matching, driver accept, customer/driver details subject to authorization, ride status lifecycle, OTP/start, live tracking, completion, QR/payment flow—all preserved and tested.
5. Role isolation: Customer, Driver, Partner, Admin screens and permissions.
6. Regression coverage: ride lifecycle and location, authentication/OTP, roles/KYC, stores/food, parcel/goods, home services, TASKO/GIGGER, Laundry, Education/Vidya Setu, financial services, admin, PWA, notifications.
7. CI must gate release on type/unit/core/browser E2E and targeted module regressions.
8. No main merge or deployment until QA evidence is green and explicit release approval is obtained.

## Milestone order
- M0: Preserve baseline and inventory routes, modules, APIs, data contracts, assets, tests, and deployment.
- M1: Ride booking + location foundation (Google Places autocomplete, GPS, map pins, coordinate state, service-area validation).
- M2: Full ride lifecycle end-to-end and regression suite.
- M3: Role/auth/KYC and admin/driver workflows.
- M4: Catalog/store/food/parcel/local services.
- M5: TASKO/GIGGER, Laundry, Education, Finance modules.
- M6: Notification audit and repair with test evidence.
- M7: PWA/accessibility/mobile responsiveness/performance.
- M8: Release readiness audit; only then consider merge/deployment.

## Working rules
- Small, reviewable commits on this restart branch only.
- Preserve the current live site and all existing branches.
- No UI theme migration; no Dark+Gold rollout.
- Never claim a test passed unless its run result is available.
