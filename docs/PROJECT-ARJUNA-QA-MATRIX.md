# FRIEND RIDE Hybrid App QA Matrix (Project Arjuna)

## Release standard
- QA branch only; never merge or deploy from this suite.
- Critical (P0/P1) defects block release.
- Preserve existing backend, auth, payment, roles, routes, and features.
- Automated CI is a required gate; live-provider/device scenarios remain explicit manual evidence items until safely testable.

## Automated coverage currently in Playwright
| Area | Automated checks | Coverage note |
|---|---|---|
| App boot / runtime | SPA loads; uncaught JS exception capture | Smoke only |
| PWA basics | viewport metadata, manifest reachable, service-worker asset reachable | Does not prove installed/offline push behavior |
| Responsive layout | horizontal overflow guard | Desktop Chromium + Pixel 7 emulation |
| Ride pickup/drop | autocomplete selection, coordinate state, stale-state clearing, manual coordinate fallback, invalid coordinate rejection, GPS geolocation, map-pin reverse geocoding, handlers/map availability | Provider requests mocked; real Google Maps/Photon network not proven |
| Education / Vidya Setu | marketplace landing and categories | UI smoke; auth/Zoom/subscription workflows not end-to-end |
| TASKO / Laundry | category launch, admin control-centre presence/handlers | UI smoke; booking, provider, pricing, fulfillment, admin review incomplete |
| Core/unit | Node test suite and Vitest suite | CI runs separately |

## Required expansion / release evidence
### P0/P1 end-to-end
- Customer/Driver/Partner/Admin login, OTP success/failure/expiry/rate-limit, logout, session expiry and role isolation.
- Ride: Bike/Auto/Car selection; pickup/drop autocomplete; GPS permission granted/denied/unavailable; map pin; service area; fare and duplicate submit; driver discovery; accept/reject; counter-offer/accept/decline; OTP start; live tracking; complete/cancel; QR/payment state and receipt.
- Push: opt-in/out; token/subscription registration; foreground/background delivery; click routing; permission denial; stale-token cleanup.
- Food/local store: categories/catalog/search/cart, multi-shop behavior, checkout, order status, cancellation, partner workflow.
- Parcel/goods: sender/receiver validation, quote, partner accept, status and proof of completion.
- Home services: provider/technician registration, customer booking, quote/accept, schedule, completion, feedback, admin review.
- TASKO/GIGGER: pricing minimum/cap, hour add-ons, provider acceptance, completion and complaint.
- Laundry: service options, per-kg/per-piece pricing, pickup/delivery status, order completion.
- Education/Vidya Setu: teacher/student/coaching registration, listing, booking/subscription, Zoom link flow, cancellation.
- Financial services: service entry points, consent, redirects, forms, error/timeout and data privacy (no real financial transaction in CI).
- Admin/Partner/Driver: KYC submit/review/reject, permissions, profile, CRM, support, referrals, rewards, dashboard data and audit.
- SOS/emergency contacts; accessibility and privacy/account deletion paths.

### International-standard quality dimensions
- Desktop + Android mobile emulation; add real Android device/browser testing before release.
- WCAG 2.2 AA audit: keyboard/focus, semantics, contrast, labels, error announcements, touch targets.
- Telugu + English localization: truncation, mixed scripts, date/time/currency, notifications.
- Security: authorization boundaries, RLS, no secrets in browser, unsafe input, rate-limit abuse, CSRF/XSS and dependency audit.
- Reliability: slow/offline/timeout/5xx, retries, duplicate submissions, stale state, network recovery.
- Performance: startup, navigation, large catalog, maps and interaction latency; establish measured budgets.
- Evidence: Playwright HTML/JSON, trace, screenshots, video on failure, CI logs, defect IDs and release sign-off.

## Current status (do not misrepresent)
- This is a coverage matrix, not a PASS report.
- Current Playwright suite is a starter/smoke set and must be expanded to cover every workflow above.
- Real SMS, GPS, background push, two-device ride lifecycle, payment settlement, provider onboarding, and Play Store packaging need controlled live/device validation.
