# FRIEND RIDE — IRCTC Booking Handoff / Prefill UX
Date: 2026-11-25
Status: Requirement added; implementation not yet built.

## User request
After a user selects a train/connecting alternative in FRIEND RIDE, make the chosen itinerary details easy to carry into IRCTC booking.

## Handoff behavior
1. User selects an alternative route in FRIEND RIDE.
2. Show a review screen with the selected itinerary and all legs:
   - From/To station and station code
   - Date
   - Train number/name
   - Leg departure/arrival
   - Selected class
   - Junction and transfer duration
3. Provide a **Copy Journey Details** action that copies a clean text summary to clipboard.
4. Provide **Open IRCTC** action to open the official IRCTC booking site/app entry point.
5. If an authorized and supported official deep link/prefill mechanism is available, use it to populate the supported fields only. Otherwise do NOT claim auto-prefill: use clipboard summary and open IRCTC, with the user manually entering/searching fields.
6. Keep the copied summary visible so it can be re-copied if clipboard access fails.

## Clipboard summary format
Journey: <From station (code)> → <To station (code)>
Date: <journey date>
Class: <selected class>
Selected alternative: <route>
Leg 1: <train number/name> | <from> <departure> → <to> <arrival>
Transfer: <junction> | <duration>
Leg 2: <train number/name> | <from> <departure> → <to> <arrival>
(Repeat for additional legs.)

## Confirmed scope
FRIEND RIDE Ticket Helper is a lightweight journey discovery tool only. It displays direct train options, alternatives, and connecting legs (Leg 1 / Leg 2). After selection, the customer is redirected to the official IRCTC entry point and completes the search/booking independently. No IRCTC partnership, API, prefill integration, login handling, or booking automation is planned. The copied itinerary is a convenience summary for manual use.

## Guardrails
- Never use undocumented/private IRCTC URLs or automate login, captcha, passenger details, payment, or booking.
- Do not send passenger personal data or credentials to IRCTC through an unsupported integration.
- Validate official prefill/deep-link support before claiming fields will auto-populate.
- No ticket booking inside FRIEND RIDE unless a compliant authorized booking integration is separately reviewed and approved.
- Availability and fares are live only if backed by a verified authorized source; timestamp and source them.

## UI
Route card → Select route → Review itinerary → Copy details → Open IRCTC.
Implementation and QA are pending.
