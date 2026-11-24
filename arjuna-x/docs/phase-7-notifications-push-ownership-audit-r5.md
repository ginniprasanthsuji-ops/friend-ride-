# Phase 7 — Notifications, Push Subscriptions & Ownership Security Audit (R5)

**Scope:** Static review of `index.html` notification feed, read-state actions, realtime subscriptions, browser push registration, and `service-worker.js`. Branch-only audit; no runtime/authenticated DB checks performed.

## Observed frontend paths

- Notification history reads `fr_ride_notifications` and `fr_app_notifications`, filtered by `user_id = currentUser.id`, newest first, capped at 50 each.
- Realtime INSERT/UPDATE channels filter by the current UID for both tables. Frontend also rejects ingested rows whose `user_id` does not match the current UID.
- Mark-read updates `is_read` and `read_at`, with both row ID and current UID filters.
- Push registration validates browser support, login, permission and subscription keys; stores `user_id`, endpoint, p256dh, auth key, user-agent, active flag and timestamp using upsert conflict target `endpoint`.
- Existing-subscription deactivation update is filtered by endpoint and UID, but the returned error is not checked before proceeding to unsubscribe.
- No direct frontend INSERT to either notification table was found in this reviewed `index.html` source.
- Service worker supports both FCM background messages and custom Web Push payloads. Notification click handling constructs a URL from payload `data.url` and navigates a matched client or opens a new window.

## Security review / backend requirements

1. **Notification ownership and privacy:** RLS must enforce `user_id = auth.uid()` on SELECT, UPDATE and Realtime visibility for both notification tables. Client-side filters are not a security boundary.
2. **Read-state mutation:** UPDATE policies must permit only the recipient and restrict mutable columns to read state/timestamp; users must not change notification content, recipient, ride/order references or privileged fields.
3. **Push endpoint ownership:** `fr_push_subscriptions` policies must bind `user_id` to `auth.uid()`, prevent endpoint takeover across accounts, and restrict allowed columns. The `ON CONFLICT endpoint` upsert is especially important to test against a row already owned by a different UID.
4. **Deactivation error handling:** Frontend currently ignores the error returned by the deactivation UPDATE. Audit/QA should verify failed deactivation cannot create a false state; a UI code fix is not included in this audit.
5. **Push sending:** VAPID private key must remain server-side in Edge Function secrets. Push sender must query only active subscriptions for the intended recipient and validate recipient/notification ownership before sending.
6. **Service-worker click target:** payload URL should be validated/allowlisted to same-origin app routes before navigation/opening; avoid arbitrary external URL navigation from untrusted payload data.
7. **Push payload privacy:** notification title/body must not expose sensitive personal, KYC, payment, precise location, or other private content on lock-screen notifications unless explicitly appropriate.
8. **Realtime:** verify Realtime publication/RLS prevents cross-user delivery and that channel reconnect/login/logout changes do not retain prior UID data.

## QA matrix (must run with isolated fake accounts in staging)

- Account A can read A's ride/app notification rows; Account B cannot read A rows, including direct API requests.
- A cannot UPDATE B's read state; B cannot UPDATE A's notification rows or protected columns.
- Realtime INSERT/UPDATE from B is never received by A; switching accounts clears prior notification feed and unread badge.
- Push endpoint owned by A cannot be claimed, overwritten, reactivated, or deactivated by B.
- Push subscribe, re-subscribe after VAPID-key rotation, duplicate endpoint, permission denied, logged-out attempt, offline retry, and logout cleanup paths.
- Failed deactivation update is surfaced/handled without falsely reporting success.
- Edge Function sends only to authorized recipient active subscriptions; invalid/expired endpoint is retired safely.
- Service-worker custom payload, FCM payload, malformed payload, duplicate/tag behavior, click routing for allowed same-origin route, and rejected external URL.
- Lock-screen content review for privacy; ensure no secrets or sensitive fields in payload.
- Notification read action works across both source tables; realtime updates change unread badge correctly.
- Reconnect/visibility refresh and capped history (50) do not duplicate feed items.

## Result

**Static audit complete; backend security and runtime tests remain unverified.** No Supabase schema, RLS, storage, auth, production, or application code was changed by this R5 audit.
