# Project Arjuna — QA Status (2026-11-22)

## Scope and safety
- QA branch only; no Dark+Gold UI rollout.
- Payment Provider/Cashfree integration explicitly deferred by user and excluded from the release gate.
- Main branch and live deployment remain untouched; PR #37 is not merged.
- Latest QA branch head: `8a45b371f3c52c2ca690965e0d4fc0f2fa6fc506`.

## Latest CI
- Previous commit `59a2c7e7` had Quality Gate, Regression, Workflow Regression, and TASKO/Laundry Integration PASS.
- Latest commit `8a45b371` CI is pending at the time of this update:
  - Regression: https://github.com/ginniprasanthsuji-ops/friend-ride-/actions/runs/45014608810
  - Quality Gate: https://github.com/ginniprasanthsuji-ops/friend-ride-/actions/runs/45014608802
- Earlier evidenced browser Playwright: 52/52 PASS; TASKO/Laundry 4/4 PASS; typecheck/core tests/build PASS. These are earlier evidence, not a substitute for latest CI.

## QA implementation completed
- Pickup/drop autocomplete selection, coordinate validation, GPS/map pin persistence and ride submit payload regression.
- Duplicate ride-submit guard and success/error state.
- Food page demo listings removed; honest empty-state.
- Removed stale Dark+Gold UI test scope; OSM map tile requests allowed in runtime diagnostics.
- Privacy-policy link, corrected privacy contact and account-deletion request page (manual operational process).
- QA-only schema migrations created/applied for core profiles, driver GPS, ride live tracking, notifications, SOS, push subscriptions, emergency contacts, driver KYC metadata, bank enquiries, service bookings, service-provider applications and feedback.
- QA profile trigger blocks non-admin self-promotion of role/driver/partner approval fields.
- Core ride lifecycle QA RPCs added: get_driver_requests, accept_ride, counter_offer_ride, accept_counter_offer, decline_counter_offer, nearby drivers, start ride, complete ride, and secure customer/driver detail RPCs. Payment provider behavior excluded.
- Static regression tests added for schema RLS and workflow security conditions.

## QA backend parity — current verified snapshot
QA Supabase project `pqsangtvietawkfgpgfu`:
- Frontend direct table inventory: **15/15 present** (includes `admin_users` and `rides`).
- Public QA tables: **18 total; 18/18 have RLS enabled**. Policy metadata verified for all.
- Frontend RPC inventory: **57 names**; 10 core ride RPCs implemented in QA, plus notification preference and profile guard functions. Approx. **47 frontend RPCs remain unimplemented/missing** in QA.
- Core schema and RLS migrations are QA-only. Production schema, data, grants and policies were not changed.
- Authenticated runtime integration tests still need test accounts and role-boundary execution; static checks/mock browser tests do not prove runtime authorization.

## Production security audit — read-only findings
- Previously found 23 RLS-enabled tables without policies, 6 SECURITY DEFINER functions executable by anon, 88 SECURITY DEFINER functions executable by authenticated, leaked-password protection disabled, and performance advisor warnings.
- Several anon-executable SECURITY DEFINER RPCs appear intentionally public (approved-store listings, approved catalogue, published homepage feedback). `fr_get_platform_business_details()` also exposes legal name, toll-free, GSTIN and timestamp; confirm intended public fields and least-privilege ACL before release.
- No production grants, functions, policies, indexes or settings changed.

## Remaining gates (payment excluded)
1. Implement/review remaining frontend RPCs and authenticated DB tests.
2. Live SMS OTP send/verify on real phones.
3. Two-device ride lifecycle, GPS and background tracking.
4. Live/background push delivery.
5. Food trusted server order flow and approved partner/menu data (payment provider excluded).
6. KYC storage buckets/private upload, document review, provider/driver approval workflows.
7. CRM/user/referral/reward approval workflows.
8. Production SECURITY DEFINER/RLS review and leaked-password protection.
9. Account-deletion process and legal/privacy review.
10. Signed Android AAB, Play Console internal testing and policy checks.

## Progress estimate
- Current engineering estimate: **84%** for the defined scope (payment provider excluded). Estimate only; not release certification.
- Progress increased after QA table parity reached 15/15, all 18 QA public tables had RLS, and 10 core ride lifecycle RPCs were added.
- Main/live untouched. **NOT RELEASE READY** until remaining gates and latest CI are verified.
