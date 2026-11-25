# FRIEND RIDE — Train Journey Rescue / Alternative Route Workflow
Date: 2026-11-25
Status: Feature requirement added after workflow research; NOT implemented or live-data verified.

## Goal
When a direct train route is unavailable, waitlisted, or inconvenient, show ranked alternative journey strategies. This is a journey-planning module, not ticket issuance.

## Search inputs
- From station
- To station
- Journey date
- Class (SL, 3A, 2A, etc.)
- Optional quota/preferences only if supported by a verified data source

## Search sequence (strategies)
1. Direct train options
2. Same train, earlier boarding station (availability for the segment must be checked)
3. Same train, later destination station (availability for the segment must be checked)
4. Split same-train journey into two bookable segments, where supported and rules allow
5. Connecting trains via intermediate junction(s), with transfer time
6. Nearby station alternatives only when station distance and routing are verified

## Alternative result card
- Route and junction sequence
- Each leg: train number/name, stations, departure/arrival date/time
- Transfer station and transfer duration
- Total journey duration
- Fare estimate (label as estimate unless verified)
- Availability status with timestamp/source
- Risk notes: tight transfer, overnight wait, separate tickets/PNRs, missed-connection risk
- Action: open official/authorized booking channel for each leg; do not claim one-click combined booking unless an authorized booking integration exists

## Ranking
Rank confirmed/verified availability first, then fewer transfers, shorter transfer wait, total duration and fare. Do not invent availability, seats, confirmation probability, fares, or live status.

## Safety / compliance
- No fake “100% confirmed” badges.
- No unsupported prediction percentages.
- Live availability, schedules, fares, PNR, and train running status require a lawful/authorized data source and must be timestamped.
- If no live source is connected, label results “route suggestions—verify availability on official booking channel.”
- Booking and payment remain with IRCTC/authorized providers unless a compliant booking integration is separately approved.
- Explain that separate tickets can carry missed-connection/refund risks; avoid promising refunds.

## UI flow
Search form → Direct trains → Alternative strategies → ranked route cards → leg details and transfer warning → official/authorized booking links → saved trip/PNR tracking (only if supported).

## Scope
Add as a proposed Travel/Train module requirement for FRIEND RIDE. Implementation is deferred until data source/API availability, authorization, booking handoff, and UI integration are reviewed. No production database or app runtime changes in this step.
