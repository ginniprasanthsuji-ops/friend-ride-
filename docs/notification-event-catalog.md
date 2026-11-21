# FRIEND RIDE Notification Preservation & Integration

## Non-negotiable preservation
- Existing notification UI, Recent Activity inbox, unread badge, toast, speech/voice, vibration, alert tones, and notification preview controls must remain unchanged.
- Do not replace or simplify existing event ingestion/realtime code in `index.html`.
- Existing Home, Work/Task/Gigger, Market/Local Store, Ride, Order/Food, Delivery/Parcel, Partner, Admin, and complaint notifications must continue.
- New integration is additive and isolated on `integration/1-core-architecture`.
- Existing service-worker notification-click/navigation behavior remains unchanged.

## Existing notification behavior audited (read-only)
`index.html` already contains:
- Notification enable control and permission status.
- Order / Ride / Customer alert tone previews.
- Tone playback, speech alerts, vibration, toast, browser Notification.
- Role-based alert classification (Partner order, Driver ride, Customer updates).
- Recent notification feed, unread badge, mark-as-read, Supabase Realtime.
- Reads from `fr_ride_notifications` and `fr_app_notifications`.

`sw.js` already contains:
- Push handler -> showNotification.
- Notification click -> navigate/focus existing app or open app.
- Existing behavior is unchanged.

## Existing Supabase notification tables (production read-only inspection)
- `fr_push_subscriptions`: 34 records; 15 active; 7 with last-success record.
- `fr_app_notifications`: currently 0 rows at time of audit.
- `fr_ride_notifications`: 3 rows at time of audit.
- RLS is enabled on inspected notification tables.
- Existing subscriptions and notification tables are reused; do not create duplicates without schema review.

## Event catalog additions
The additive catalog includes templates/role mapping for:
- Rides and delivery
- Food/shop order
- Market/local-store order
- Home service requested/assigned
- Work/Task assigned/completed
- Partner approval/rejection
- Admin registration and complaint

Catalog is mapping only; existing live notification UI/event flow is not replaced or wired over.

## VAPID and Supabase
The internal sender reads all sensitive values from Supabase Edge Function environment/secrets:
- `FR_PUSH_INTERNAL_SECRET`
- `FR_VAPID_PUBLIC_KEY`
- `FR_VAPID_PRIVATE_KEY`
- `FR_VAPID_SUBJECT` (optional)
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_URL`

VAPID private key and service-role key must remain in Supabase Edge Function secrets, never in `index.html`, public config, GitHub, or browser storage. This branch cannot set secrets through the available Supabase tool and has not deployed the function. No production secrets, functions, database, or deployments were changed.

## Regression guard
`tests/notification-preservation.test.cjs` checks existing notification UI, tone/voice/vibration markers, realtime table listeners, service-worker push and click behavior. These checks run in the notification CI workflow.

## Deployment gates
1. Configure secrets in Supabase securely.
2. Validate existing subscription table fields and RLS before sender integration.
3. Implement trusted server-side event/recipient mapping (never trust client-supplied recipient IDs).
4. Add user preference and subscription lifecycle integration.
5. Run Android WebView foreground/background/closed-app tests and full regression.
6. Only deploy/merge after tests pass and approval.
