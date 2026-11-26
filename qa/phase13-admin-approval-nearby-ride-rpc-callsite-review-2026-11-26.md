# Phase 13 — Admin Approval and Nearby/Ride RPC Frontend Call-site Review (2026-11-26)

## Scope
QA branch frontend call-site review after targeted source search. No backend/SQL execution or production changes.

## Source
- `index.html` on `qa/phase8-13-data-integrity-2026-11-24` (fetched for this pass).
- Search queries for partner Admin RPC names, driver Admin review, nearby-driver RPC, `accept_ride`, storage policy names, and `fr_driver_documents`.

## Verified frontend call-sites
- Partner approval list: `loadPartnerApprovals()` invokes `fr_admin_list_partner_applications`, requires a signed-in user and selected Admin role in the frontend, then counts pending/approved/rejected/revoked states.
- Partner decision: `reviewPartner(id, decision)` confirms the action and invokes `fr_admin_review_partner` with partner ID and decision.
- Driver KYC review: `reviewDriverDocument(id, decision)` restricts frontend decision values to verified/rejected, checks current profile role for Admin, asks for optional note and confirmation, invokes `admin_review_driver_document`, and expects `true`.
- Nearby drivers: `refreshNearbyDrivers()` invokes `fr_customer_list_nearby_drivers` with pickup coordinates and 15 km radius, then client-filters online rows and distance.
- Ride acceptance: driver UI invokes `accept_ride` with ride ID, treats RPC error/false as failure, and continues to display customer details/tracking after acceptance.

## Unverified/backend gap
Targeted search did not surface SQL/migration definitions for the named partner review, driver document review, nearby-driver listing, or ride acceptance RPCs. Frontend Admin checks are not authorization boundaries. Server-side role checks, data filtering, storage access, atomic acceptance/race protection, and deployed RPC existence remain unverified. Search failure is not proof the deployed database lacks these definitions.

## Status
- Frontend call-site review: completed.
- SQL/RPC tests executed: 0.
- Live authenticated staging tests: 0.
- Production changes/deployments: 0.
- Fixes: 0.
