# Phase 7 — External Provider Runtime Restriction Review

Date: 2026-11-23. Static source review and QA Edge Function inventory only.

## Evidence from source
- Frontend OTP code calls `/functions/v1/Sms-otp` and labels integration APITXT OTP. QA active Edge Function inventory does NOT list `Sms-otp`. Therefore OTP endpoint/function presence in QA is unverified/missing from current inventory; auth flow runtime testing is blocked until reconciled.
- Map UI loads Leaflet from unpkg.com and uses OpenStreetMap tile server `tile.openstreetmap.org`.
- GPS reverse geocoding uses Nominatim `nominatim.openstreetmap.org/reverse`; address search uses Nominatim search. This is an external geocoding provider and conflicts with the approved external maps/GPS API restriction.
- Cashfree source strings are only sample/disabled messaging in inspected snippets; UI says live billing requires secure order + webhook backend and payment not started. Do not treat Cashfree processing as active evidence.
- WhatsApp URLs (`wa.me`) are manual contact/share links, not API automation. Still external user-action links and need policy/UX review.
- Zoom OAuth functions were confirmed active in prior checkpoint; automated Zoom integration is restricted.
- FCM notification dispatch function is active; source uses Google OAuth/Firebase Messaging endpoints and service-account secret variables. External push delivery conflicts with restricted provider list unless approved exception.

## Restrictions status
| Provider | Evidence | Status |
|---|---|---|
| APITXT SMS | Client references Sms-otp; QA function inventory missing endpoint | Unverified/mismatch; restricted |
| Nominatim geocoding | Reverse and search calls in frontend | Active external provider reference; restricted |
| OSM tile server | Leaflet tileLayer URLs | Active external tile usage; restriction review |
| Zoom | Active Edge Functions calling Zoom API | Active restricted integration |
| FCM | Active notification dispatch function using Google OAuth/FCM | Active restricted integration |
| Cashfree | Sample/disabled UI copy in snippets | Not active processing evidence |
| WhatsApp | Manual wa.me links | Manual outbound links, no API evidence |

## Next steps
- Reconcile SMS-OTP function deployment/source; don't create or deploy automatically.
- Propose graceful fallback/manual location input for geocoding and map tiles if providers remain disallowed; preserve GPS device geolocation (browser permission) separately from external reverse geocoding.
- Prepare QA-only de-scope proposal and regression test plan for restricted Zoom/FCM/Nominatim/OSM integration references. No deactivation/removal without approval because it can affect user-facing workflows.

## Safety
No Edge Function changes, SQL, storage, secrets, data writes, deployment, merge, or production access.
