# Project Arjuna — QA Status (2026-11-22)

## Scope and safety
- QA branch only; no Dark+Gold UI rollout.
- Payment Provider/Cashfree integration explicitly deferred by user and excluded from release gate.
- Main branch and live deployment remain untouched; PR #37 is not merged.
- Latest QA branch head: `694d7a4229b5dbc8ca43aa586852c3b37dd72c5c`.

## CI evidence
- Latest CI is pending on runner-pinned commit `694d7a42`.
- Previous TASKO/Laundry run failed at Chromium system dependency installation (runner moved to Ubuntu 26.04; unavailable font packages), not at tests. Browser workflows are now pinned to Ubuntu 24.04 to restore stable dependency installation.
- Workflow/source regression on `6bde5edc`: PASS.
- TASKO/Laundry on `6bde5edc`: PASS.
- Quality/Regression runs on `6bde5edc`: still pending at time of this status refresh.
- Earlier browser Playwright evidence: 52/52 PASS; TASKO/Laundry 4/4 PASS; typecheck/core tests/build PASS. Earlier results are not latest-release certification.

## Implemented QA work
- Pickup/drop autocomplete, selected coordinate validation, GPS/map pin, ride payload and duplicate-submit regression guards.
- Food demo restaurants removed; honest empty-state.
- Removed stale Dark+Gold UI test scope; runtime diagnostics allow OSM map tile traffic.
- Registration privacy-policy link, privacy contact correction and manual account-deletion request page.
- QA-only migrations applied for schema parity: core profiles, driver GPS, ride live tracking, app notifications, SOS, push subscriptions, emergency contacts, driver KYC metadata, bank enquiries, service bookings, service-provider applications, support/feedback.
- QA profile guard blocks non-admin self-promotion of role/approval fields.
- Core ride lifecycle QA RPCs: get driver requests, accept ride, counter-offer, accept/decline counter-offer, nearby drivers, start/complete ride, secure customer/driver detail retrieval.
- Admin driver/partner review QA RPCs: driver application/document listing, driver approval/revocation, KYC document review, partner application listing/review.
- TASKO and Laundry provider transition RPCs (accept/start/complete) added.
- Static regression tests cover schema/RLS, admin authorization, role guards, ride and service transitions.

## QA database snapshot (read-only verification after QA-only migrations)
QA Supabase project `pqsangtvietawkfgpgfu`:
- Frontend direct table inventory: **15/15 present**.
- Public QA tables: **18 total; 18/18 RLS enabled**, policy metadata verified.
- Frontend RPC inventory: **57 names**; **18 frontend RPCs** implemented in QA so far (core ride 10, KYC/admin 6, TASKO/Laundry 2); approximately **39 frontend RPCs remain missing**.
- QA public function metadata includes 20 functions (18 frontend RPCs plus notification-preference trigger and profile-security guard).
- All QA SECURITY DEFINER functions checked: anon EXECUTE is false; intended authenticated RPCs have authenticated EXECUTE grants. Trigger/internal functions are not directly executable by anon or authenticated.
- QA migrations only; production schema/data/grants/functions/policies/settings were not changed.
- Authenticated real-user integration and role-boundary tests still need test accounts/device execution; static/mock tests do not prove live auth behavior.

## Production security audit (read-only findings)
- Previously found 23 RLS-enabled tables without policies, 6 SECURITY DEFINER functions executable by anon, 88 SECURITY DEFINER functions executable by authenticated, leaked-password protection disabled, plus performance advisor warnings.
- Several anon-executable SECURITY DEFINER RPCs appear intentionally public (approved-store listings, approved catalogue, published homepage feedback). `fr_get_platform_business_details()` exposes legal name, toll-free, GSTIN and timestamp; confirm intended public fields and least-privilege ACL.
- No production changes made.

## Remaining release gates (payment excluded)
1. Implement/review remaining 39 frontend RPCs and authenticated integration tests; classify payment-specific RPCs outside current gate.
2. Live SMS OTP send/verify on real phones.
3. Two-device ride lifecycle, GPS and background tracking.
4. Live/background push delivery.
5. Food trusted server order flow and approved partner/menu data (payment provider excluded).
6. Private KYC storage buckets/upload and admin/provider approval runtime tests.
7. CRM/user/referral/reward approval workflows.
8. Production SECURITY DEFINER/RLS review and leaked-password protection.
9. Account-deletion operational process and legal/privacy review.
10. Signed Android AAB, Play Console internal testing and store-policy checks.

## Progress
- Current engineering estimate: **86%** for defined scope (payment provider excluded); not release certification.
- Progress reflects 15/15 frontend tables present, all 18 QA public tables RLS-enabled, 18 frontend RPCs implemented, and KYC/TASKO/Laundry workflows added. CI and real-device gates remain.
- **NOT RELEASE READY.** Main untouched; no live deployment.
