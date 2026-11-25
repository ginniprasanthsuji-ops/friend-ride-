# Phase 13 — ERS Engage Station QA & Backend Integration Specification

Branch: `arjuna-x/phase-13-feature-audit`
Scope: QA branch only. Production/Main untouched.

## ERS Customer requirements
- [ ] Customer must be authenticated (no guest/anonymous booking).
- [ ] Pickup and destination are required.
- [ ] Show only vehicles currently available and eligible for ERS.
- [ ] Supported vehicle categories: Bike, Car, Auto (categories configurable only if existing backend supports them).
- [ ] Customer can filter categories and choose one specific available vehicle.
- [ ] Listing fields: driver display name, verified rating (if available), vehicle category, vehicle number masked as appropriate, distance, ETA, fare estimate.
- [ ] Listing data must be backend sourced; demo UI data must never be presented as live.
- [ ] Cash and UPI payment choices available.
- [ ] Selected vehicle, payment choice, pickup/destination, fare quote, and request timestamp saved with request.
- [ ] Confirm creates a ride request and prevents accidental duplicate submissions.
- [ ] Driver can accept/reject; vehicle availability is revalidated atomically before accepting.
- [ ] Customer sees request state: searching, accepted, driver arriving, in progress, completed, cancelled.
- [ ] Cancel rules and refund/payment rules must follow existing approved backend workflow; do not invent wallet credits.
- [ ] Customer can view ERS ride history/status.

## Privacy / access
- [ ] ERS uses registered Customer and registered Driver profiles only.
- [ ] Driver/vehicle identity comes from approved registered profiles.
- [ ] RRS guest driver profiles and guest auth are not reused in ERS.
- [ ] Customer can see only own ERS requests.
- [ ] Driver can see only requests assigned/eligible to them.
- [ ] Admin-only controls protected by server-side authorization.
- [ ] Location and contact information shown only as needed for an active matched ride.
- [ ] No secret keys in client code.

## UI prototype QA
- [ ] Vehicle category filters work.
- [ ] Choose selection updates summary.
- [ ] Cash/UPI toggles and remains reflected in summary.
- [ ] Destination input updates summary.
- [ ] Confirm button enabled only after a vehicle is selected.
- [ ] Demo-only notice remains visible until real backend integration.
- [ ] Responsive/mobile layout checked.

## Integration gate
Before writing ERS SQL or integrating into the main dashboard:
1. Inspect existing ride tables, status enums, RLS, RPCs, and payment fields in QA Supabase.
2. Reuse compatible tables/workflows if possible; do not duplicate ride schema blindly.
3. Define a narrowly scoped migration and RLS policies.
4. Add server-side atomic vehicle availability/assignment and duplicate-request guard.
5. Add browser tests for customer/driver/admin permissions and ride lifecycle.
6. Record test evidence. Do not mark items passed without execution.

## Status
Specification/checklist only. Backend integration and runtime tests are pending.
