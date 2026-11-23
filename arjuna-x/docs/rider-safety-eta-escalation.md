# Rider Safety: ETA Watch & Emergency Contact Escalation

## Feature
Add a visible **Rider Safety** control during an active ride. The rider can add/verify an emergency contact (name, phone, relationship) and set a safety ETA/check-in target. If the rider does not confirm safe arrival by the target, the app begins an escalation flow.

## Rider flow
1. Before/while a ride starts, Rider Safety is available from the active-ride screen.
2. Rider enters or confirms an emergency contact and grants required call/SMS/location permissions.
3. Show the expected arrival time, safety timer, and a clear **I'm Safe / Extend ETA** action.
4. At ETA, if safe-arrival has not been confirmed, send an alert with a configurable grace countdown (default 2 minutes, adjustable) and prominent **Cancel / I'm Safe** button.
5. If countdown expires, initiate the configured escalation: attempt contact call where supported and permitted; otherwise open the phone dialer with the number prefilled, and send an emergency SMS with trip details/location where permission and messaging integration allow. Never silently claim a call/SMS was placed if OS/app did not confirm it.
6. Keep a persistent **SOS** button during the ride. Rider can trigger immediate escalation without waiting for ETA.

## Consent and safety requirements
- Explicit opt-in and clear explanation before enabling automatic escalation; confirm contact phone number.
- Do not activate automatically by default. Rider can disable or change contact at any time, and cancel a countdown.
- Use trip ETA plus configurable grace window; allow rider to extend ETA.
- If GPS is unavailable, stale, or permissions are revoked, show degraded status and do not invent location.
- Protect emergency contact and trip-location data; only share on rider-triggered SOS or the opted-in timeout escalation.
- Log timestamps, trigger reason, attempted channels and confirmed outcomes; do not store unnecessary sensitive data.
- Prevent repeated call/SMS loops; one escalation per trip unless rider explicitly triggers SOS again.
- Test false alarms, ETA changes, app backgrounding, low connectivity, battery saver, permission denial, and device/platform restrictions.

## Implementation notes
- Web/PWA cannot guarantee an automatic phone call while backgrounded or on all devices. Native Android call capability requires platform permissions/intent handling and may still require user interaction depending on OS policy/device. Design a safe fallback: notification + dialer handoff, and SMS via approved integration.
- Build the countdown/escalation service so server-side trip state and notification delivery can support background reliability; client-only timers are not sufficient.
- UI should include: Rider Safety button, emergency contact card, ETA/check-in timer, I'm Safe/Extend ETA, countdown alert, Cancel, and SOS.

## Acceptance checklist
- [ ] Rider Safety entry point appears only during active ride.
- [ ] Emergency contact can be saved/verified and edited.
- [ ] Rider explicitly enables timeout escalation and sees exact behavior.
- [ ] ETA/check-in timer and grace countdown work with ride state updates.
- [ ] Safe confirmation or extension cancels escalation.
- [ ] Timeout triggers one escalation attempt and reports real outcome.
- [ ] Immediate SOS uses same validated contact and location sharing.
- [ ] Permission/network/platform fallback is clear and tested.
- [ ] Emergency data is access-controlled and retention-limited.
