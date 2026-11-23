# ARJUNA X — Phase 3 Route Coverage Inventory

Date: 2026-11-23
Branch: `arjuna-x/phase-2-repository-assets-inventory`

## Scope and verification

- Current SPA page-section baseline: **58**.
- Phase 3 design-system stylesheet is integrated at the shell level and the body carries `fr-phase3-shell`.
- Automated static baseline guard: `tests/phase3-design-system.test.cjs`.
- Runtime smoke: `qa/phase3-shell-visual-smoke.spec.js` (stylesheet load, shell class, inherited palette tokens on all 58 pages, body background, orange CTA contrast and keyboard focus indicator).
- CI #780 was previously reported SUCCESS for the 58-page baseline guard. Runtime smoke status was not re-verified at this inventory update; check the current branch commit before acceptance.
- This proves CSS shell integration/inheritance only. It does **not** constitute screenshot-based, route-by-route visual acceptance or physical-device QA.

- Read-only source reconciliation on QA workflow commit `16ec7beef4b89bf50e201e10339f04c68be384b2`: 58 page sections and 58 checklist entries matched exactly, with no duplicate route IDs. This is static source evidence only; runtime/screenshot/device acceptance remains pending.
- Latest commit status and workflow-run lookup returned no entries; the available workflow-run connector is PR-only. CI for current code HEAD is therefore unverified, not green.

## Route checklist

### Public/customer entry and discovery
- [ ] `home`
- [ ] `cycleDelivery`
- [ ] `explore`
- [ ] `eventServices`
- [ ] `serviceProviderRegister`
- [ ] `bankingServices`
- [ ] `frSuperHub`
- [ ] `learnTeach`

### Ride, delivery, food and booking
- [ ] `ride`
- [ ] `scheduled`
- [ ] `goods`
- [ ] `parcel`
- [ ] `parcelRelease`
- [ ] `food`
- [ ] `restaurantCatalogue`
- [ ] `orders`
- [ ] `tracking`

### Stores, marketplace and catalogue
- [ ] `shops`
- [ ] `shopping`
- [ ] `storeBrowse`
- [ ] `customerCatalogue`
- [ ] `marketCart`
- [ ] `cart`
- [ ] `products`
- [ ] `inventory`
- [ ] `catalogue`

### Home services, TASKO/GIGGER and laundry
- [ ] `homeServices`
- [ ] `laundryServices`
- [ ] `technicianRegister`

### Customer and driver/partner dashboards
- [ ] `customerDashboard`
- [ ] `driverDashboard`
- [ ] `partnerDashboard`
- [ ] `partnerOrders`
- [ ] `partnerReports`
- [ ] `subscription`
- [ ] `referrals`
- [ ] `wallet`
- [ ] `offers`
- [ ] `profile`
- [ ] `notifications`
- [ ] `support`
- [ ] `frSupportFeedback`
- [ ] `about`

### Admin, CRM and controls
- [ ] `adminDashboard`
- [ ] `crmDashboard`
- [ ] `users`
- [ ] `referralApprovals`
- [ ] `cashRewardApprovals`
- [ ] `paymentApprovals`
- [ ] `partnerPaymentSettings`
- [ ] `platformBusinessSettings`
- [ ] `driverApprovals`
- [ ] `driverDocumentReviews`
- [ ] `partnerApprovals`
- [ ] `adminOrders`
- [ ] `reports`
- [ ] `settings`
- [ ] `gst`

## Acceptance still required

- [ ] Visual review/screenshot comparison for each route on mobile and desktop breakpoints.
- [ ] Verify role-based access and visibility remain unchanged.
- [ ] Verify ride booking, pickup/drop, map/GPS, order/catalogue, TASKO, Laundry and admin workflows remain behaviorally unchanged.
- [ ] Physical Android/PWA install, safe-area, keyboard, touch targets and offline/update acceptance.
- [ ] Confirm latest Phase 3 CI for current code HEAD.

No main merge or production deployment is authorized by this inventory.
