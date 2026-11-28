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


## X2 Parcel Persistence Implementation (2026-11-27)
- Added `202611270004_project_x2_parcel_persistence.sql` for Parcel requests, unique tracking IDs, authenticated customer creation/list/cancel RPCs, status constraints, customer-scoped RLS, and RPC-only grants.
- Hardened create RPC to require a customer profile role; list is customer-scoped and returns no sender/receiver phone numbers; cancel is restricted to the owning customer while status is `requested`.
- UI already calls create/list/cancel RPCs, refreshes tracking, and shows backend status; the migration now supplies the branch-side contract. SQL is not applied to QA Supabase yet, so live DB persistence is pending.
- Food: demo menu is deliberately disabled and does not add fake cart entries. Approved partner catalogue is orderable through `fr_customer_place_market_order`; UI includes partner quotation, customer acceptance/counter, payment QR handoff and partner manual payment confirmation RPC calls. However, the required market-order/payment RPC migration definitions are absent from this branch migration inventory; backend contract, platform fee (2.5% capped at ₹25), and payment-verification rules still need a migration and QA DB verification before these workflows can be called live.
- CI audit after fixes: Button/JavaScript Audit PASS on commit 93ec3545. Playwright and Pages deployment were still running at report update.


## YT branch progress update (2026-11-27)
- Parcel persistence SQL dollar quoting corrected in commit `965c68e206d5826f404eb68eb9f7428193ca883a`; the YT Playwright Regression & E2E run passed, including Project X2 static QA, ERS/RRS station UI regression, Phase 13D cash-only static QA, and Playwright E2E.
- Added regression checks for Parcel and Food/Shop tracking loaders: both must be async, await Supabase RPC, and handle errors; tracking tabs/category wiring is asserted. Commit `2793c2737cbb3368ae7278ec1dcdedb64faa747a`.
- Food/Shop order RPC migration remains a blocker: the UI calls market-order/quote/payment RPCs, but branch migration inventory currently contains no definitions for these RPCs. Do not call Food/Shop backend-live until the SQL contract/migration and QA Supabase verification are completed.
- Parcel SQL remains branch-side only; QA Supabase migration application and authenticated live create/list/cancel test are pending.
- RRS photo compression, storage policy and signed display remain awaiting QA Supabase migration/device verification.


### Follow-up QA safeguard (2026-11-27)
- Added static regression assertions that Partner Food/Shop payment confirmation requires an explicit confirmation prompt, calls the backend confirmation RPC, handles RPC errors, and does not client-write a paid status.
- Added assertions that customer quote acceptance uses its backend RPC and cannot client-write paid status.
- Commit: `0905399b9bf625cd8217a1c3ad1697fe664f765e`.
- Backend Food/Shop order/payment RPC SQL remains absent; this test only verifies frontend safeguards and is not proof of live payment verification.


### Async RPC-handler syntax correction (2026-11-27)
- Corrected six Food/Shop and Parcel/Tracking handlers that contain awaited Supabase RPC calls but were declared non-async: customer market order loader, quote accept, counter-price submit, partner payment confirm, market tracking loader, parcel tracking loader.
- A duplicated async keyword introduced during the correction was identified by the JavaScript Audit and removed.
- Added regression checks requiring these handlers to be async and to await RPC, plus a duplicate-async declaration guard.
- Code commit: `7a728177`; QA guard commit: `eb02c889`.
- At the latest poll: Button/JavaScript Audit passed on `eb02c889`; Playwright and Pages deployment were still running.
- This is a client-side syntax/handler correction only. Food/Shop backend RPC SQL remains unimplemented/unverified in the YT migration inventory.


### YT branch fresh QA database verification (2026-11-27)
- Confirmed current branch: `yt-test-1-to-15`, head `85763474d90130779e94299781a0e8f050fdbccd`.
- QA Supabase project `FRIEND RIDE QA` (ref `pqsangtvietawkfgpgfu`) inspected read-only. Matching public-schema table inventory found no market-order, catalogue, parcel, or order persistence tables; only store-campaign tables matched the store-related filter. Existing profiles, station rides/bookings, and subscription tracking tables were present.
- Therefore Food/Shop order RPCs are absent in QA DB and Parcel migration has not been applied there; no live workflow claims made. No Supabase schema was modified.
- Current head CI: Button & JavaScript Audit #188 PASS; Playwright Regression & E2E #184 PASS; Pages deployment #569 PASS. These are branch CI results, not live DB verification.
- Next implementation blocker: inspect and define Food/Shop order + quote + payment SQL contract against the existing partner catalogue tables, then add QA-only migration and regression coverage. Apply/test Parcel and RRS-photo migrations to QA separately before claiming backend verification.


### YT Project X2 continuation — Parcel QA migration applied (2026-11-27)
- Applied branch migration `202611270004_project_x2_parcel_persistence.sql` to FRIEND RIDE QA Supabase project `pqsangtvietawkfgpgfu` (not Main/production).
- Supabase migration history confirms application under `project_x2_parcel_persistence_yt_202611270004`; RPCs `fr_customer_create_parcel_request`, `fr_customer_list_parcel_requests`, `fr_customer_cancel_parcel_request` are present.
- Authenticated real-user Parcel workflow (create, list/reopen, cancel) still requires test account execution; migration-only confirmation is not end-to-end PASS.
- Food/Shop catalogue tables and market-order/payment RPCs are absent from QA schema inventory. Need identify/apply catalogue base schema first; do not implement market-order SQL against guessed table contracts. Main/production untouched.


## X2 Continuation checkpoint (YT branch, 2026-11-27)
- Latest verified commit before this checkpoint: `108c5f3d40c3928594a130bb5132ffb52286faf2`.
- CI verified for that commit: Button/JavaScript audit #200 PASS; Playwright Regression/E2E #196 PASS; Pages deployment #576 PASS.
- LIVE rides schema mismatch fix: client query no longer requests absent `driver_photo_path`; YT QA schema contains `driver_photo_data` instead. Keep photo data off the public LIVE listing; only show after confirmed booking as currently designed.
- Role-launcher Telugu/emoji encoding repair and SOS card contrast fix committed in prior X2 work; deployment CI is green, but phone screenshot verification remains outstanding.
- QA Supabase parcel migration applied: `project_x2_parcel_persistence_yt_202611270004`; RPCs exist. Authenticated create/list/cancel workflow is NOT yet verified with a QA customer session.
- QA Supabase has no catalogue/order/market tables and no Food/Shop order RPCs. Existing UI RPC contract is documented in `index.html`; do not build order SQL against guessed catalogue fields. Food demo menu stays disabled/non-orderable.
- QA Supabase `fr_station_rides` columns verified: `passenger_capacity`, `passengers_booked`, `departure_at`, `driver_photo_data` exist. This is schema verification only, not ERS/RRS user workflow PASS.
- Remaining: authenticated Parcel E2E; ERS/RRS posting/booking/cancel E2E with test accounts; Food/Shop catalogue and server-side order/payment backend design after identifying authoritative store/catalogue schema; subscription payment reference/admin approval activation test; real OTP/device/push/live-location tests; full YT 1–15 browser and mobile regression.


## Continuation checkpoint — 2026-11-27 (verified YT branch)
- Target branch is exactly `yt-test-1-to-15`; do not confuse with other branches. Main/production remains untouched.
- Current head verified: `82ac59d16ca6fc1351cbc65caf139c90247d9c83`.
- Latest Pages deployment for this head completed successfully (run 46013107150).
- QA Supabase read-only table inventory rechecked: no catalogue/order/market-order tables found; `fr_parcel_requests` exists. Do not invent Food/Shop schema.
- Food/Shop order and payment backend remains blocked on identifying authoritative catalogue schema and defining server-side price/fee/payment-verification contract.
- Parcel migration is present in QA, but authenticated customer create/list/cancel E2E remains unverified.
- Progress estimate remains approximately 60% only as a project estimate, not a fully verified completion rate. Remaining work must be tracked against actual tests and live workflow evidence.


### ERS/RRS regression guard strengthening (2026-11-27)
- Expanded `tests/project-x2-transfer-static.test.cjs` checks for multi-passenger booking capacity/locking, own-ride rejection, authenticated booking RPC ACL, cancellation ownership/status/seat restoration and RPC ACL, ERS approval/future-departure requirements, RRS photo compression/1 MB guard, confirmed-booking-only photo privacy, and LIVE view full-ride filtering.
- Commit: `57367a69`.
- GitHub Actions Button/JavaScript Audit, Playwright Regression/E2E, and Pages deployment were triggered for this commit and are currently in progress; do not report PASS until completed.


## YT Project X2 continuation — QA schema re-audit (2026-11-27)
- Reconfirmed branch head before work: `b174bbb20f17fecd923b760d285d22b5aa4ce4c4` on `yt-test-1-to-15`; Main/production untouched.
- Latest CI for this exact SHA: Button/JavaScript Audit #217 PASS; Playwright Regression & E2E #213 PASS; Pages build/deploy #588 PASS.
- Read-only QA Supabase re-audit of `information_schema.columns` for store/catalog/partner/market-like names found only `fr_store_campaigns` and `fr_store_campaign_redemptions` (campaign/redemption tables), not authoritative product catalogue or market-order tables. No Food/Shop order/payment SQL was applied.
- Parcel migration is recorded in QA migration history (`project_x2_parcel_persistence_yt_202611270004`); authenticated customer create/list/cancel remains untested.
- Next safe step: continue backend contract discovery from existing Partner catalogue RPC definitions and their source tables, then implement only against confirmed columns and verify with QA. Maintain no-fake-order/payment guarantees.
- This audit adds evidence, not feature completion; overall progress stays at 61% pending implementation and live workflow tests.


## Continuation checkpoint — 2026-11-28
- Target branch: `yt-test-1-to-15` only; Main/Production untouched.
- Verified branch head before this checkpoint: `1e8a092ed07dc224dd9f2a3267e08f844bc4d631`.
- Button & JavaScript Audit run #302: success.
- Playwright Regression & E2E run #298: success.
- GitHub Pages build/deploy run #673: success.
- The latest commit adds a regression guard ensuring parcel-release UI explicitly stays demo-only and does not claim a parcel release executed, until server-side payment verification and OTP validation exist.
- CI/deployment success is not evidence of authenticated live backend workflows, real SMS, push notifications, live location, or payment verification.
- Food/Shop backend schema/order migrations remain unapplied in QA. Safe next work: reconcile migration dependencies/signatures and payment/state contract before applying anything; then authenticated QA workflow tests. Parcel authenticated lifecycle persistence also requires QA verification.
- Progress estimate: 63% (branch/CI regression and deployment verification advanced; remaining backend integration and live QA blockers are substantial).
