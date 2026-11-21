# Internal Web Push Sender — Integration Branch

## Function
`supabase/functions/fr-push-send/index.ts`

This is an internal-only sender implementation. It is **not deployed** to the production Supabase project.

### Security model
- No browser CORS access; endpoint is intended for trusted backend-to-backend requests.
- Requires `x-fr-push-secret` matching `FR_PUSH_INTERNAL_SECRET`.
- Secret comparison is length-checked and constant-time byte comparison.
- Supabase secret API key and VAPID private key are read only from server environment.
- Recipient user IDs are validated and capped at 100 per request.
- Payload title/body length bounded; payloads avoid full ride/order personal details.
- Queries active `fr_push_subscriptions` for requested users.
- On delivery success, updates `last_success_at`.
- On Web Push 404/410, marks subscription inactive.
- Logs only status code and subscription row ID, not endpoints or key material.

### Required secrets (not set by this branch)
- `FR_PUSH_INTERNAL_SECRET`
- `FR_VAPID_PUBLIC_KEY`
- `FR_VAPID_PRIVATE_KEY`
- `FR_VAPID_SUBJECT` (optional; defaults to support mailto)
- Supabase default secret key is provided by Edge Function environment as `SUPABASE_SECRET_KEYS`.

### Request shape
```json
{
  "user_ids": ["uuid"],
  "notification": {
    "title": "FRIEND RIDE",
    "body": "Ride status updated",
    "url": "/",
    "tag": "ride.accepted"
  }
}
```

This endpoint must be invoked only by trusted server-side event processing. It is not a user-facing send endpoint. It does not create an in-app notification row and does not validate business-event eligibility; those responsibilities belong in the eventual event orchestrator.

## Current production schema observations (read-only)
- `fr_push_subscriptions` exists and is RLS-enabled; 34 rows, 15 active, 7 with recorded successful delivery.
- `fr_app_notifications` exists and is RLS-enabled; currently 0 rows.
- `fr_ride_notifications` exists and is RLS-enabled; currently 3 rows.
- No dedicated Web Push sender Edge Function was listed during the read-only function inventory.

No production database, function, secrets, or deployment was changed.
