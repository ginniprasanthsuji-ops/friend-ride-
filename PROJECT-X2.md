# FRIEND RIDE Project X2 — YT Test 1–15

## Scope / Branch Guard
- Work only on `yt-test-1-to-15`.
- Do not edit, merge into, or deploy `main` / production.
- Project X2 starts with a fresh audit of this branch; existing partial work is not assumed complete.
- No extra paid services or Python. Keep implementation in the existing HTML/JS + Supabase/SQL + GitHub workflows.

## X2 Requirements
1. ERS/RRS: posting, LIVE listings, bookings, timestamps, tracking and regressions.
2. RRS guest-driver profile photo: camera/gallery; compress automatically to max 1 MB; preview/replace; persist safely; show in ride/profile where applicable.
3. RRS/ERS safety: bold/highlight Telugu safety wording; original FRIEND RIDE branding/logo and QR visibility checks.
4. Food & Shop: complete catalogue → cart → checkout/order workflow; prices/stock from backend, not client-only fabricated data.
5. Parcel: create/save/refresh/reopen/cancel persistence; tracking/status updates and working Parcel/Food/Shop entry buttons.
6. Payments: 2.5% platform charge on eligible value, capped at ₹25; show fee and final amount before checkout; payment verification must gate order progression; partner QR/direct-payment handoff after verified payment. Never mark unverified payment as successful.
7. Subscription: payment reference capture, admin verification/approval, activation only after confirmed payment and approval.
8. OTP/Auth: APITXT send + verify, Supabase session creation and role-specific dashboard routing. Live phone/device evidence required for real SMS claims.
9. Regression: all 15 YT Test workflows, browser tests/Playwright, CI checks and staging/QA deployment checks. Separate real-device checks (SMS, push, live location) and report them honestly.

## Start-from-zero Audit
- [x] Confirm branch and current commit before work.
- [x] Audit current code for each requirement and identify incomplete/buggy pieces (RRS photo flow missing; guest RPC passenger-capacity contract mismatch found).
- [x] Fix critical blockers first (async RRS handler; passenger-capacity RPC migration).
- [x] Add focused static regression checks for RRS async handler and passenger-capacity RPC.
- [x] Commit only to this branch.
- [ ] Report commit, tests/checks, outstanding live-device verification.

## Current baseline
- Branch head at project start: `1dc760a5ef1cdd6c9cc1ebfe6bf86a7a8b1689c7`.
- Audit has already found a critical syntax issue candidate: `frStationPostRRS` contains `await` but is declared without `async`; verify/fix immediately.
- RRS photo compression/upload code was not found by current audit search and must be implemented/verified.

## X2 progress update (2026-11-27)
- Fixed `frStationPostRRS` declaration to async (commit `f19b98c830d1594bbc7d4e8587ae027c851a2ad7`).
- Added migration `202611270001_fr_x2_rrs_passenger_capacity_rpc_fix.sql`: adds passenger capacity column and aligns guest-post RPC with UI's `p_passengers` parameter (commit `0a3efc2b37c2b250df887137534b890a0048ae36`).
- Added X2 regression assertions to `tests/ers-rrs-station-ui.test.cjs` (commit `62c1c49f66c28f285810fff915c9387fdc410904`; corrected assertion in `f74f2ca6d1dbdaee14f35799a735a143968642a6`).
- Branch head now `f74f2ca6d1dbdaee14f35799a735a143968642a6`.
- No SQL migration has been applied to Supabase in this update; it remains branch code pending QA DB migration.
- Pages workflow was queued on earlier commit and cancelled after subsequent branch updates; do not treat as deploy/test success.
- Next: implement RRS driver photo selection, client compression to <=1MB, secure storage and safe display; then audit/test Food/Shop, Parcel, payment/subscription and auth.

## X2 RRS photo implementation
- Commit `b1583905aac5e994adf1360f2e099f50226c6ff2`: required photo selection, preview, client JPEG compression to <=1 MB, upload to existing `driver-profile-photos` bucket under `rrs-guest/`, RPC path persistence.
- Commit `b56c33f582675f98977694b43527e3b21fc08886`: migration adds photo path column, restricted Storage policies, public LIVE view field and photo-path RPC.
- Commit `ca63b81dd52c52cc5a0b4d879625ccc3536af651`: LIVE ride cards show signed photo URL.
- Regression test additions committed to test file.
- Live QA still pending: apply migrations in QA Supabase, test anonymous upload and signed read, verify photo appears after posting.


## X2 Commerce / Parcel Audit (2026-11-27)
- **Food:** restaurant and menu rendering currently uses local demo arrays (FR_DEMO_RESTAURANTS, FR_FOOD_MENU); menu items display “Price set by restaurant” and use add/ask-price behavior. This is not verified live backend catalogue pricing or an order-create workflow.
- **Shop:** approved store list and partner catalogue are RPC-backed (fr_customer_list_approved_stores_geo, fr_customer_list_partner_catalogue). The UI has cart/checkout components, but this audit has not yet verified server-side order creation, fee calculation, payment verification, or tracking persistence end-to-end.
- **Parcel:** submitParcelRequest() currently validates form inputs and then shows an alert saying live booking requires parcel table mapping. It does not save a booking or create a tracking record. Parcel create/save/reopen/cancel/tracking is therefore **not implemented/verified** in this branch at this point.
- **SQL inventory:** the branch has no parcel/food/shop order migration files in its Supabase migrations directory; do not report these workflows as backend-live.
- **Next blockers:** identify/confirm the existing schema and auth/payment contracts before implementing parcel/order persistence; avoid inventing production tables or marking payment verified client-side.
- **Verification:** latest CI on f7aad253 — Button & JavaScript Audit PASS, Playwright Regression & E2E PASS, Pages build/deployment PASS. These checks do not prove real Supabase order persistence, payment verification, SMS, push, or live-device tracking.
