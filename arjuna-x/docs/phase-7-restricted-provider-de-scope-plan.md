# Phase 7 — Restricted External Provider De-scope Plan (Proposal)

QA branch documentation only; no code changes applied.

## Required user restriction
No external paid APIs or integrations for external AI/model, voice, Zoom, DigiLocker, CIBIL/bureau, external NBFC/lender, payment gateway processing, SMS/OTP beyond approved existing, WhatsApp/calling automation APIs, or external maps/GPS API providers.

## Proposed safe UX direction (subject to user approval)
- OTP: reconcile existing Auth/OTP design; do not invent fallback authentication or weaken identity. If Sms-otp function is missing, show controlled “OTP service temporarily unavailable” and block auth until approved solution.
- Location: retain device/browser GPS permission and coordinates; allow user-entered pickup/drop address. Avoid Nominatim calls. Map rendering tiles are a separate external dependency; if forbidden, use simple pin/coordinate/address preview rather than external tile maps.
- Classroom: remove/disable Zoom API automation; preserve manually entered classroom URL workflow only if manual external links are permitted by the user.
- Notifications: retain in-app notification event UI/polling; disable/de-scope FCM external delivery only after verifying current function schedule/trigger and safe user experience. Do not leave unauthenticated dispatch route without secret protection.
- Payments: sample catalog/booking UI must clearly indicate no online payment processing. No Cashfree SDK/API/order/webhook calls unless approved.
- WhatsApp/call links: manual links are not automation APIs, but still require user approval/UX review; hide them if the policy forbids outbound service links.

## Regression matrix (before implementation)
1. Auth/OTP: missing-function handling, no fake OTP, no bypass.
2. Ride booking: manual address + GPS coordinate-only flow; pickup/drop validation.
3. Maps: restricted-provider mode gracefully renders non-map fallback and keeps ride state.
4. Classroom: teacher/student schedule/confirm, manual link only; Zoom integration absent.
5. Notifications: in-app delivery remains functional without FCM.
6. Payments: payment states cannot be falsely marked paid; sample copy clearly labels not live.
7. QA only: Playwright + manual role-based tests; synthetic data.

## Implementation gate
This plan requires explicit approval. Do not deactivate functions, modify source, or deploy merely based on this proposal. Keep changes on QA branch and run regression before any release.
