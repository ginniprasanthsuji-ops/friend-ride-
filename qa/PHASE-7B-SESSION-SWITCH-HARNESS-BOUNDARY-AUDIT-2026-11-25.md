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


## Follow-up — Firebase config and service-worker integration consistency audit

Read-only review of `fcm-web-push.js`, `firebase-messaging-sw.js`, `service-worker.js`, and `FCM-WEB-PUSH-SETUP.md`.

### Static observations
- `fcm-web-push.js` contains Firebase Web config values and a VAPID public key, registers `./service-worker.js`, obtains an FCM token, then posts `{token, platform:'web'}` to `fr-notification-register-token` using the active Supabase session.
- `firebase-messaging-sw.js` is a separate worker that initializes Firebase and handles background messages and notification clicks.
- `service-worker.js` also initializes Firebase and handles background FCM plus a separate generic Web Push path.
- Setup documentation instructs root registration of `/firebase-messaging-sw.js`, while the reviewed opt-in code passes `service-worker.js` as the registration to `getToken()`.
- Setup documentation describes apiKey/appId placeholders as needing replacement, but reviewed source currently contains non-placeholder values. This mismatch requires checking that those values are the correct deployed Firebase Web app config; this audit does not validate them against Firebase.
- Two worker files contain notification-click navigation logic. Both paths lack an observed explicit same-origin and approved-route allowlist in the reviewed code.

### Risk candidates
- **P1 integration/config mismatch candidate:** Setup instructions and runtime registration path name different service workers; verify intended canonical worker and scope before deployment.
- **P1/P2 duplicate/background delivery candidate:** Multiple worker paths and FCM + generic push handlers may produce duplicate or inconsistent notifications; runtime payload/provider behavior not verified.
- **P1 notification navigation candidate:** Both workers navigate using payload data without observed explicit destination allowlist validation.
- **P2 config documentation drift:** Setup instructions refer to placeholders while source values are filled; verify Firebase Console match and avoid publishing secrets (reviewed values appear Web-config/public-key types, but deployment ownership/configuration not verified).

### Isolated tests recommended (not run)
1. Register only the intended worker; confirm scope and controller.
2. Compare FCM token generation registration worker with setup documentation.
3. Test background FCM and generic Web Push separately and confirm no duplicate alerts.
4. Test notification click with same-origin approved path, external origin, malformed URL, and disallowed route; reject unsafe destinations.
5. Verify Firebase Web config in Console against repo, and confirm registration Edge Function payload/ownership/RLS.
6. Validate token refresh, logout/account-switch cleanup, invalid token deactivation.

**Status:** Source review only; Firebase Console, Edge Function, Supabase schema/RLS, browser/device push, and deployed service-worker behavior were not inspected or tested. No production code/config changed.


## Follow-up — FCM token registration lifecycle audit

Focused read-only inspection of `fcm-web-push.js` and repository search attempts for profile-photo/storage upload terms.

### Static observations
- FCM token is generated after opt-in, then registration posts token and `platform:'web'` to `fr-notification-register-token` using the access token from the active Supabase session.
- The code checks session existence immediately before POST, but no post-await identity/session-generation comparison is visible before interpreting the registration response and marking the device enabled.
- Token refresh handling (`onTokenRefresh`/re-fetch token lifecycle) is not visible in the reviewed file.
- Logout/account-switch token deactivation is not implemented in this file; previous audits also noted logout cleanup not observed in the reviewed path.
- Firebase SDK scripts are loaded from the Google CDN. This is an existing external dependency; no subscription/API-key secret validation or endpoint runtime verification performed here.
- Search-index queries for profile-photo/avatar/passport-photo storage code returned no excerpts. This is an index limitation and does not prove those implementations are absent.

### Risk candidates
- **P1 account-context race candidate:** Registration response may finish after account changes; verify the token is still associated with the initiating user and UI state does not carry across sessions.
- **P2 token lifecycle candidate:** Refresh, expiration, invalid-token cleanup, logout, and account-switch behavior need evidence.
- **P2 dependency/config candidate:** SDK loading failures and config mismatch need browser-network and Firebase Console verification.

### Tests recommended (not run)
1. A starts registration → switch/logout → response resolves; UI must not show A registration as active under B.
2. Verify token owner and endpoint uniqueness/ownership in deployed registration Edge Function and RLS.
3. Refresh token changes → update server registration; invalid token → deactivate/delete safely.
4. Logout and account switch → device association cleared or safely re-bound, with no cross-user notification delivery.
5. SDK script blocked/offline → clear safe error and no partial enabled state.

**Status:** Read-only source/search review. No Firebase/Supabase live config, Edge Function, database policies, profile-photo storage implementation, browser/device tests, or production edits were inspected/changed.


## Follow-up — Push subscription ownership and read-only regression coverage audit

Read-only review of `qa/read-only-regression.sql` plus search for `fr_push_subscriptions` and `fr-notification-register-token`.

### Static observations
- Regression SQL expects `fr_push_subscriptions` among tables and reports table existence/RLS enabled status.
- The SQL checks expected functions including `fr_get_push_runtime_config` and `fr_push_notification_webhook`, but it does not inspect push subscription columns, uniqueness/ownership constraints, policies by operation, or Edge Function token registration authorization.
- Existing private-storage checks include driver/partner profile-photo buckets and named policies, but no provider/home-service profile-photo bucket/policy expectations were visible in this regression file.
- Search-index results for the token-registration Edge Function returned only setup/source references; actual deployed Edge Function source/config was not obtained in this checkpoint.
- The regression SQL is explicitly read-only and does not execute DDL/DML.

### Risk/evidence gaps
- **P1 ownership authorization evidence gap:** RLS-enabled table check alone does not establish endpoint/token owner integrity or policy correctness.
- **P2 schema coverage gap:** Push table fields, endpoint uniqueness, user-owner binding, inactive-token cleanup, and operation-specific RLS are not asserted.
- **P2 profile-photo coverage gap:** Regression checks driver/partner private photo buckets/policies; home-service provider photo bucket/policy coverage was not observed here. This is not proof that storage implementation is absent.
- **P2 query correctness note:** Table/function checks join catalog names and then filter schema; duplicate object names in other schemas may create confusing result rows. Prefer schema-qualified catalog joins/EXISTS checks in a future revision.

### Suggested next validation (not run)
1. Inspect deployed `fr_push_subscriptions` columns, constraints, and every RLS policy by operation.
2. Verify registration Edge Function derives user identity only from validated auth and never trusts client-supplied owner ID.
3. Test endpoint conflict/owner takeover attempts and account-switch behavior with isolated A/B contexts.
4. Confirm driver, partner, and home-service provider profile-photo buckets are private with correct owner/admin access.
5. Improve read-only regression SQL to assert policy details/expected storage buckets and schema-qualified object checks.

**Status:** Source and repository-search review only. No Supabase SQL was executed, no deployed schema/policies/functions were inspected, and no production files/configuration changed.


## Follow-up — Profile photo storage privacy and role-access coverage audit

Read-only review of `qa/read-only-regression.sql` and repository searches for storage/photo bucket/policy terms.

### Source observations
- Regression SQL expects private buckets `driver-kyc-documents`, `driver-profile-photos`, and `partner-profile-photos`; it checks that each exists and is not public.
- It expects six named storage policies covering driver KYC upload/read, driver profile-photo upload, admin read driver photos, and partner profile-photo upload/read.
- The regression file does not include a home-service-provider profile-photo bucket/policy check in the reviewed list.
- These policy checks confirm names exist only; they do not verify policy predicates, owner identity, admin authorization, object path handling, MIME/size restrictions, signed URL expiry, or actual cross-role access.
- GitHub code-search attempts for photo bucket/policy terms returned no additional excerpts in this checkpoint; this is search-index limitation, not proof of absence.

### Risk candidates / evidence gaps
- **P1 privacy verification gap:** Private bucket status and policy names do not prove users cannot read another user's KYC/photo objects or that admin access is restricted to authorized admins.
- **P2 role coverage gap:** Home-service-provider profile-photo bucket/policy coverage not observed in the regression SQL.
- **P2 upload validation gap:** MIME/type/size/path restrictions, overwrite behavior, and object ownership validation are not covered by the read-only SQL.
- **P2 access lifecycle gap:** Approval/rejection, profile photo retrieval after approval, and removal/retention of rejected/unapproved records require runtime policy tests.

### Suggested tests (not run)
1. Driver A uploads own photo; Driver B cannot read/write A's path.
2. Partner A uploads own photo; Partner B cannot access A's path.
3. Admin can read only permitted profile-photo/KYC objects; unauthorized role denied.
4. Customer and unrelated roles cannot read private KYC/photo objects.
5. Home-service provider photo upload/read ownership and admin review flow.
6. Test invalid MIME, oversized upload, traversal/path manipulation, overwrite and deletion/retention.
7. Confirm private bucket URLs are not publicly accessible and signed URLs expire.

**Status:** Static SQL/search review only. No storage policies, deployed buckets, files, Supabase runtime, or browser/device access were tested; no production edits or SQL executed.


## Follow-up — Tier-A local-only QA fixture boundary and blocked-origin assertions

Read-only review of `qa/local-only-fixture.cjs`, Phase 11 page/registration browser specs, security contract test, and `scripts/qa-local-preflight.cjs`.

### Static observations
- Fixture derives `localOrigin` from `FRIEND_RIDE_BASE_URL` at module load using `new URL()`; malformed or absent env may throw before a friendly fixture-level message. Preflight handles missing/invalid values separately with exit code 2.
- Browser fixture routes all requests and allows only configured origin; other origins are recorded in `page.__frBlockedOrigins` and aborted.
- Reviewed page-isolation and role-registration specs assert UI/page states but do not visibly assert `page.__frBlockedOrigins` is empty.
- Preflight allows only localhost/loopback and checks GET response, redirect status, and HTML content type; timeout is 4 seconds.
- Supabase fixture stub covers minimal signOut/from-select-limit/rpc APIs, not auth/session A/B behavior or realtime.

### Risk/evidence gaps
- **P2 QA boundary evidence gap:** Requests to blocked origins are intercepted, but reviewed specs do not assert the blocked-origin list remained empty; external dependencies could be silently blocked while tests still pass.
- **P2 fixture usability:** missing/invalid env may fail during fixture import rather than a clear actionable diagnostic, though preflight has explicit validation.
- **P1 runtime coverage gap:** local-only fixture is not a substitute for session-switch/auth/RLS/realtime tests; it cannot validate server authorization.

### Recommended improvements (not implemented)
1. Add a per-test teardown/assertion that `page.__frBlockedOrigins` is empty (or explicitly whitelist/document intentional blocked origins and assert expected values).
2. Validate `FRIEND_RIDE_BASE_URL` at fixture import with a friendly error that matches preflight and allowlist rules.
3. Add tests proving malformed, absent, non-loopback, and hosted URL targets are blocked before browser/server requests.
4. Keep A/B session tests in a separate controlled synthetic harness; do not allow live/hosted fallback.

**Status:** Static source review only; browser tests and preflight were not run in this checkpoint. No production changes.


## Follow-up — Regression CI workflow and dependency reproducibility audit

Read-only review of `playwright.config.cjs`, `package.json`, `.github/workflows/friend-ride-regression.yml`, `scripts/check-inline-js.mjs`, and `qa/phase-11-security-isolation-contract.test.mjs`. Attempt to fetch `package-lock.json` at this branch returned 404.

### Static observations
- Workflow runs inline-JS/source-marker checks, Node contract tests, installs dependencies via `npm install`, installs Playwright Chromium, starts a local static server on loopback, then runs `npm test` with local base URL.
- `npm test` invokes local preflight before Playwright.
- Workflow uses GitHub Actions major-version references (`actions/checkout@v4`, `actions/setup-node@v4`, `actions/upload-artifact@v4`) rather than immutable commit SHAs.
- `package.json` has ranged dependencies; reviewed branch fetch of `package-lock.json` returned 404, so deterministic npm lockfile presence was not confirmed at this ref.
- Playwright configuration restricts host to localhost/loopback, limits discovery to two browser specs, and blocks service workers.
- Contract tests primarily use source-string assertions; they are static guardrails, not runtime authorization tests.
- Inline script check parses embedded JavaScript and asserts a set of source markers; it does not execute app flows or validate backend authorization.

### Risk/evidence gaps
- **P2 dependency reproducibility:** Without a confirmed lockfile and `npm ci`, dependency resolution may vary across runs.
- **P2 CI supply-chain pinning:** Actions tags can move; immutable SHA pinning is stronger reproducibility/security.
- **P1 test-coverage distinction:** Passing source-marker/contract tests does not prove live backend, RLS, OTP, push, payment, or session isolation.
- **P2 blocked-origin visibility:** Fixture blocks external origins but specs do not visibly assert blocked-origin array is empty (previous checkpoint finding).

### Recommended improvements (not implemented)
1. Confirm and commit lockfile; use `npm ci` for CI reproducibility.
2. Pin third-party GitHub Actions to reviewed immutable SHAs, retaining version comments.
3. Add fixture teardown assertion for unexpected blocked origins.
4. Keep static contract tests clearly labeled and add controlled runtime integration tests separately.
5. Maintain report separation between source checks, local browser tests, live device/backend validation, and release evidence.

**Status:** Static workflow/source review only; CI not rerun, dependencies not installed, lockfile fetch 404 at reviewed ref, and no production code/config changes.


## Follow-up — CI Security, Artifact & Test Evidence Integrity Audit

Read-only review of `.github/workflows/friend-ride-regression.yml`.

### Static observations
- Workflow permissions explicitly set `contents: read` (least privilege for the reviewed workflow scope).
- Triggered on branch pushes, manual dispatch, and scheduled cron.
- Runs inline-script check and source-contract tests before dependency install/browser run.
- Starts a local static server and configures browser tests to localhost.
- Playwright report upload runs with `if: always()`, retention 7 days, and `if-no-files-found: ignore`; upload paths include `playwright-report/` and `test-results/`.
- Artifact upload can be silently skipped when no files are found, so absence of artifact is not made a hard failure by this configuration.
- No explicit workflow step writes a concise test evidence summary (test counts, pass/fail, environment, commit SHA) to the GitHub job summary in the reviewed file.
- Workflow references Actions by major tags and uses `npm install`; prior checkpoint documented lockfile fetch 404 at this branch.
- Attempt to fetch a guessed ARJUNA workflow filename returned an error; no conclusions drawn about other workflow files.

### Risks / evidence gaps
- **P2 artifact completeness:** Report upload is best-effort and missing files are ignored; a green run may lack a report artifact.
- **P2 evidence traceability:** No visible human-readable summary binding results to commit SHA, Node/browser versions, test counts, and artifact availability.
- **P2 retention:** 7-day artifact retention may be short for release evidence or later incident review.
- **P2 action/dependency reproducibility:** Major-tag action refs and non-lockfile-confirmed npm install remain previously noted risks.
- **Positive control:** Workflow-level permissions are restricted to read-only repository contents for the reviewed job.

### Recommendations (not implemented)
1. Add an explicit test-result summary step that records commit SHA, workflow run, Node/Playwright versions, executed test categories and counts, and whether artifacts exist.
2. Make report artifact missing condition explicit: fail or emit a visible warning rather than silently ignoring missing files.
3. Consider longer artifact retention for release candidate evidence and redact any sensitive traces/screenshots before upload.
4. Pin actions to immutable SHAs and use lockfile-backed `npm ci` after confirming the lockfile.
5. Keep evidence classification separate: static checks, local browser tests, backend integration, device tests, and release validation.

**Status:** Workflow source review only; CI was not rerun. No application code, workflow, SQL, or production settings changed in this checkpoint.


## Follow-up — Session A/B Test Coverage & Isolation Assertions Audit

**Reviewed:** `qa/phase-11-page-isolation.spec.js`, `qa/phase-11-registration-isolation.spec.js`, `qa/local-only-fixture.cjs`, and `qa/phase-11-security-isolation-contract.test.mjs` (read-only).

### Confirmed coverage
- Page-isolation spec checks exactly one active page, active page ARIA visibility, and inactive pages are hidden and inert.
- Registration spec checks Customer/Driver/Partner/Admin field visibility and disabled-state boundaries.
- Fixture injects a minimal Supabase stub and routes browser requests only to configured local origin; other origins are aborted and recorded in `page.__frBlockedOrigins`.
- Contract tests are source-string assertions for role/admin/driver approval, page/registration isolation, and test discovery/localhost safety.

### Coverage gaps / risk candidates
- **P1 test assurance gap:** The blocked-origin log is collected but reviewed specs do not assert it remains empty. External requests are blocked, but unintended dependency attempts can pass unnoticed.
- **P1 session isolation gap:** Reviewed specs do not simulate authenticated A/B users, logout, late responses, or concurrent authenticated contexts.
- **P2 contract-test brittleness:** Source-string assertions prove expected text markers exist, not actual authorization, behavior, or control flow.
- **P2 fixture diagnostic gap:** `new URL(process.env.FRIEND_RIDE_BASE_URL)` is evaluated at module load; missing/invalid environment may produce a raw URL parsing error rather than a fixture-specific diagnostic. Preflight exists, but this ordering should be confirmed by execution.
- **P2 isolation test breadth:** Page and registration tests cover a narrow set of behaviors; no observed test covers role-dashboard route destination, actual form submission, or backend enforcement.

### Recommended additions (not implemented)
1. Assert `page.__frBlockedOrigins` is empty after each browser test; fail with the blocked-origin list.
2. Add synthetic, in-memory A/B identity fixture with deterministic delayed responses; test logout, switch, stale response discard, concurrent request binding, invalid restore, and cleanup.
3. Keep static contract checks as guardrails but label them source-contract tests, not auth/security runtime validation.
4. Make fixture URL validation produce a clear actionable error and verify preflight-before-test ordering.
5. Add UI behavior tests for role-dashboard destination and form submission validation without real credentials/network.

**Status:** Static review only. No tests executed; no code, SQL, workflow, backend, or production settings changed.


## Follow-up — Session-Switch Race Scenario Prioritization

**Basis:** Previously reviewed static auth restore, logout/realtime, notification-loader async flow, and local-only QA harness. Prioritize tests by impact and determinism; no code implemented.

### Tier 0 — Fail-safe boundary checks (first)
1. **External request boundary:** after each test, assert `page.__frBlockedOrigins` is empty; report attempted origins.
2. **Single identity after logout:** logout clears synthetic identity, private notification/profile state, and listener/channel counters.
3. **Role gate:** customer cannot route to driver/partner/admin dashboard; admin route requires synthetic admin membership; driver approval status gates driver route.

### Tier 1 — Deterministic async race tests
4. **Late A profile response:** start A profile/admin checks, switch/logout, then resolve A; stale completion must not set identity or role.
5. **Notification late response:** start A notification query, switch to B, resolve B first then A; only B state remains.
6. **Token/register response after switch:** pending registration result from A must not mutate B identity or UI (mock only; no real FCM/network).
7. **Restore vs new login:** hold restore A pending, perform B login; restore A must not override B.

### Tier 2 — Multi-context and cleanup
8. **Parallel contexts:** independent synthetic A and B contexts remain isolated.
9. **Realtime cleanup:** logout/switch removes prior synthetic listeners and channels; no events from A appear in B.
10. **Invalid restore:** malformed/expired synthetic restore safely falls back to anonymous state.
11. **Role mismatch:** selected role differs from backend fixture role; reject/fallback without cross-dashboard display.

### Tier 3 — Behavior and evidence
12. Role-specific dashboard destination smoke checks.
13. Registration validation, submit-state and error handling checks using mocked responses.
14. CI result summary and artifact existence/traceability.

### Acceptance rule
- Tests must use deterministic in-memory synthetic identities and locally controlled deferred promises; external requests remain blocked.
- Do not use actual user sessions, OTP/SMS, Firebase/Supabase production endpoints, payments, GPS, customer records, or real KYC photos.
- Runtime test claims are permitted only after tests actually execute and results/artifacts are captured.

**Checkpoint status:** Scenario prioritization documented. No tests or application code changed; CI not rerun; backend/production untouched.


## Follow-up — Session Race Matrix & Acceptance Criteria

### Deterministic race matrix (proposed)
| ID | Setup / event order | Expected invariant | Severity if failed |
|---|---|---|---|
| RACE-01 | Start A profile fetch → logout → resolve A | Anonymous state remains; A result ignored | P1 |
| RACE-02 | Start A notification fetch → login B → resolve B → resolve A | Only B notifications visible | P1 |
| RACE-03 | Restore A pending → login B → resolve restore A | B identity/role remains authoritative | P1 |
| RACE-04 | A admin-membership query pending → switch B → resolve A admin | A cannot authorize or route current session | P1 |
| RACE-05 | A token registration pending → switch B → resolve A registration | B identity/UI unchanged; no cross-binding | P1 |
| RACE-06 | A realtime event after logout/switch | Event ignored; old channel cleanup verified | P1 |
| RACE-07 | Two isolated contexts A and B operate concurrently | State and mocked data remain context-bound | P1 |
| RACE-08 | Invalid restore payload | Safe anonymous fallback; no privileged route | P1 |
| RACE-09 | Role mismatch between selection and synthetic account | Reject route/role mismatch | P1 |
| RACE-10 | Fixture triggers blocked external request | Test fails with origin diagnostic | P1 harness assurance |

### Acceptance criteria for any future implementation
- Every test uses synthetic IDs only; no real tokens, accounts, PII or production endpoints.
- Delayed requests use controllable deferred promises and event order is explicit; no arbitrary sleeps for race timing.
- On session generation/identity change, stale completion must be ignored and must not alter user, profile, role, notification rows, route, or private UI.
- A and B data never coexist in one user-scoped view.
- Logout clears user-scoped state and removes/invalidates subscriptions; later A events are ignored.
- Parallel contexts are independently scoped and deterministic.
- Any external-origin attempt is a test failure, even if the fixture successfully blocks it.
- Each test produces a named pass/fail result; runtime evidence records commit SHA and test runner/browser versions.

### Execution boundary
This is a planning/acceptance checkpoint only. Tests are not authored or run here; no app code, SQL, workflow, Firebase, Supabase, or production configuration changed.


## Follow-up — QA Test Implementation Readiness & Coverage Gap Audit

**Reviewed at branch ref:** `arjuna-x/phase-7-ai-intelligence-safety` (read-only)

### Confirmed test entry points and safety controls
- `package.json` exposes default `npm test` as local preflight followed by Playwright; separate scripts exist for Node unit tests, Vitest core tests, TypeScript type-check, runtime build, and core type-check.
- Reviewed CI workflow executes inline JS checker, security/isolation Node contract file, then `npm install`, Chromium install, local static server, and default `npm test`.
- Playwright configuration restricts test discovery to the two Phase 11 browser specs, uses local URL validation, retries once, emits list + HTML report, retains trace on failure, and blocks service workers.
- Preflight checks explicit local URL, manual redirects, HTTP success, HTML content-type, and 4-second timeout.

### Coverage / readiness gaps
- **P1 suite inclusion gap:** Separate scripts `test:unit`, `test:core`, `typecheck`, and `typecheck:core` are not visibly invoked by the reviewed default CI workflow. Their current status/coverage cannot be inferred.
- **P1 session/race coverage gap:** Session A/B, stale response, restore/login race, notification race, token registration race, and realtime cleanup remain proposed; no reviewed executable spec currently covers them.
- **P2 test discovery:** Playwright intentionally discovers only two named specs; additional coverage requires updating `testMatch` or adding files that match the allowed pattern.
- **P2 runtime build evidence:** `build:runtime` exists as a package script but was not observed in reviewed CI workflow.
- **P2 branch-source caution:** GitHub search results showed a package.json from a different commit/ref than this reviewed branch fetch. Search snippets are not treated as branch-current evidence; conclusions here are based on fetched branch files only.

### Suggested CI order (not implemented)
1. Lockfile/reproducibility prerequisite; use `npm ci` only after lockfile presence is confirmed.
2. Inline JS checker and source-contract checks.
3. `npm run test:unit` and `npm run test:core` when test files and dependencies are confirmed.
4. `npm run typecheck` and `npm run typecheck:core`.
5. `npm run build:runtime` followed by generated-artifact consistency validation.
6. Local-only Playwright browser suite and mandatory blocked-origin assertions.
7. Upload evidence and write commit/test/environment summary.

**Checkpoint:** Readiness/gap audit documented only. No code, workflow, SQL, tests, dependency installation, CI run, or backend/production changes.


## Follow-up — CI Coverage & Test Suite Integration Audit

**Reviewed:** branch-fetched `.github/workflows/friend-ride-regression.yml` and `package.json`.

### Confirmed CI path
- Inline JS check.
- Node source-contract test: `qa/phase-11-security-isolation-contract.test.mjs`.
- `npm install` (lockfile still not confirmed at reviewed ref).
- Chromium installation.
- Local static server start and readiness polling.
- `npm test` runs local preflight then Playwright.
- Playwright HTML/report artifacts upload always attempted, but missing artifacts are ignored; 7-day retention.

### Package scripts not visibly integrated in this workflow
- `test:unit` — Node test glob `tests/*.test.cjs`.
- `test:core` — Vitest.
- `typecheck` — standalone TypeScript check.
- `typecheck:core` — tsconfig project check.
- `build:runtime` — runtime JS build.

Their existence is confirmed in branch-fetched package.json; whether matching test files exist and whether these scripts pass is **not confirmed**. GitHub search returned snippets referencing a different commit SHA than the branch fetch, so those snippets were excluded as current branch evidence.

### Integration gap classification
- **P1:** Auth/session race tests not included in current Playwright testMatch and not implemented/verified.
- **P2:** Separate unit/core/typecheck/build scripts are not visible in the reviewed CI workflow.
- **P2:** CI report upload silently tolerates missing report files.
- **P2:** CI uses `npm install`; lockfile-backed reproducibility is unresolved.
- **P2:** Evidence summary with commit/run/environment and test counts is not visible in reviewed workflow.

### Recommended next change (proposal only)
Extend the workflow with a staged QA pipeline after confirming test files and lockfile:
1. Inline JS + security contracts.
2. Node unit + Vitest core tests.
3. Typecheck + runtime build validation.
4. Local-only Playwright regression including session/race coverage.
5. Mandatory blocked-origin empty assertion.
6. Summary + artifacts with explicit missing-file behavior and commit/run metadata.

**Status:** Audit documentation only. No workflow/package/test changes, dependency install, SQL, or CI execution performed.


## Follow-up — Dependency & Lockfile Reproducibility Audit

**Reviewed:** branch-current `package.json`, `.github/workflows/friend-ride-regression.yml`, and direct repository-path checks for npm lockfiles/configuration.

### Confirmed
- `package.json` defines ranged dependencies: `@playwright/test ^1.56.0`, `vitest ^3.2.4`; TypeScript and Node types are exact versions.
- CI runs `npm install`, not `npm ci`.
- Direct branch-path fetches returned 404 for `package-lock.json`, `npm-shrinkwrap.json`, `yarn.lock`, `pnpm-lock.yaml`, `.npmrc`, and `.github/dependabot.yml` at the reviewed branch. This establishes that these exact paths were not found; it does not rule out alternate lockfile locations or dependency automation elsewhere.
- Workflow uses Node 22 via setup-node and installs Chromium using Playwright.

### Risks / gaps
- **P2 reproducibility:** No lockfile at the checked paths was confirmed; npm resolution may change between CI runs.
- **P2 dependency review:** No `.npmrc` or Dependabot config was found at the checked paths; repository-wide dependency update/security policy remains unverified.
- **P2 supply-chain stability:** Ranged npm dependencies and major-tag GitHub Actions references are not fully immutable.
- **P1 evidence boundary:** This was static repository review; no dependency installation, vulnerability scan, build, test, or CI run was performed.

### Recommendations (not implemented)
1. Generate and commit the npm lockfile using the project’s intended npm version.
2. Change CI installation to `npm ci` once lockfile is committed and validated.
3. Consider pinning Actions to immutable SHAs and retaining readable version comments.
4. Add dependency update/security scanning policy and review cadence.
5. Record Node/npm versions and lockfile hash in CI evidence.

**Status:** Static audit only. No package, workflow, lockfile, config, application, SQL, backend, or production changes; no tests/CI run.


## Follow-up — CI Environment & Version Consistency Audit

**Reviewed:** branch-current regression workflow, `package.json`, `playwright.config.cjs`, local QA preflight, and inline-JS checker.

### Confirmed
- CI explicitly selects Node 22 using `actions/setup-node@v4`; npm version is not explicitly selected or recorded in the workflow.
- Package scripts define Playwright dependency range `^1.56.0`; the workflow installs Chromium through `npx playwright install --with-deps chromium`, so the browser is resolved from the installed Playwright package.
- Playwright requires an explicit `FRIEND_RIDE_BASE_URL` and restricts it to localhost/loopback. Service workers are blocked; hosted/live fallback is denied.
- Local preflight checks the same loopback boundary, rejects redirects, requires HTTP success and HTML content type, and uses a 4-second timeout.
- Inline JavaScript checker parses script blocks and checks source markers; it is not a runtime integration test.
- Workflow has a 15-minute job timeout. CI does not visibly log Node/npm/Playwright/browser versions as a structured evidence summary.

### Consistency / evidence gaps
- **P2 npm environment:** npm version is not pinned or reported; dependency install behavior may vary with runner image updates.
- **P2 browser traceability:** Browser installation is tied to Playwright package resolution, but version details are not recorded in the workflow summary.
- **P2 runner image:** `ubuntu-latest` is a moving runner image; exact image/tool versions are not captured.
- **Positive control:** Explicit local-only target enforcement and preflight are strong safety boundaries in reviewed config.
- **P1 runtime evidence:** This is static configuration review only; no CI run or actual version capture occurred.

### Recommendations (not implemented)
1. Add a CI evidence step recording commit SHA, Node version, npm version, Playwright version, browser version, runner OS/image context, and test summary.
2. Pin/standardize npm version if project reproducibility requirements justify it.
3. Pair lockfile-backed installation with `npm ci` after lockfile is committed.
4. Keep local-only preflight and Playwright host guard; add test assertions for zero unexpected blocked-origin attempts.
5. Clearly separate source checks, browser tests, backend/device tests, and release evidence in the CI summary.

**Status:** Static audit only. No workflow, package, app, SQL, backend, Firebase, Supabase, or production changes; no dependencies installed and no tests/CI run.
