# Phase 7B — Session Switch Harness Boundary Audit
Date: 2026-11-25
Branch: arjuna-x/phase-7-ai-intelligence-safety
Reviewed commit: d482f5d5da4d7e8652bd3c4cbda43e19455b2b06
Checkpoint: 91% estimated QA/documentation progress (not runtime coverage)

## Reviewed files
- qa/PHASE-7B-SESSION-SWITCH-ISOLATION-TEST-PLAN-2026-11-25.md
- qa/PHASE-7B-SESSION-ISOLATION-RUNTIME-SAFETY-CHECKPOINT-2026-11-25.md
- qa/PHASE-7B-SESSION-ISOLATION-RISK-REGISTER-2026-11-25.md
- qa/local-only-fixture.cjs
- qa/phase-11-page-isolation.spec.js
- qa/phase-11-registration-isolation.spec.js
- qa/phase-11-security-isolation-contract.test.mjs

## Confirmed test-harness boundaries
- Existing browser fixture creates a minimal Supabase stub: auth.signOut, from().select().limit(), rpc() only.
- Browser requests are allowed only to the configured local static-server origin; other origins are aborted.
- Current browser Playwright specs cover page visibility/inertness and role-specific registration fields; they do not test authenticated User A→B session switching, pending request cancellation, stale response discard, or parallel authenticated context binding.
- Contract tests inspect source markers and harness restrictions. They do not establish real authentication/session isolation.
- No dedicated session-switch fixture/helper was identified in reviewed files.

## Safe next-step proposal (not implemented)
Create a test-only synthetic session/context fixture, entirely in memory, with deterministic User A and User B identifiers and delayed mocked response control. Assertions should cover:
1. Anonymous protected request rejection.
2. A fixture visible only in A context.
3. Logout clears context.
4. B login/context binding contains B only.
5. Deferred A response arriving after switch is discarded.
6. Concurrent A/B responses remain bound to their originating context.
7. Invalid restore falls back to anonymous.
8. Logout stops fixture listeners/timers.
No real auth, Supabase network, SMS, push, payments, GPS, customer data, production storage, or SQL is touched.

## Gate
Existing harness is suitable for local-origin-only browser tests, but current helper is not an authenticated session fixture. A new isolated fixture is only a proposal; no code was changed. Runtime verification remains pending.

## Status
- Static harness boundary review: complete.
- Existing CI evidence from commit 05ca954: both workflow runs successful; recorded previously.
- Authenticated session switch runtime: not tested.
- Production/release: blocked pending runtime/security evidence.


## Follow-up static audit — logout and notification async race candidate

**Reviewed source:** `index.html` (read-only; 2026-11-25)

- Supabase auth persistence uses localStorage key `friend-ride-auth-v1`; persistSession, autoRefreshToken, and detectSessionInUrl are enabled.
- Logout invokes `sb.auth.signOut({scope:'local'})`, clears currentUser/currentProfile and selectedRole, removes `friendride_selected_role`, sets online false, resets header/drawer and navigates home.
- Realtime hook wraps logout to stop realtime before original logout; SIGNED_OUT also stops realtime.
- Realtime channels and filters include the current user ID; start logic removes an existing channel when changing IDs.
- Notification loader queries both notification tables with `user_id=currentUser.id`, then writes shared `frRideNotifRows` after awaiting query results. A post-await current-session identity/request-generation guard was not observed in this reviewed function.
- This is a **static race-risk candidate only**: a delayed A response may finish after a session switch and update shared state. No runtime leak has been demonstrated; live auth, RLS, timing and rendering behavior remain unverified.

### Recommended test (not implemented)
1. Hold mocked A notification response pending.
2. Switch to B and resolve B request first; assert only B rows appear.
3. Resolve delayed A response; assert B UI remains unchanged and A response is discarded.
4. Logout; assert channel cleanup and empty private notification UI.
5. Run parallel A/B requests and invalid restore fallback with synthetic IDs only.

### Status refresh
- Static logout and realtime cleanup review: completed for reviewed functions.
- Late-response session guard: not verified; risk candidate documented.
- Session-switch tests: not implemented / not run.
- No application, SQL, backend, production or account changes.
- Release certification remains blocked.


## Follow-up static audit — auth restore, role validation, and stale async risk

**Reviewed:** `index.html` (read-only)

### Confirmed source observations
- Role routing maps customer/driver/partner/admin to distinct dashboard page IDs.
- `enterRole` persists the selected role in localStorage and opens the role-locked auth modal.
- `acceptSession(user)` loads profile data by user ID, falls back to a `user_id` lookup, then performs an admin-membership query. It rejects admin role when membership is absent and rejects a selected-role mismatch; unknown roles fall back to customer.
- Driver login checks approval state and rejects pending/unapproved status.
- Session restore obtains the Supabase session, fetches profile role and admin membership, sets selected role, then calls `acceptSession(user)`.
- Another auth-state listener clears current user/profile and stops driver polling on SIGNED_OUT; TOKEN_REFRESHED updates currentUser.

### Race / verification gaps
- The reviewed asynchronous profile and admin checks in `acceptSession` do not show an identity/session generation check after each await. This is a static stale-session race candidate if auth changes while those requests are pending.
- Session restore and `acceptSession` perform overlapping profile/admin lookups. Runtime behavior and failure ordering are not tested in the inspected harness.
- A role mismatch is rejected, but the safe fallback / UI state after rejection requires runtime verification.
- Role-routing source markers do not prove server-side RPC/table/storage authorization.

### Recommended synthetic tests (not implemented or executed)
1. Hold A profile lookup pending, switch to B, resolve A lookup; A must not overwrite B state.
2. Hold A admin-membership query pending across logout/session change; late result must not authorize or route A.
3. Restore sessions for customer/driver/partner/admin and mismatch role selection; assert correct page and rejected fallback.
4. Test pending driver approval rejection and approved driver route using synthetic fixtures.
5. SIGNED_OUT clears identity/profile and polling; TOKEN_REFRESHED for current session only updates current identity.
6. Use isolated browser contexts and blocked external calls; do not use real users or production sessions.

### Updated status
- Static auth restore/role source review: completed for inspected functions.
- Stale async profile/admin result handling: not verified; candidate risk.
- Runtime role/session restore: not tested.
- Backend authorization and RLS: not verified by source-only frontend review.
- No app/SQL/backend/production changes; release remains blocked.


## Follow-up audit — existing local-only browser harness capability

**Reviewed files:** `qa/local-only-fixture.cjs`, `qa/phase-11-page-isolation.spec.js`, `qa/phase-11-registration-isolation.spec.js`, `qa/phase-11-security-isolation-contract.test.mjs`.

- Fixture injects a minimal Supabase stub (`signOut`, limited `select/limit`, `rpc`) and aborts requests to origins other than the configured local test-server origin.
- Current browser specs cover page exclusivity/inert hidden pages and role-specific registration controls. They do not simulate authenticated A/B sessions or Supabase session restore.
- Contract tests assert source markers for admin membership, role allowlist/mismatch, driver approval, registration controls, and page isolation. Source-marker assertions are not execution tests of live auth or backend authorization.
- The current fixture does not provide a session-aware auth event sequence, delayed profile/admin query responses, realtime channel lifecycle assertions, or A/B-owned notification payload fixtures.
- A future A/B test requires a dedicated test-only fixture seam. Existing fixture should not be extended to connect real Supabase/auth or production endpoints; keep external-origin blocking.

### Harness conclusion
The reviewed existing test harness is safe for its local static/browser scope, but is not yet capable of proving authenticated session-switch isolation. No tests were added or executed in this audit checkpoint. No app, SQL, backend, production, account, or real-user changes were made.


## Follow-up — isolated session fixture implementation gate

### Local-only safety controls confirmed
- `package.json` browser tests are invoked via `npm test` with a preflight; unit tests are separate via `npm run test:unit`.
- `playwright.config.cjs` requires an explicit `FRIEND_RIDE_BASE_URL` and restricts it to localhost/loopback; hosted/live fallback is disabled.
- Playwright uses headless mode, service workers blocked, and only the two currently approved browser specs are in testMatch.
- `scripts/qa-local-preflight.cjs` validates localhost/loopback and requires a local HTML response before browser tests.
- The existing Supabase stub is intentionally minimal; it cannot represent auth events, user-bound query responses, deferred responses, or realtime channel cleanup.

### Test-only fixture design contract (proposal; no implementation yet)
- Use plain synthetic IDs `fixture-user-a` and `fixture-user-b`; no JWTs, real credentials, real profile data, or Supabase client.
- Model state in a dedicated fixture object with an explicit session-generation counter.
- Every request carries the originating fixture user ID and generation; responses are controllably deferred/resolved.
- Fixture rejects protected requests when anonymous and rejects results whose user ID/generation no longer matches active session.
- Logout increments generation, clears private fixture state, and records listener/timer cleanup.
- Keep test execution in local-only Playwright contexts; retain existing external-origin blocking.
- Do not alter production app code, auth settings, SQL, backend policies, or hosted deployment as part of fixture work.

### Acceptance matrix (future tests)
| Case | Expected |
|---|---|
| Anonymous protected request | Denied; no private fixture payload |
| A login and request | Only A synthetic data |
| Logout A | Context cleared; generation advances |
| B login | B context only; no A data |
| Deferred A result after B switch | Discarded; B view unchanged |
| Parallel A and B contexts | Responses stay bound to their originating isolated contexts |
| Invalid restore | Anonymous safe state |
| Logout cleanup | listeners/timers stopped; private state cleared |

**Gate:** Fixture implementation must be reviewed for separation from production and external network before adding it to Playwright testMatch. No fixture or tests have been implemented or executed in this checkpoint.


## Follow-up — fixture isolation and external-origin observability review

Reviewed `qa/local-only-fixture.cjs`, `qa/phase-11-page-isolation.spec.js`, and `qa/phase-11-registration-isolation.spec.js` read-only.

### Confirmed
- Fixture derives allowed origin from `FRIEND_RIDE_BASE_URL` and blocks all requests whose origin differs; blocked origins are recorded in `page.__frBlockedOrigins`.
- Inline initialization receives a minimal Supabase stub (signOut, select/limit, rpc); this does not emulate authenticated session events.
- Current two Playwright specs import the fixture and cover dashboard page isolation and registration-field isolation only.
- Reviewed specs do not currently assert that `page.__frBlockedOrigins` stays empty; it is available as an observability hook, not an asserted security test in these files.
- Fixture constructs `new URL(process.env.FRIEND_RIDE_BASE_URL)`; normal test invocation relies on preflight/config guards. Direct fixture use without env can fail at import time rather than report a friendly guard.

### Risk / next improvement proposal (not implemented)
1. Add a fixture-level assertion/helper for unexpected external-origin attempts, where appropriate, while preserving external blocking.
2. Make direct fixture import failure message explicit if the local target env is missing/invalid; avoid weakening loopback-only enforcement.
3. Add the synthetic auth/session fixture as a separate helper and spec, not by expanding the production Supabase stub into a fake live auth system.
4. Add test proving no external-origin requests are attempted by the current page and registration specs.

**Status:** Read-only review only. No code changes, no tests run, no production/backend/network changes. Runtime session isolation remains unverified.


## Follow-up — auth/OTP error and diagnostic disclosure static review

Reviewed `index.html` read-only around OTP verification, local auth storage, and diagnostic logging.

### Source observations
- Supabase client configured with localStorage persistence and auth storage key `friend-ride-auth-v1`; automatic token refresh and URL session detection are enabled.
- OTP verification code requires a verified response plus an access/refresh token pair, then calls `sb.auth.setSession` and `acceptSession`.
- OTP verification catch path displays an error message assembled from `e.message`; the inspected path did not visibly log token values directly.
- Reviewed source excerpt did not contain `console.log`; found `console.error` in push setup catch and `console.warn` in profile photo load catch, both message-oriented.
- Static inspection alone cannot establish whether error messages from external functions/RPCs ever contain sensitive values; redaction and runtime log review remain pending.

### Verification gap / recommendation (not implemented)
- Add a diagnostic redaction contract test for access/refresh tokens, OTP values, phone numbers, and signed-storage URLs before any diagnostic/error string is surfaced or persisted.
- Keep user-facing error text concise and avoid forwarding raw backend messages where they may include secrets or private identifiers.
- Inspect the full auth/OTP/push error paths and any backend logs during an authorized staging runtime review; this checkpoint did not access logs or real credentials.

**Status:** Read-only static review; no code changes and no tests executed. Production/runtime disclosure behavior not proven.


## Follow-up — notification loader session-binding and stale response audit

Reviewed the complete `frRideLoadNotifications` function and realtime lifecycle source in `index.html` read-only.

### Confirmed static observations
- Loader captures the current user ID implicitly through `currentUser.id` when constructing both notification queries.
- Both queries run concurrently and filter on `user_id` before ordering/limiting.
- After awaiting both queries, the function writes results to shared `frRideNotifRows`, renders, and reports the row count.
- The reviewed loader has no observed captured-user comparison, session-generation check, or cancellation check after the awaited queries and before shared-state writes.
- The catch path displays `e.message` in the notification status element. This is a potential raw backend/error disclosure path; actual contents and exposure depend on runtime error objects.
- Realtime channel start is user-ID scoped; stop removes channel, resets channel/started-user markers, clears rows, and resets unread count. However, stopping a channel does not itself prove that an already-pending loader response is discarded.

### Risk classification
**P1 static stale-session/race candidate:** if User A's request is pending when identity changes to B or logout, A's response may still populate the shared notification state. This has not been demonstrated at runtime.

**P2 diagnostic disclosure candidate:** backend error messages may be forwarded to the notification status UI without observed sanitization. No secrets or private data were confirmed in an error payload.

### Recommended tests (not implemented)
1. Mock delayed A query pair; switch to B; resolve B; then resolve A; verify only B notification rows remain rendered.
2. Logout during pending loader; resolve it; assert private feed remains empty.
3. Force synthetic errors containing token/OTP/phone/signed URL markers; assert sanitized UI output.
4. Verify channel stop/removal and unread badge reset on logout and identity switch.
5. Ensure both ride/app notifications remain filtered by the active synthetic user ID.

**Status:** Static audit only. No code changes, runtime tests, database queries, or production network calls performed.


## Follow-up — PWA push payload privacy and notification-click URL audit

Reviewed `service-worker.js` read-only.

### Static observations
- Background FCM handler uses notification/data payload title and body directly when showing a notification.
- Web Push handler may use raw `data.body`/`data.message` as notification body, and uses payload-provided `icon`, `badge`, `tag`, and `url` values with defaults.
- Notification click resolves the stored payload URL relative to service-worker scope, focuses/navigates an existing window, or opens a new window. The inspected code does not show an explicit same-origin allowlist check before navigation.
- Notification bodies can be visible on lock screens; this static review cannot determine whether actual payloads contain sensitive order/customer/ride details.

### Risk candidates
- **P1 privacy candidate:** Push payloads may include private details in notification body on device lock screen. Payload content and user/device privacy settings are not verified.
- **P2 navigation candidate:** Payload-supplied notification URL should be constrained to same-origin/approved app routes; static source does not show an explicit allowlist check.
- **P2 resource metadata candidate:** Payload-controlled icon/badge URLs are used in notification options; runtime origin/asset behavior not verified.

### Recommended tests / safeguards (not implemented)
1. Synthetic push payload with private-marker text; verify policy-approved notification content avoids exposing sensitive identifiers.
2. Notification-click tests for same-origin app route, external origin, malformed URL, and javascript-like scheme; reject non-approved destinations.
3. Assert icon/badge are fixed trusted local assets or approved same-origin URLs.
4. Check push payload schema and redaction at sender/backend boundary; never use real customer data in tests.
5. Test both FCM background handler and Web Push handler to ensure duplicate/overlapping payload behavior is intentional.

**Status:** Static review only. No code changes, push sends, real devices, backend inspection, or runtime tests.


## Follow-up — push subscription ownership and account-switch review

Reviewed `frEnableDeviceAlerts` and `fr_push_subscriptions` handling in `index.html` read-only.

### Confirmed source observations
- Push registration requires an authenticated `currentUser.id` and granted notification permission.
- Existing browser subscription is checked against the configured VAPID key and a database record filtered by both endpoint and current user ID.
- If key/known-owner check fails, code attempts to deactivate the endpoint record filtered by the current user ID, then unsubscribes the browser subscription.
- New/retained subscription is upserted with `user_id`, endpoint, public/auth subscription keys, user agent, active flag, and update timestamp; upsert conflict target is endpoint.
- Reviewed logout wrapper stops realtime notification channel but does not show push subscription unsubscribe/deactivation on logout.

### Risk candidates
- **P1 account-switch/device privacy candidate:** Browser push subscription persists independently of auth logout; account switching behavior depends on sender-side subscription ownership checks and database policies. Source does not prove that old-user endpoint records are deactivated or that pushes are never sent to a stale endpoint after logout.
- **P1 database authorization candidate:** Upsert conflict target is endpoint. Correct ownership transfer/deactivation behavior depends on server-side constraints/RLS, which was not inspected or executed in this static checkpoint.
- **P2 cleanup candidate:** No explicit logout-time push subscription cleanup function was found in the reviewed excerpt.

### Recommended synthetic tests (not implemented)
1. User A subscribes; logout; assert endpoint handling is documented/defined (deactivate or explicitly retain with safe sender semantics).
2. Same browser signs in as B; verify endpoint ownership transition and sender delivery authorization never cross users.
3. Verify endpoint upsert conflict cannot change owner without approved authorization; test RLS/constraints in isolated staging.
4. Test expired/revoked subscription cleanup and failure handling without sending real push.
5. Confirm logout realtime cleanup is separate from push-subscription lifecycle.

**Status:** Static review only; no SQL/RLS inspection, push send, device test, production change, or runtime test performed.


## Follow-up — notification click destination allowlist audit

Reviewed `service-worker.js` notification click behavior read-only.

### Confirmed observations
- Both FCM background and generic Web Push payloads place a payload/default URL in notification data.
- Click handler constructs target with `new URL(notification.data?.url || './', self.registration.scope)`.
- Handler focuses an existing window and navigates it to the target, or opens a window when no client is found.
- No explicit same-origin comparison or approved-path allowlist is present in the reviewed click handler.
- Generic Web Push allows payload-supplied icon, badge, tag, URL, ride_id; FCM background uses fixed local icon/badge but payload URL.

### Risk candidates
- **P1/P2 destination validation candidate:** URL construction accepts absolute URLs and does not itself enforce same-origin or allowed route. Actual exploitability depends on browser/client behavior and payload authorization; not runtime-tested.
- **P2 notification resource URL candidate:** generic push icon/badge can be payload-controlled, with no visible allowlist.
- **P1 privacy candidate:** notification bodies include payload text; lock-screen exposure depends on sender payload and device notification settings.

### Recommended tests (not implemented)
1. Synthetic click payloads: relative same-origin route, absolute same-origin route, external origin, malformed URL, and disallowed route; verify only approved internal targets navigate.
2. Verify no open/focus/navigate path escapes origin and route policy.
3. Test payload icon/badge validation against approved local assets.
4. Verify sender payload contains no phone numbers, addresses, OTPs, private order details, or payment secrets.

**Status:** Static source review only; no push payloads sent, browser tests, devices, production changes, or runtime verification.


## Follow-up — push payload sender/schema and migration visibility audit

Repository root, `sql/`, and `supabase/migrations/` directory listings reviewed read-only.

### Confirmed scope observations
- Root includes push-related client files (`service-worker.js`, `firebase-messaging-sw.js`, `fcm-web-push.js`, `fr-notification-fallback.js`).
- The inspected `supabase/migrations/` listing contains the migrations shown in its current directory, but no migration filename visibly identifies `fr_push_subscriptions` or push endpoint ownership/RLS policy setup.
- The `sql/` listing contained only `fix_ride_customer_driver_contact.sql` at this check.
- GitHub repository search for the exact push-subscription/sender keywords returned no matching excerpts in this attempt; this does **not** prove no sender exists (search indexing/visibility limitation).

### Risk candidates / evidence gaps
- **P1 evidence gap:** Push subscription table creation, uniqueness/ownership constraints, RLS policies, and sender authorization are not established by the inspected migration directory listings.
- **P1 evidence gap:** Cannot verify whether a push sender checks active subscription owner against event recipient before delivery.
- **P2 evidence gap:** No sender-side payload schema/redaction contract located in this read-only check.

### Required follow-up evidence
1. Locate actual `fr_push_subscriptions` table definition, constraints, and RLS policies (including any deployed SQL not committed to these directories).
2. Locate sender implementation (Edge Function, GitHub workflow, Firebase backend, or other existing project component) and inspect recipient-owner checks.
3. Verify sender schema excludes sensitive fields from notification payloads and restricts navigation URLs.
4. Do not add services or subscriptions; evidence should come from existing GitHub/Supabase/Firebase project configuration.

**Status:** Directory listing/source search only; no Supabase database access, SQL execution, push sends, runtime tests, or production changes.


## Follow-up — competing push registration/configuration audit

Reviewed `FCM-WEB-PUSH-SETUP.md`, `fcm-web-push.js`, `firebase-messaging-sw.js`, and `fr-notification-fallback.js` read-only.

### Confirmed source observations
- `fcm-web-push.js` creates an opt-in card, loads Firebase compat SDK, obtains FCM token using its VAPID public key and `service-worker.js`, then posts token to `fr-notification-register-token` with authenticated session.
- Setup documentation identifies `firebase-messaging-sw.js` root registration as a step and explicitly warns that placeholders/config and registration payload must be verified before functional deployment.
- `firebase-messaging-sw.js` uses Firebase background messaging and click navigation from notification data, without explicit URL origin/route allowlist in this file.
- The main `index.html` push-enable function separately registers `service-worker.js`, uses a different visible VAPID public key, and upserts `fr_push_subscriptions` directly.
- `fr-notification-fallback.js` separately reads notification events for active user, Realtime-subscribes filtered by user ID, and polls every 60 seconds; the static review shows no post-await identity-generation guard around `loadRecent()` writes/display.

### Risk candidates
- **P1/P2 configuration divergence:** Two client registration paths appear to use different VAPID keys and different registration mechanisms/table/function. Operational configuration and sender compatibility must be established before claiming push works.
- **P1 service-worker lifecycle/ownership candidate:** Multiple registration paths/workers may overlap or be selected inconsistently depending on scope and browser registration; runtime registration state was not inspected.
- **P1 stale-user display candidate:** Fallback `loadRecent()` can finish after a user switch and call `showEvent` without an observed captured-user/session-generation check. 
- **P2 fallback privacy:** Notification event query selects `payload` and `category`, but UI displays title/body; verify payload remains unused/redacted and event data contains no secrets.
- **P2 click URL validation:** FCM worker click path takes data URL directly; explicit origin/route validation is not visible in reviewed file.

### Recommended isolated tests (not implemented)
1. Confirm one canonical registration path, worker, VAPID key, token/subscription table, and sender.
2. Simulate worker registrations and check scope/controller consistency.
3. Delay user A fallback query, switch to B, resolve A; ensure A results are not displayed.
4. Verify fallback query and realtime event filters remain user-bound.
5. Test click URL allowlist and privacy-safe payload contract.
6. Confirm setup documentation matches actual deployed function, schema, and worker.

**Status:** Static review only; no Firebase/Supabase configuration queries, deployed function inspection, push sends, runtime/browser tests, or production edits.


## Follow-up — notification fallback delayed-response and payload boundary audit

Reviewed `fr-notification-fallback.js` read-only and attempted repository code search for `fr_notification_events` and `fr-notification-register-token`; no search excerpts were returned in this attempt (search-index limitation; not proof of absence).

### Confirmed source observations
- Fallback queries `fr_notification_events` for `id,title,body,status,created_at,category,payload`, filtered by `user_id=activeUser`, newest-first, limited to 20.
- Results are reversed before display; displayed title/body are assigned via textContent (not HTML injection).
- Realtime channel filters INSERT events by `user_id=eq.<activeUser>`; polling interval is 60 seconds.
- On connect, active user is assigned, prior channel/timer removed, then recent events loaded and new channel/polling started.
- The asynchronous `loadRecent()` uses current `activeUser` when constructing the query, but no captured user/session-generation check is observed after awaiting the query before showing rows.
- Event `payload` and `category` are selected but not used in the visible rendering path shown.

### Risk candidates
- **P1 stale-user UI candidate:** A delayed query may resolve after account switch and display events from the earlier request; a post-await user/generation check is not visible.
- **P2 notification payload data minimization candidate:** Selected `payload` field may contain sensitive content even though this UI does not render it; server-side event schema and retention remain unverified.
- **P2 event deduplication/retention candidate:** `seen` set is in-memory and not bounded in reviewed file; lifecycle/retention and duplicate behavior require runtime verification.
- **Positive static observation:** Display text uses DOM textContent, reducing HTML injection risk in the shown rendering path.

### Synthetic test plan (not implemented)
1. User A delayed query → switch to B → resolve A; verify no A event appears.
2. Logout while recent-event query pending; verify results discarded and fallback UI cleared.
3. Realtime A insert after switch to B; verify channel teardown prevents display.
4. Malicious title/body HTML strings; verify literal text rendering.
5. Inspect payload schema/retention and verify unnecessary sensitive fields are not stored or selected.
6. Verify duplicate IDs, skipped/failed rows, and long polling sessions remain bounded.

**Status:** Static source review and repository search attempt only; no DB policy inspection, runtime tests, production edits, or notifications sent.
