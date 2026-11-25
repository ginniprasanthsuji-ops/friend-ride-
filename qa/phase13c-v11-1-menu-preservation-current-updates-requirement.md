# Phase 13C — FRIEND RIDE Menu Baseline (Screenshots) + Current/Future Updates

Status: Screenshot-derived menu baseline recorded. Documentation only; no app code changes, runtime validation, or deployment.

## User clarification (supersedes earlier mistaken “exactly 8 options” interpretation)
The supplied screenshots show a long multi-section menu, not an eight-option menu. **Every menu option visible in the user's screenshots is mandatory and must remain in the FRIEND RIDE app's own menu/drawer.** The screenshots are the baseline. Do not reduce it to 8 items.

If current updates or future requested features need menu options, add them **inside this same FRIEND RIDE app menu** in suitable sections. Do not create a separate app, external menu, separate launcher, or external navigation surface. Keep existing baseline options and add new ones without removing baseline items unless the user explicitly requests removal.

## Screenshot-derived baseline options (preserve all)

### Main / Dashboards
- Home
- Customer Dashboard
- Driver Dashboard
- Partner Dashboard

### Services
- Ride Booking
- Goods Delivery
- Parcel Delivery
- Food Delivery
- Home Services
- Local Stores
- Shopping
- Scheduled Booking

### My Account
- My Orders & Bookings
- Live Tracking
- Wallet & Payments
- Offers & Rewards
- Notifications

### Business & Admin
- Partner Orders
- Restaurant Menu / Catalogue
- Partner Subscription
- Partner Referrals
- Partner Reports
- Products & Stock
- Inventory / Low Stock

### Admin menu entries visible in supplied screenshots
- GST Bills & Invoices
- User Management
- Driver Approvals
- Partner Management
- Referral Approvals
- Customer Cash Reward Approvals
- All Orders
- Complaints Admin
- Reports & Analytics
- Payment & Approval Queue
- Toll-Free / GST Details
- System Settings

### More
- Complaints & Feedback
- Admin Dashboard
- About Us
- Logout

## Updated features and future menu additions
- Keep all currently updated features accessible in this same app menu.
- Add any new options requested later to the same drawer/menu, grouped appropriately.
- Preserve role-appropriate visibility and navigation for Customer, Driver, Partner, Admin, TASKO, and Home Services/Technician roles.
- Role-specific subscription badges and subscription pages must remain reachable in their relevant dashboards/menu sections.
- No dashboard cross-routing: each menu entry must open its correct destination.
- Do not hide, rename, remove, or replace screenshot-baseline options without explicit user approval.
- Avoid duplicate entries; if a feature seems duplicate, flag it for review instead of silently deleting/consolidating.

## Acceptance checklist (not yet tested)
- [ ] Compare implementation menu against all supplied screenshots.
- [ ] Confirm every baseline option above is preserved.
- [ ] Confirm current updated options are present in the same FRIEND RIDE menu.
- [ ] Confirm newly requested future options are added in the same menu, not a separate app/menu.
- [ ] Verify correct role-based visibility and destination routing.
- [ ] Verify all dashboards (Customer, Driver, Partner, Admin, TASKO, Home Services) route correctly.
- [ ] Test menu navigation in QA only after explicit authorization.

## Audit boundaries
Documentation only. No app code, SQL, migrations, deployment, runtime tests, or production/Main access. Frozen Phase 13 tracking remains unchanged: Planning/Checklist 88%, Overall Audit estimate 12%, progress graph frozen, Phase 13B Shared Ride Hardening 70% frozen.
