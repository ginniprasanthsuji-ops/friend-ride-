# Notification event catalog — Integration 1

The isolated branch now contains:
- `integrations/notifications/notification-provider.js`: permission-aware local notifications and push subscription lifecycle helpers.
- `integrations/notifications/notification-events.js`: event templates/recipient-role mapping and a local dispatcher that requires explicit opt-in.
- Tests for provider behavior and event mapping.

## Event catalog (mapping only; not wired to live business events)

| Event | Recipient role(s) |
|---|---|
| ride.requested | driver |
| ride.accepted | customer |
| ride.started | customer |
| ride.completed | customer, driver |
| delivery.assigned | customer, driver |
| delivery.picked_up | customer |
| delivery.completed | customer, driver |
| order.received | customer, partner |
| order.accepted | customer |
| order.ready | customer, driver |
| order.completed | customer, partner |
| partner.approved / partner.rejected | partner |
| admin.new_registration | admin |
| admin.complaint | admin |

These recipient mappings are templates, not authorization logic. Actual user IDs and event payloads must be resolved by trusted backend code, and sensitive details must not be included in push payloads.

## Verification
- Notification provider tests: 4
- Notification event catalog tests: 4
- Local isolated Node test run: 8/8 passing.
- CI workflow: `.github/workflows/integration-1-notification-tests.yml` added; GitHub Actions execution status is not yet confirmed.

## Next backend phase
1. Inspect existing Supabase schema before creating any subscription table (avoid duplicate/conflicting tables).
2. Add an ownership-protected subscription table/RLS migration only after schema review.
3. Implement VAPID sender in a Supabase Edge Function with private key in Supabase secrets.
4. Add subscription registration/removal UI and user preference.
5. Connect trusted backend business events to recipient resolution and push dispatch.
6. Test Android foreground/background/closed app and permission denial.
