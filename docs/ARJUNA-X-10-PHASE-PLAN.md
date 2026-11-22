# ARJUNA X — 10-Phase Clean Restart Plan

**Project codename:** ARJUNA X  
**Customer brand/app:** FRIEND RIDE  
**Website:** friendride.in  
**Branch:** `arjuna-x/phase-1-scope-lock`  
**Baseline branch:** `friendride-clean-restart/2026-11-22`  
**Baseline commit:** `e983cdcabe74daada7e46eba11be4a7c96698c8e`  
**Brand identity:** Original user-supplied FRIEND RIDE logo; Navy Blue + Orange + White  
**UI direction:** Native-app style screen-to-screen navigation, smooth transitions and animations; no Dark+Gold rollout.

## Locked Combined Scope
- Ride booking: Bike, Auto, Car; pickup/drop autocomplete, GPS, map pins, reverse geocoding, address-coordinate synchronization, route/ETA/fare, booking lifecycle, driver assignment, OTP/start, tracking, completion, QR/payment/receipt.
- Food delivery, grocery, local shops/catalogs/multi-shop checkout, parcel and goods delivery.
- Home services, TASKO/GIGGER, Laundry.
- VIDYA SETU education: teacher/student, classes, homework/assignments, notifications, and Zoom integration only where already supported/approved.
- Finance and digital services: banking/service dashboard, insurance, loans, tax/GST, PAN, accounts/bookkeeping/MIS, financial education, bill-pay/recharge, AEPS and travel/health redirects only where operational, authorized, and appropriately disclosed.
- Customer, Driver/Rider, Partner/Merchant, Service Provider/Gigger, Admin role-specific screens and permissions.
- Telugu-first notifications; English support; notification center/history, read/unread, categories, sound/vibration, voice announcements where supported, marketing opt-in/out, quiet hours, duplicate prevention, deep links, foreground/background/closed-app QA.
- **Notification sound/voice preference:** Telugu-first spoken notification tone is the preferred default where voice playback is supported; sound/voice can be switched off, important-only voice and quiet hours are supported, and notification preferences remain user-controlled. The exact named audio file/tone has not yet been verified in repository assets, so do not claim an existing tone asset is confirmed until inventory finds it.
- **Marketing/promotional suggestions:** user-requested cadence is at most one promotional/marketing notification per hour for users who explicitly opt in. Respect quiet hours, category opt-out, notification permissions, duplicate suppression, and campaign relevance; do not send hourly promotions to users who have not opted in. Keep operational/safety notifications separate from marketing.
- **Lock-screen notifications & persistent login:** After a user successfully logs in, FRIEND RIDE should deliver enabled notifications even when the phone screen is locked, subject to OS/browser permissions and push configuration. Notification previews must protect sensitive personal, ride, payment and account information (user-configurable preview visibility where supported). Keep the login session persistent across app restarts/locking; do not sign the user out automatically because the screen locks, the app is backgrounded, or the user closes/reopens it. Logout occurs only when the user explicitly chooses Logout, or when security/session expiry/revocation requires it. Preserve existing authentication and session backend contracts; verify session refresh, expiry, revoked sessions, and explicit logout in QA.
- Offers/referrals (₹50 offer subject to configured campaign), support, complaints, feedback, ratings, SOS/safety, saved addresses/favorites, order/ride history.
- **Profile identity & registration UX:** On the customer homepage, show the user's uploaded profile photo in the top-corner profile control; if no photo exists, show a friendly selectable/default 3D avatar (never an empty/broken image). Keep photo/avatar selection and display consistent with the existing account/profile data and existing upload behavior. Preserve the current Customer, Driver, and Partner registration forms and their fields, validation, KYC/document uploads, approval states, and role-based access; improve layout/readability only after inspecting the actual current forms. Do not invent or remove registration fields, or change backend/auth/storage contracts. Include photo upload/update/remove and avatar fallback QA.
- Native-app experience: screen transitions, slide/fade, bottom sheets, loading skeletons, touch feedback, success animations, smooth back/navigation, reduced-motion support.
- **Adaptive light/dark theme:** user-requested ambient-light auto mode for FRIEND RIDE. In a dim room, switch to dark UI; in bright outdoor light, switch to light UI. Prefer ambient-light sensing (Ambient Light Sensor API only when browser/device supports it and permission is granted), with configurable lux thresholds, hysteresis and a debounce/stability window to avoid flicker. If unavailable/denied, fall back to device system theme (prefers-color-scheme) and retain a manual Light/Dark/Auto override. Do not request sensor permission unexpectedly; offer it from theme settings, explain its purpose, and keep the app usable without sensor access. Respect reduced motion and persist user preference.

- Business rules to preserve/verify: platform charge 2.5% single source of truth; TASKO minimum ₹150/day, up to 6 hours, base cap ₹400, extension ₹50/hour, water-assistance reminder after 4 hours; Laundry per KG/per piece; grocery EMI example ₹5,000 limit only as eligibility/configuration example; QR validity 5 minutes; 24-hour order auto-delete requirement subject to safe implementation/data-retention review.

## Non-Negotiable Safety Rules
- Preserve existing Supabase schema, RLS, auth/OTP, payment flow, API contracts, integrations, business logic, routes and feature behavior unless an explicitly approved separate change is required.
- No secrets or unrestricted API keys committed.
- No destructive database migrations or production data changes.
- No merge to `main` and no live deployment without explicit user approval.
- Do not mark QA pass without test evidence. Actual-device notification/background/voice behavior must be tested on device.
- Keep old Arjuna/QA branches; do not delete or merge them automatically.

## 10 Phases
1. **Scope & Identity Lock (current):** lock project naming, logo/brand reference, combined service inventory, safety constraints, 10-phase roadmap; record branch/baseline and Phase 1 acceptance.
2. **Repository & Asset Inventory:** map routes/screens, module ownership, assets/logo, APIs/contracts, integrations, tests, deployment, and duplicate/legacy artifacts; produce verified inventory.
3. **App Shell & Design System:** Navy/Orange/White tokens, logo placement, typography, icon system, responsive/safe-area layout, role navigation, native-style transitions and reduced motion.
4. **Location & Ride Booking Foundation:** secure Google Places configuration, pickup/drop selection, GPS, map pins, reverse geocoding, coordinate consistency, service-area validation, outage/manual recovery.
5. **Ride Lifecycle & Safety:** booking/quote/matching/driver states, authorized customer-driver details, OTP start, tracking, completion, cancellation/retry/duplicate protection, QR/payment regression.
6. **Customer Service Modules:** food, shops/grocery, catalogs/multi-shop, parcel/goods, home services; regression and module-by-module UI completion.
7. **TASKO, Laundry & VIDYA SETU:** service pricing/workflows, partner/provider controls, education role isolation, homework/assignment and supported Zoom integration; regression.
8. **Roles, Admin & Finance/Integrations:** customer/driver/partner/provider/admin permissions, Admin-configurable subscription gateway, GST configuration/invoice tax behavior (disabled until registration), Admin toll-free number shown on homepage, future toll-free provider integration, CRM/operations, finance/digital-service integrations and eligibility/redirect disclosures.
9. **Notification System:** audit and reconcile push providers/workers, foreground/background/closed-app behavior, Telugu text/voice, settings, categories, deep links, marketing consent/frequency, dedupe, actual-device QA.
10. **Full Regression & Release Gate:** Playwright, CI, route/role/service regression, accessibility, mobile responsiveness/performance, security checks, release report; only after evidence and user approval consider merge/deployment.

## Phase 1 Acceptance Criteria
- [x] Project codename and customer-facing brand separated.
- [x] User-supplied logo established as the official reference (asset file itself still needs to be added/verified in repo).
- [x] Navy Blue + Orange + White and native-app transition direction locked.
- [x] Combined scope captured in this document.
- [x] Backend/auth/payment/schema preservation rules captured.
- [x] 10-phase sequence and Phase 1 branch recorded.
- [ ] Logo binary asset copied into repository and verified — deferred to Phase 2 asset inventory.
- [x] Phase 1 documentation committed and branch content verified.

## Current Phase Status
**Phase 1 — IN PROGRESS.** This branch was created from the clean-restart baseline. The scope/roadmap document is being committed as the first project artifact. No app code, backend, schema, authentication, payments, main branch, or live deployment has been changed.
