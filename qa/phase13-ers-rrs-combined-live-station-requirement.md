# FRIEND RIDE — Combined ERS + RRS Live/Ongoing Ride Station Requirement

Branch: arjuna-x/phase-13-feature-audit
Scope: QA requirement only; no production change.

## Customer requirement
Customer must see ERS and RRS ride/booking activity in one unified Live / Ongoing Ride Station, with filters:
- ALL: ERS registered-driver rides + RRS guest-bike rides
- ERS: registered, approved FRIEND RIDE drivers and their supported vehicles
- RRS: guest/unregistered bike drivers and RRS bookings only

## ERS source
- Registered, authenticated, approved Driver profiles.
- Vehicle details from registered Driver profile.
- Online/live availability and current status from backend.
- Customer chooses a listed eligible vehicle/driver.
- Payment choice Cash or UPI (persisted only when backend integration exists).
- ERS lifecycle: available/listed -> customer request -> driver accepted -> arriving/pickup -> ongoing -> completed/cancelled.

## RRS source
- Unregistered/guest bike drivers publishing rides through RRS.
- Guest profile/photo/bike registration/route information follows RRS guest requirements and privacy rules.
- RRS is bike-only for guest drivers.
- Customer can view eligible guest rides and book according to RRS booking rules.
- RRS lifecycle: published/live -> booking pending/confirmed -> booked -> pickup/ongoing -> completed/cancelled (exact states must align with existing backend).

## Unified station display
Each card/row must show an explicit source label: ERS Registered or RRS Guest.
Show only backend-confirmed current records. Do not show static/demo records as live.
Customer can filter by All / ERS / RRS and see live status:
- Available
- Request/booking pending
- Accepted/confirmed
- Driver approaching/pickup
- Ongoing
- Completed
- Cancelled/expired (history/status only as appropriate)

## Privacy & access separation
- ERS uses registered/authenticated Customers and registered/approved Drivers only; no guest authentication.
- RRS guest drivers remain isolated to RRS guest workflows; no RRS guest driver/profile may be treated as an ERS registered Driver.
- Do not expose guest/registered driver phone or exact private location in public listing. Reveal necessary details only after permitted booking/match.
- Customers see their own requests/bookings and publicly eligible listings only.
- All live statuses and availability must be backend sourced and permission controlled.

## Implementation gate
1. Audit existing ERS ride and RRS guest ride/booking tables, statuses, RPCs and RLS.
2. Design combined listing RPC/view that returns source channel + safe fields and supports All/ERS/RRS filtering.
3. Do not blindly merge tables or alter existing lifecycle rules; keep source-specific booking/acceptance logic.
4. Implement QA-only integration and test ERS and RRS independently, then test combined station.
5. Record test evidence before marking pass. No production deployment without Phase 14 review and explicit user approval.

## Status
Requirement documented. Combined live station implementation and runtime testing pending.
