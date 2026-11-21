# FRIEND RIDE — Dark + Gold in-place UI migration inventory

**Branch:** `ui/full-native-dark-gold-2026-11-21`  
**Baseline:** `main` remains unchanged.  
**Scope:** 58 existing first-party page routes found in the current `index.html`.

## Migration checklist
- [x] Inspect single-file hybrid app entry point, page IDs, role dashboards, shared navigation, theme/style blocks, auth modal, and current Playwright configuration.
- [x] Replace the old 7-tab bottom navigation in place with Home / Services / Cart / Orders / Profile.
- [x] Keep existing service routes and bottom-cart count element.
- [x] Replace hard-coded native-home location with a mirror of the existing live location field; tapping the location row calls the existing location action.
- [x] Remove the two stacked Dark + Gold patch styles and consolidate the shared system into one final design-system style block.
- [x] Convert the learning-role style from the old purple/light presentation to Dark + Gold.
- [x] Add Playwright route/theme/nav/login coverage.
- [ ] Run all route-level visual and interaction checks.
- [ ] Verify each role with real auth/session and permissions.
- [ ] Verify Admin login -> Admin dashboard on device.
- [ ] Verify payment, maps, upload, notification, KYC, and live GPS integrations.
- [ ] Remove obsolete legacy presentation markup/components after each screen has been verified. **Not yet completed.**
- [ ] Review CSS conflict sources and remove obsolete/conflicting theme rules beyond the consolidated system. **Not yet completed.**
- [ ] Production build/quality gates and full regression pass.
- [ ] Merge and deployment only after all required checks pass.

## Existing routes

### Customer/shared routes
- [ ] `home` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `cycleDelivery` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `explore` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `eventServices` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `serviceProviderRegister` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `bankingServices` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `ride` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `scheduled` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `goods` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `parcel` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `food` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `restaurantCatalogue` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `shops` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `shopping` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `homeServices` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `laundryServices` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `storeBrowse` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `customerCatalogue` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `marketCart` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `technicianRegister` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `parcelRelease` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `orders` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `tracking` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `wallet` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `offers` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `customerDashboard` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `profile` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `notifications` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `support` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `about` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `cart` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `frSupportFeedback` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `learnTeach` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `frSuperHub` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending

### Driver
- [ ] `driverDashboard` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending

### Partner/vendor
- [ ] `partnerDashboard` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `partnerOrders` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `products` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `inventory` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `gst` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `catalogue` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `subscription` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `referrals` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `partnerReports` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending

### Admin/CRM
- [ ] `adminDashboard` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `crmDashboard` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `users` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `referralApprovals` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `cashRewardApprovals` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `paymentApprovals` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `partnerPaymentSettings` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `platformBusinessSettings` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `driverApprovals` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `driverDocumentReviews` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `partnerApprovals` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `adminOrders` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `reports` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `settings` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending



## Status semantics
The checked items above are changes actually committed to the QA branch. All 58 route IDs still exist and preserve their existing destination screens. **The full structural screen-by-screen legacy markup removal is not complete**, and the route verification checkboxes remain unchecked until the tests/device checks confirm them.
