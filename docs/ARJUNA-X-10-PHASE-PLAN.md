# ARJUNA X — 10-Phase Clean Restart Plan

**Project codename:** ARJUNA X  
**Customer brand/app:** FRIEND RIDE  
**Website:** friendride.in  
**Active working branch:** `arjuna-x/phase-2-repository-assets-inventory`  
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
**Phase 1 — SCOPE LOCKED / DOCUMENTATION COMPLETE. Phase 2 — IN PROGRESS / NOT ACCEPTED.** Current completed CI evidence: run #713 (`8f74189`, action-v7 workflow) passed 48 Playwright tests, typecheck/core typecheck, runtime build, Node unit (7/7) and Vitest (5/5); local PWA smoke verified active service-worker registration, linked manifest and icon HTTP responses; production and QA Supabase projects are active/healthy with migration/table/RLS metadata and a sampled SECDEF review recorded. Dependency audit remains 1 moderate + 2 critical, and no committed lockfile exists. Branch protection/required checks are disabled.

Remaining Phase 2 acceptance blockers: official icon/logo visual inspection; installed-device PWA/worker update/background push proof; full RLS/SECDEF/Edge secret/auth audit; app source currently hardcodes production Supabase and does not wire the QA project, so full live integration E2E cannot be safely run; QA branch protection/required checks are not enforced and require owner policy. Legacy Dark+Gold spec is archived/excluded from active suite; target Navy/Orange/White design acceptance is deferred to Phase 3. Phases 3–10 remain pending. No app runtime, backend, schema, authentication, payment, main branch, or live deployment has been changed.

## Latest ARJUNA X status update (Pass 37)

- Phase 1: accepted/locked.
- Phase 2: still **IN PROGRESS / NOT ACCEPTED**. Route baseline reconciled to 58 existing page IDs and tested by local Playwright CI. Latest verified quality run `45056228462` passed type/unit/build and browser regression (**47 passed**). Legacy Dark+Gold spec excluded from active suite; new tests follow Navy/Orange/White scope. External API isolation patch is pending CI.
- Remaining Phase 2 evidence: visually inspect official icon binaries; verify PWA installability/worker scope/update and push runtime; retrieve deployed Supabase RPC/Edge Function/auth/RLS contract evidence without backend edits; full role permission live E2E; owner-approved branch protection/required checks.
- Phases 3–10 remain pending until Phase 2 acceptance. Main merge and live deployment are prohibited in this workstream.


## Latest ARJUNA X status update (Pass 38)

- Phase 1: accepted.
- Phase 2: **IN PROGRESS / NOT ACCEPTED**. QA branch has 58-route source reconciliation and local Playwright route activation baseline. Quality Gate run `45056419922` passed (**47 browser tests**, typecheck/core typecheck/runtime build, Node unit 7/7, Vitest). Test environment blocks external HTTPS except required library CDNs.
- Read-only Supabase evidence: production and QA projects active/healthy; production 79 migrations, 85 public tables all RLS-enabled (62 policy tables, 23 with no policies); QA 25 migrations, 21 tables all RLS-enabled and all with policies. Security Advisor warns of public/authenticated SECDEF grants and production leaked-password protection disabled. Sampled 18 production SECDEF functions have expected role/ownership checks; full audit remains incomplete. No backend changes.
- Remaining Phase 2 acceptance: visual icon verification, PWA install/worker/update/push runtime proof, complete RLS/SECDEF/Edge-secret review, full live role/permission E2E, and owner-approved branch protection/required checks.
- Phases 3–10 remain gated; main merge and live deployment remain prohibited.


## Pass 39 PWA source update

Source scan confirms four registration call sites all target `service-worker.js`; `sw.js` and `firebase-messaging-sw.js` appear unreferenced in scanned source. Token registration is JWT-protected in deployed production/QA; dispatch is secret-header protected in source, secret configuration unverified. PWA runtime installability, active worker/scope/update behavior, and actual push/background delivery remain Phase 2 acceptance blockers.


## Pass 40 PWA smoke test

Added isolated Playwright check for active local service-worker registration, manifest and icon HTTP responses. CI result pending. It is not device installability or push delivery evidence; Phase 2 remains gated on these remaining checks.


## Pass 41 PWA smoke evidence

CI run `45056922006` passed **48 Playwright tests** and all typecheck/build/unit/core checks. Local browser verified active root service worker, linked manifest, standalone metadata and HTTP access to declared icons. This is not device installability or push-delivery proof. Phase 2 remains in progress.


## Pass 42 environment wiring

The app source hardcodes production Supabase ref `fglyplxcczdjtfwobtzh`; the separate QA project `pqsangtvietawkfgpgfu` is not referenced. Current CI blocks external API traffic. Full live QA integration E2E is therefore not available until an approved QA-only environment selector/config is introduced. Phase 2 remains gated; no backend/app configuration change made.


## Pass 43 repository governance

Rulesets query returns 0; branch protection/required status checks previously observed disabled. CI now runs on QA branch push but is not enforced. Owner-approved branch protection policy is still required. No repository settings changed.


## Pass 44 security-catalog screen

Read-only catalog screen: production 88 authenticated-executable SECURITY DEFINER functions, 87/88 show auth/admin/role/ownership source references by heuristic (one public business-details RPC); QA 25/25 show references. All SECDEF functions have search_path settings; 23 production RLS-enabled tables have no policies (QA none). This is not a full manual authorization audit; owner/security review remains. No backend changes.


## Pass 45 summary reconciliation

Top-level Phase 2 inventory/gate/checklist now reflects current verified evidence and open blockers. Latest CI run `45056922006` passed 48 Playwright tests and all typecheck/build/unit/core checks; local PWA registration/manifest/icon HTTP smoke passed. Phase 2 remains not accepted due visual icon/logo, device PWA/push, full security audit, production-vs-QA wiring and branch governance.


## Pass 46 dependency/toolchain risk

CI run `45056922006` succeeded but `npm install` reported 3 dependency advisories (1 moderate, 2 critical); advisory details were not available in the run output. The same run warned that GitHub Actions Node 20 runtime is being deprecated/forced to Node 24, and emitted a `punycode` deprecation warning. This is an unresolved Phase 2 tooling risk; no automatic dependency upgrade was attempted. Phase 2 remains gated.


## Pass 47 lockfile requirement

The active QA branch has no tracked `package-lock.json` or `npm-shrinkwrap.json` (both fetches returned 404), while package.json contains semver ranges and CI uses `npm install`. Dependency resolution is not fully reproducible. Phase 2 remains gated until a real lockfile is generated in a checkout, reviewed, committed on QA, workflows use lockfile-respecting install, and CI reruns. This pass did not generate lockfile or execute commands.


## Pass 48 — Current acceptance and audit evidence status

- Phase 1 remains accepted; Phase 2 is **IN PROGRESS / NOT ACCEPTED**.
- Latest QA branch head (when recorded) is `c1a9eb33eba3d6d8acc167792bc0393306073c3c`, a documentation reconciliation commit. Quality workflow code changes are at `19fe31e276a1c73d25fec779974b9d910d0c2104`.
- CI audit report capture is pending: run `45066821254` (first workflow patch) and run `45066833414` (shell-safe follow-up) were both in progress at observation. Previous verified successful CI SHA remains `d00abcfc369adfee2355a702ca51a3562aa5a5ed`; it is not the latest branch head.
- Exact remaining Phase 2 gates: lockfile + `npm ci` reproducibility (requires checkout/command runner); advisory details/remediation; official icon visual verification; device PWA install/update/offline/background push evidence; complete deployed RLS/SECDEF/Edge-secret/auth review; safe QA project app wiring or authorized integration test environment; owner policy for required checks/branch protection.
- No runtime/backend/schema/auth/payment changes, main merge or deployment in this pass. Phases 3–10 remain gated.


## Pass 50 — Quality gate result for audit-capture patch

Run `45066821254` on workflow commit `f69e86b` completed SUCCESS (48 Playwright, 7 Node unit, 5 Vitest, typechecks/build). The follow-up shell-safe workflow commit `19fe31e` run `45066833414` was in progress when checked; its typecheck/unit job completed successfully, browser job still running. Audit capture artifact exists but its detailed advisory JSON cannot be downloaded through the current connector. Dependency vulnerabilities remain unresolved; Phase 2 is not accepted.


## Latest continuation update (Pass 51 — 2026-11-23)

- Freshly verified active QA branch prior to docs update: `29397f274a0423ced51355e1385e5cc47ab55eac`; branch protection is disabled and required checks are absent.
- Quality Gate run **45066833414 / #712** completed SUCCESS on workflow SHA `19fe31e276a1c73d25fec779974b9d910d0c2104`: typecheck, core typecheck, runtime build, Node unit **7/7**, Vitest **5/5**, and Playwright **48/48**.
- Dependency audit evidence: **1 moderate + 2 critical**; raw artifact `14772085077` exists but package/advisory detail was not retrievable through the available connector. No dependency remediation or lockfile generation was done.
- `main` and the active QA branch are diverged (QA **79 ahead / 1 behind**). The main-only commit `6484549` adds an unlinked `friendride-ui-v1.css` styling asset; no cherry-pick/merge was performed. It is not a completed Phase 3 rollout.
- Phase 2 remains **IN PROGRESS / NOT ACCEPTED**. Phase 3–10 remain gated. No runtime/backend/schema/auth/payment/main/deployment changes. No tests executed in this automation environment; only external CI logs were verified.


## Latest continuation update (Pass 52 — CI action runtime refresh)

- Updated active QA Quality Gate action references to `actions/checkout@v7`, `actions/setup-node@v7`, and `actions/upload-artifact@v7` in commit `8f74189030b15ac1c8a2785eb0baf436b1bf7843`, to address the Node 20 deprecation warning. Official action docs confirm v7/current Node 24 runtime support; this does not change the app's Node 22 target.
- The commit is on the active QA branch. No new Actions run is visible for it; last verified success remains run #712 at SHA `19fe31e276a1c73d25fec779974b9d910d0c2104`. Workflow dispatch is not available through the current GitHub connector, and no local command runner exists, so the action refresh is **not runtime-verified**.
- Phase 2 remains NOT ACCEPTED. Dependency audit counts (1 moderate + 2 critical), absent lockfile, inaccessible artifact detail, asset/device/security/QA-environment/branch-governance gates remain. Phase 3–10 are gated. No runtime/backend/schema/auth/payment/main/deployment changes.


## Latest continuation update (Pass 53 — current CI status)

- Active Quality Gate action versions are v7 (checkout, setup-node, upload-artifact) at workflow commit `8f74189030b15ac1c8a2785eb0baf436b1bf7843`.
- CI run **45072777611 / #713** is in progress. Typecheck/unit job completed successfully; browser job has installed Chromium, started the local server, and is running Playwright. No overall conclusion yet.
- Phase 2 remains **NOT ACCEPTED**. Dependency vulnerabilities, lockfile, icon/logo visual inspection, device PWA/push proof, full auth/RLS/SECDEF/Edge secret audit, QA backend wiring/integration E2E, and branch protection/required checks remain open. Phases 3–10 gated. No runtime/backend/schema/auth/payment/main/deployment changes.


## Latest continuation update (Pass 54 — CI action refresh verified)

- Quality Gate action-v7 refresh was verified by run **45072777611 / #713** at SHA `8f74189030b15ac1c8a2785eb0baf436b1bf7843`: **48 Playwright PASS**, typecheck/core typecheck/runtime build PASS, Node unit **7/7**, Vitest **5/5**; both jobs succeeded.
- npm audit remains **1 moderate + 2 critical**. Advisory artifact detail is inaccessible through the current connector; no dependency fixes/lockfile committed.
- Phase 2 remains **NOT ACCEPTED**. Remaining evidence: reproducible lockfile install and remediation, icon/logo visual proof, PWA device install/update/offline/background push, full auth/RLS/SECDEF/Edge secret review, QA backend wiring/integration E2E, owner-approved branch protection/required checks. Phases 3–10 gated. No runtime/backend/schema/auth/payment/main/deployment changes.


## Pass 55 — Audit summary workflow and Phase 2 gate reconciliation (2026-11-23)

- Confirmed CI run #713 / 45072777611 is complete-success; its browser-e2e and typecheck-and-unit jobs and steps are all successful. The recorded 48 Playwright, 7 Node-unit, 5 Vitest, typecheck/core typecheck and build results remain evidence from that CI run, not tests run in this automation.
- Added package-level npm audit visibility to GitHub job summary (workflow commit a49c5ab) and corrected Markdown escaping (workflow commit d6cb8c7). Isolated YAML parse and exact script fixture checks passed. CI for these workflow commits is not yet verified; the connector cannot list push-triggered runs.
- Fresh main-vs-QA compare before the two workflow commits: QA 88 ahead / 1 behind. Main-only CSS commit 6484549 adds a Navy/Orange/White skin; asset absent on QA and not integrated. Leave for Phase 3 review, no merge/cherry-pick.
- Phase 2 remains IN PROGRESS / NOT ACCEPTED. Open gates unchanged: dependency remediation and lockfile/npm-ci reproducibility; actual audit summary review; official icon/logo visual proof; device install/update/offline/background push; full auth/RLS/SECDEF/Edge-secret review; isolated QA Supabase wiring/integration E2E; branch protection/required checks approval.
- Phase 3–10 remain gated. No app/runtime/backend/schema/auth/payment/main/deployment changes. No local FRIEND RIDE commands or test suite run in this automation; only isolated script/YAML checks plus read-only GitHub source/CI evidence.


## Pass 56 — Latest branch-head evidence (2026-11-23)

- Verified latest continuation commit ce332dda by fetching its metadata/diff; fresh comparison after this run's workflow and documentation commits shows QA 92 ahead / 1 behind main (diverged). Main-only commit 6484549 remains unintegrated.
- CI for workflow commits a49c5ab/d6cb8c7 remains unverified because connector run lookup is PR-only and returns no push-run list. Do not infer PASS from a push trigger.
- Isolated missing-audit-file fallback check passed: emits summary warning and exits non-failing. This is helper-script evidence only, not app tests.
- Phase 2 NOT ACCEPTED. Remaining gates: dependency advisory review/remediation + lockfile/ci install reproducibility; visual logo/icon; device PWA and background push; full backend/auth/RLS/SECDEF/Edge secret review; QA backend environment integration; required checks/branch protection approval. No Phase 3–10 progress; no runtime/backend/schema/auth/payment/main/deployment change.


## Pass 57 — Corrected divergence count

- The Pass 56 comparison preceded the two Pass 56 documentation commits. Fresh comparison after those commits reports QA **94 ahead / 1 behind** main, diverged. This supersedes the 92-ahead count in Pass 56; main-only 6484549 remains unintegrated. Latest commit at this checkpoint: d0a0256959234f08dfbb07cb027237efb7fd5512. No merge/cherry-pick/deployment.
- CI for the workflow audit-summary change remains unverified; current connector cannot list push-triggered runs. Phase 2 remains NOT ACCEPTED and Phase 3–10 are gated.


## Pass 58 — Phase 2 dependency audit evidence

CI log evidence now records package-level npm audit details: tinypool critical transitive (fix 5.1.1), vitest critical direct (major fix 5.1.1), and @vitest/mocker moderate transitive (fix 5.1.1). No package changes/lockfile generation were made because checkout/runtime testing is unavailable and Vitest 5 is a major-version upgrade. CI audit summary formatter was corrected across commits de245b7, a996817, and 07cf768; final follow-up run for 07cf768 remains pending verification at this plan update. Phase 2 is not accepted; Phase 3 remains gated. No main merge or deployment.


## Pass 59 — CI audit formatter recovery evidence

Run 716 completed SUCCESS. Runs 717 and 718 failed due a stale duplicate ternary in the npm audit summary step; the error was fixed in commit 62d9df5. Run 719 on that commit has the summary step, typecheck, core typecheck and runtime build passing; unit and browser checks remained in progress/unverified at the last check. A synthetic formatter helper test passed 4 assertions, not an app test. Phase 2 NOT ACCEPTED; dependency remediation/lockfile, visual/device, backend security/QA integration and branch protection blockers remain. No phase 3–10 implementation progress, merge or deployment.


## Pass 60 — CI formatter acceptance evidence verified

Quality Gate Run 719 on workflow commit 62d9df5 is SUCCESS: typecheck/core typecheck/runtime build PASS, Node unit 7/7, Vitest 5/5, Playwright 48/48; both check-runs succeeded. Audit summary formatter fixed; npm audit still reports 2 critical and 1 moderate across tinypool, vitest and @vitest/mocker with fix target 5.1.1. Phase 2 remains NOT ACCEPTED due unresolved security remediation/lockfile, icon/device/PWA/push, full backend security and QA integration, and branch protection. Phase 3–10 remain gated; no merge/deployment.


## Pass 61 — Lockfile preview workflow (2026-11-23)

The active QA workflow commit `15f42bd0af757a9a47296f4f5dbeee74dbd3e52c` adds least-privilege `contents: read` and an isolated lockfile-candidate job that generates `package-lock.json` with package scripts disabled, captures candidate npm audit JSON, and uploads both for 7-day review. Combined status query had no entries at observation; no CI result/artifact is yet verified. This does not resolve lockfile reproducibility or advisories; artifact review and a real committed lockfile are still required before `npm ci` migration. QA branch is 107 ahead / 1 behind main, diverged; main-only commit `6484549` remains untouched. Phase 2 NOT ACCEPTED; Phases 3–10 gated. No app/backend/schema/auth/payment/main/deployment changes.


## Pass 62 — Vitest 5.1.1 and lockfile candidate (2026-11-23)

- CI run 720 verified the candidate preview job but its lockfile/audit artifact still had 2 critical + 1 moderate with Vitest 3.2.7; candidate was not committed.
- Pin QA dev dependency Vitest to 5.1.1 in `b0383d99`. Run 721 SUCCESS: typechecks/build PASS, Node unit 7/7, Vitest 5/5, Playwright 48/48. Candidate lockfile v3/74 entries audit 0, inspected artifact `14780368196`.
- Workflow commit `7d28a2ff` adds a branch-only, gated lockfile validation/commit job. It will use the same-run candidate artifact, zero-audit gate, `npm ci --ignore-scripts`, and all local/Playwright checks before committing only `package-lock.json` to QA. Run 722 is pending browser job and locked-install job; no lockfile commit verified yet.
- Phase 2 remains NOT ACCEPTED. No main merge, deployment, app runtime/backend/schema/auth/payment change. Phases 3–10 gated.


## Pass 63 — Phase 2 continuation / lockfile gate review (2026-11-23)

- Verified the ARJUNA X QA branch exists by branch search. Fetched and inspected documented candidate commits: Vitest pin commit `b0383d99a40b59d1f54b20f70d5f2ae90df47341` changes `package.json` from Vitest 3 range to exact `5.1.1`; lockfile acceptance workflow commit `7d28a2ffcc87c06c601c38f5464d894edb232506` adds a QA-only candidate artifact validation, audit-zero gate, `npm ci --ignore-scripts`, type/core/build/unit/core/Playwright checks, then branch-only lockfile commit.
- Phase 62 plan evidence says candidate lockfile v3/74 entries audited zero, and Run 721 verified the Vitest 5.1.1 test/build checks; Run 722 status was pending at that recorded checkpoint. This continuation could not retrieve push-triggered run status (workflow-run connector returns PR-triggered runs only) or candidate artifact.
- Do not claim lockfile acceptance/commit until a current branch lockfile fetch and successful locked-install workflow evidence are verified. The automatic commit job is restricted by workflow condition to push on the ARJUNA X QA branch; it requires contents write permission and CI execution, not a local command.
- Phase 2 remains NOT ACCEPTED. Other blockers remain official icon/logo visual inspection; device PWA install/update/offline and background push; full deployed auth/RLS/SECDEF/Edge-secret review; QA app/backend environment integration; and owner-approved branch protection/required checks. Phases 3–10 remain gated. No main merge, deployment, backend/schema/auth/payment change.
- Tests run in this continuation: none. Repository source/commit metadata inspected only. CI evidence referenced above is prior recorded evidence, not newly executed here.


## Pass 64 — Lockfile workflow source review (2026-11-23)

- Fresh QA branch source checks: `package.json` exists and pins `vitest: 5.1.1`; `package-lock.json` fetch returns 404 (not present at branch HEAD). This confirms the lockfile acceptance workflow has not yet produced a verified branch lockfile.
- Inspected commit `7d28a2ff` diff: gated job only runs on push to the exact ARJUNA X QA branch; depends on typecheck/unit, browser E2E, and lockfile-preview jobs; verifies root devDependencies, Vitest lock entry, audit total zero; runs `npm ci --ignore-scripts`, type/core typechecks, runtime build, Node unit, Vitest, Chromium install and Playwright, then commits/pushes only package-lock.json to QA. Workflow requires `contents: write` on this job.
- Risk noted: branch protection/required checks are still disabled per previous evidence, so the QA branch does not currently enforce an approval gate before this branch-scoped write job. No permissions change made because this would alter CI behavior and needs owner/CI verification. The workflow's push condition and job dependencies are verified in source.
- Run 722/lockfile commit remains unverifiable: workflow-run connector lists PR-triggered runs only; candidate artifact cannot be retrieved through current tools. Do not assume it succeeded.
- Phase 2 remains NOT ACCEPTED. Next safe action is verify push-triggered run/artifact and lockfile commit through an access path that exposes those runs, then review the lockfile and test evidence. Remaining non-lockfile blockers: logo/icon visual inspection, device PWA/offline/background push, complete auth/RLS/SECDEF/Edge-secret review, QA backend wiring/integration E2E, owner-approved branch protection/required checks. Phases 3–10 gated.
- Tests executed this pass: none. GitHub source and commit diffs read-only; documentation update only. No main merge, deployment, app/backend/schema/auth/payment changes.


## Pass 65 — PWA service-worker registration and manifest audit (2026-11-23)

- Fresh source inspection confirms both `service-worker.js` and `sw.js` exist on QA branch. They have overlapping push/notification behavior, different cache/activation logic, and different icon path conventions. This raises a duplicate-registration/notification consistency risk; the registration points and behavior must be traced in a checkout/browser before changing or deleting either worker.
- `manifest.webmanifest` declares standalone display and 192/512 PNG icons; current manifest colors are pale blue-grey (#f4f6fb), while the service-worker notification icons use `./icons/icon-192.png`. This is source-only evidence; icons, installability, offline behavior, and update flow were not visually/device verified.
- `package-lock.json` still fetches 404 at QA HEAD, so lockfile acceptance remains unverified. `package.json` continues to pin Vitest 5.1.1.
- No runtime edits made: safely resolving service-worker duplication requires tracing registration code, deployment path, Firebase push behavior and browser tests; cannot perform those tests in current connector-only environment.
- Phase 2 remains NOT ACCEPTED. Next: trace all service-worker registrations and their scope; verify notificationclick handling, FCM/web-push overlap, icon asset existence, PWA install/update/offline on device; verify lockfile workflow artifact/run; close backend/security/integration and branch-protection blockers. Phases 3–10 remain gated.
- Tests executed this pass: none. Read-only branch file inspection and plan documentation only. No merge, deployment, backend/schema/auth/payment change.


## Pass 63–64 — Lockfile accepted; npm ci CI evidence (2026-11-23)

- Lockfile job succeeded in run 725 after safe workflow corrections. Three earlier lockfile-commit attempts failed only in the commit/push step (non-fast-forward, then rebase blocked by untracked lockfile, then generated runtime changes); all tests passed in those runs. Final fix commits candidate lockfile, cleans only the ephemeral runner workspace, rebases on latest QA branch, and pushes without force.
- Verified lockfile commit `2e1e8c43e1401935b5831bdceb1cfe108bc03b7f` (1,299 lines, v3, 74 packages; Vitest/@vitest/mocker 5.1.1). Candidate audit 0 vulnerabilities.
- Workflow commit `e698f75781845d387b1f42cc9dd27aa41f86f104` switches both CI jobs to `npm ci` and removes one-time preview/commit jobs. Run 726 SUCCESS: type/core typecheck, runtime build, unit 7/7, Vitest 5/5, Playwright 48/48, audit artifact 0.
- QA branch/main divergence: 120 ahead / 1 behind. Main-only `6484549` is not merged.
- Dependency lock/reproducibility gate resolved for QA dev dependencies. Phase 2 remains NOT ACCEPTED due icon visual review, device PWA/offline/push tests, complete Supabase security audit, QA environment integration, and owner-authorized branch protection. Phases 3–10 remain gated. No live/main/backend/schema/auth/payment changes.


## Pass 66 — QA notification architecture and secrets requirements (2026-11-23)

- Connected Supabase project inventory verified two active healthy projects: production `friend-ride` (ref `fglyplxcczdjtfwobtzh`) and QA `FRIEND RIDE QA` (ref `pqsangtvietawkfgpgfu`). Read-only inspection only; no database changes or deployments.
- QA Edge Functions inventory: `fr-notification-register-token` ACTIVE v5 with JWT verification; `fr-notification-dispatch` ACTIVE v7 with JWT verification disabled but source requires `FR_NOTIFICATION_DISPATCH_SECRET` header match before processing. Dispatch source also requires `FCM_PROJECT_ID`, `FCM_CLIENT_EMAIL`, `FCM_PRIVATE_KEY`, plus Supabase URL/service role environment. Missing FCM credentials produce explicit 503. Secret values/status cannot be inspected through available Supabase connector; CLI `supabase secrets list` is user-side verification.
- Frontend source contains a VAPID public key and a Web Push subscription flow storing endpoint/p256dh/auth_key in `fr_push_subscriptions`; its function declaration appears later than a simpler notification-permission helper, so the later rich function is the active declaration by JavaScript function-declaration semantics. Source inspection only; not browser tested.
- QA source uses a separate FCM token registration table `fr_notification_tokens` and FCM dispatcher. This is a distinct notification path from the web VAPID subscription table; do not assume FCM dispatcher sends Web Push subscriptions.
- Notification architecture evidence identifies configuration/QA gaps, not an app defect conclusively: VAPID web-push sender/secret path and FCM sender path must be verified end-to-end; notification permission alone is not delivery evidence. The frontend helper is source-present but no device subscription/delivery test performed.
- Phase 2 remains NOT ACCEPTED. Outstanding: lockfile/run/artifact verification; end-to-end Web Push and FCM tests on QA; secret presence confirmation using CLI (never expose values); PWA install/update/offline/device checks; RLS/auth/security review; QA backend E2E; visual assets review; owner-approved branch protections. No runtime code changes, no database/schema/auth/payment changes, no deployment/merge.
- Tests this pass: read-only GitHub and Supabase QA metadata/function-source inspection. No live push sent, no test notification, no secret mutation.


## Pass 65 — Read-only Supabase security evidence (2026-11-23)

- Production public schema: 85 tables RLS enabled, 135 policies, 23 policyless tables with no direct anon/authenticated SELECT/INSERT/UPDATE grants; anon has no direct table DML/SELECT; 0 FORCE RLS. QA: 21 tables RLS enabled, 46 policies, 0 policyless; anon direct grants on 18 tables but no anon/PUBLIC policies; 0 FORCE RLS.
- Production 102 SECURITY DEFINER (6 anon exec, 88 authenticated exec), QA 27 (1 anon, 25 authenticated). Every function has explicit search_path configuration. Read-only review of selected admin, ride, payment, SOS, service-provider/TASKO/Laundry, partner-order, parcel OTP and push functions found ownership/admin checks in the inspected functions; public/approved catalog/business/feedback functions are intended data reads. Full function audit remains incomplete.
- Edge source review: prod 13 ACTIVE, 4 JWT-disabled; SMS OTP has 60s per-phone cooldown, 5 attempts, 5-minute expiry/hash but no IP-level throttle and non-atomic attempt increment; dispatch/dynamic-responder/webhook use explicit secret/signature checks; delivery OTP has JWT/session and customer/assigned-driver checks. QA 6 ACTIVE, 1 JWT-disabled dispatch with secret-header check; token-register uses JWT/session identity. Secret values/configuration not inspected.
- Advisor: production 23 no-policy RLS, 25 auth SECDEF, 6 anon SECDEF, leaked-password protection disabled; QA 0 no-policy, 1 anon SECDEF, 25 auth SECDEF. Potential items are documented (QA anon grants under RLS, OTP IP/race controls, provider phone/payment-data exposure, arrival-photo driver approval predicate, secret presence) without changes because backend/auth/security remediation is outside locked scope.
- Phase 2 NOT ACCEPTED. Logo/device PWA, QA integration, owner branch protection, complete RLS/SECDEF/Edge-secret audit and owner-approved security changes remain. No main merge, deployment, runtime/backend/schema/auth/payment changes. Phases 3–10 gated.


## Pass 67 — FCM is the canonical notification system (2026-11-23)

**User decision:** FRIEND RIDE notifications must follow Firebase Cloud Messaging (FCM). FCM is the primary/canonical delivery system. Web Push/VAPID is legacy/duplicate and is not to be treated as the primary notification path. Audit before removing it; remove/disable redundant pieces only after proving no required behavior depends on them. Work is QA-branch-only.

- Fresh QA Supabase evidence: `fr-notification-register-token` ACTIVE v5, JWT verification enabled; validates Bearer session, resolves authenticated user, then upserts FCM token/platform to `fr_notification_tokens`.
- Fresh QA Supabase evidence: `fr-notification-dispatch` ACTIVE v7, JWT verification disabled at gateway but source requires `x-dispatch-secret` matching `FR_NOTIFICATION_DISPATCH_SECRET`; requires `FCM_PROJECT_ID`, `FCM_CLIENT_EMAIL`, `FCM_PRIVATE_KEY`, Supabase URL and service role. Dispatch reads queued `fr_notification_events`, user preferences, active `fr_notification_tokens`, then sends via FCM HTTP v1. Missing FCM credentials return 503. No secrets were inspected or changed and no live send was performed.
- Fresh frontend source: `service-worker.js` imports Firebase Messaging compat SDK and handles FCM background notifications; it also contains a generic `push` event handler for non-FCM Web Push. Frontend source contains VAPID subscription logic and stores Web Push subscriptions separately from FCM tokens. Registration references found so far point to `service-worker.js`; `sw.js` exists and has overlapping push/click handlers but its active registration references are not yet exhaustively traced.
- Architecture decision: prioritize FCM token registration and FCM HTTP v1 dispatch as canonical. Preserve foreground notification UI, notification history, user category preferences, Telugu text, sound preview, deep links, dedupe and safety/operational alerts. Marketing remains opt-in and throttled per the locked plan.
- Next safe steps: trace all FCM client token creation/refresh and registration call sites; verify token ownership/platform and authenticated registration; trace event queue creation/dispatch trigger and secrets presence via owner CLI; identify whether the VAPID subscription path and `sw.js` are unused; then remove/disable only proven redundant code on QA, with regression tests. Do not delete the shared `service-worker.js` FCM worker. Device/background/locked-screen and actual FCM delivery tests remain unverified.
- Tests this pass: source and QA Edge Function inspection only; no tests run, no notification sent. No app/backend/schema/auth/payment changes, no production project changes, no merge or deployment.

Phase 2 remains NOT ACCEPTED. Phase 9 notification architecture is now directionally locked to FCM but its implementation, configuration, and device delivery are still pending verification.


## Pass 68 — FCM frontend/backend connection gap identified (2026-11-23)

- Searched the QA branch `index.html` for FCM client calls and registration: no `firebase.messaging`, `getToken()`, `fr-notification-register-token`, or `fr_notification_tokens` client references were found.
- The active notification enable handler (later function declaration) currently requests browser notification permission, registers `service-worker.js`, creates a Web Push subscription using the public VAPID key, and upserts `fr_push_subscriptions`. It is not an FCM token-registration flow.
- `service-worker.js` includes Firebase Messaging compat imports/config and `onBackgroundMessage`, so an FCM background handler exists, but frontend token acquisition/refresh/registration wiring is missing or not located in this source audit.
- Therefore FCM is the selected canonical architecture but **not yet fully wired end-to-end in the QA frontend**. Do not label notification delivery functional/verified. Next implementation should add the Firebase Messaging client/token lifecycle and authenticated call to the existing `fr-notification-register-token` Edge Function, while retaining notification permission UX and only removing VAPID after safe dependency review. Must validate browser support, token refresh, sign-in/sign-out ownership, worker scope, foreground handling and regression.
- No code changes or tests in this pass. Read-only source search only. No live notification, secrets inspection, production/backend/schema/auth/payment changes, merge or deployment.


## Pass 69 — Phase 2 re-check: lockfile present, QA evidence bounded (2026-11-23)

- Fresh branch read confirms `package-lock.json` now exists on QA HEAD (npm lockfile v3) and `package.json` matches its root dependency declarations. This corrects the stale Pass 65 note that lockfile was missing; Pass 63–64 had already documented the lockfile and successful CI run 726.
- Historical CI evidence in the plan: run 726 SUCCESS, type/core typecheck, runtime build, Node unit 7/7, Vitest 5/5, Playwright 48/48, audit artifact 0. This is recorded evidence but was not re-run in this pass; connector returns no workflow runs for documentation commits (PR-only run filtering).
- PWA manifest source exists and declares standalone display plus 192/512 icon assets; binary icon content cannot be inspected through text fetch. Source checks show `index.html` registration points to `service-worker.js`. `sw.js` and `firebase-messaging-sw.js` exist but are not shown as active registrations by the examined index registration; avoid deleting them until scope, historic registrations, migration/update and notificationclick behavior are validated.
- Phase 2 checklist: lockfile/reproducible CI — historically PASS, current re-run unavailable; core automated QA — historically PASS, current re-run unavailable; icons visual review — pending; device PWA install/update/offline — pending; FCM frontend token integration and real delivery — pending (Pass 68); full auth/RLS/SECDEF/Edge secret review — incomplete; QA backend integration E2E — incomplete; owner-approved branch protection/required checks — unverified.
- Phase 2 remains NOT ACCEPTED. No code changes/tests in this pass, no secrets inspected, no QA/production database changes, no main merge/deployment. Next actionable implementation: FCM client token registration integration on QA plus test harness and browser regression; then request owner-side device/secret/branch-protection verification for remaining external gates.


## Pass 70 — Safe Phase 2 notification cleanup gate (2026-11-23)

- Confirmed the index loads Leaflet and Supabase SDK, but no Firebase SDK client scripts are currently loaded in the inspected script tags. The page has no located Firebase Messaging token lifecycle client code. This corroborates Pass 68.
- Safe remediation is **not** to remove VAPID today: the current user-facing enable-notifications button actively runs the Web Push subscription flow, and FCM client wiring is not yet present. Deleting VAPID now would break the current push subscription setup before the replacement is proven.
- The active source registration path in index points to `service-worker.js`. That worker imports Firebase Messaging compat and also has generic Web Push push-event handling. `sw.js` and `firebase-messaging-sw.js` are extra worker files with overlapping functionality; their removal is deferred until worker scopes, legacy registrations, migration/update behavior, and notification-click routing are tested in a browser.
- A future FCM client integration must use the existing Firebase project public config and VAPID public key, call Firebase Messaging token acquisition with the canonical `service-worker.js` registration, and register token/platform `web` through the authenticated `fr-notification-register-token` function. It must also account for token refresh, logout/account-switch token ownership/deactivation, foreground display, notification-click deep links, permission-denied UX, and deduplication. Token ownership/deactivation capability must be reviewed against QA RLS/function behavior before coding.
- No frontend integration patch was applied in this pass because browser SDK loading, token lifecycle/account ownership, and QA RLS behavior have not yet been testable through available connector-only execution. This is a deliberate safety gate, not acceptance.
- Phase 2 completion is blocked on current CI rerun/access, FCM client wiring+automated tests, actual QA device delivery and PWA install/offline/update verification, complete security/RLS/Edge secret audit, QA integration E2E, icon visual review, and owner branch-protection verification. Historical CI run 726 remains recorded as successful but is not a fresh test.
