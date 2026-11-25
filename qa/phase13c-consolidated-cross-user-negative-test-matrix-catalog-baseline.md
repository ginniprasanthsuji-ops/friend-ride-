# Phase 13C — Consolidated Cross-User Negative-Test Matrix (Catalog Baseline)

Date: 2026-11-26
QA project: `pqsangtvietawkfgpgfu`
Branch: `arjuna-x/phase-13-feature-audit`
Catalog-only review. No runtime tests executed.

## Catalog policy baseline
- `profiles`: own-row insert/select/update policies; insert role limited to customer/driver/partner. Admin read policy only for driver profiles.
- `fr_driver_documents`: owner/admin read, owner insert pending, owner update pending with WITH CHECK requiring self ownership and pending status; admin review update.
- `fr_road_ride_guest_profiles`: driver_id must equal auth.uid. Own insert/select/update.
- `fr_road_rides`: authenticated SELECT allowed for live rows, own-driver rows, or passenger-participated rides. Public LIVE projection must be checked at API/client layer because row RLS does not redact columns.
- `fr_service_provider_applications`: own pending insert, own/admin read, admin update.
- `fr_service_providers`: approved providers, owner, or admin can read; admin manage policy.

## Consolidated negative-test matrix

| Area | Actor | Attempt | Expected security outcome | Status |
|---|---|---|---|---|
| Profile | User A | Read User B profile row | Deny | Runtime pending |
| Profile | User A | Change own role to admin | Deny/guard | Runtime pending |
| Profile | User A | Change driver/partner approval status | Deny/guard | Runtime pending |
| Driver documents | Driver A | Read/update Driver B document | Deny | Runtime pending |
| Driver documents | Driver A | Set status verified/rejected | Deny | Runtime pending |
| Driver documents | Driver A | Spoof reviewed_by/reviewed_at while pending | Verify policy/metadata protection | Runtime pending |
| Driver documents | Non-admin | Review another driver document | Deny | Runtime pending |
| Driver documents | Admin | Review document | Allow, with legitimate admin identity | Runtime pending |
| Guest profiles | Driver A | Access/update Driver B guest profile | Deny | Runtime pending |
| Guest profiles | Driver A | Insert row with driver_id B | Deny | Runtime pending |
| Road Ride | Unrelated authenticated user | Access non-live ride row | Deny unless participation/ownership | Runtime pending |
| Road Ride LIVE | Unrelated user | Inspect public LIVE fields | Only safe listing projection; no contacts/private fields | Runtime pending |
| Provider application | Applicant A | Read/update Applicant B application | Deny | Runtime pending |
| Provider application | Applicant A | Insert status approved | Deny; insert requires pending | Runtime pending |
| Service provider | Customer | Read unapproved provider details | Deny unless owner/admin | Runtime pending |
| Service provider | Provider owner | Change approval fields without admin | Deny/guard | Runtime pending |
| Storage | User A | Read User B photo path/object | Deny | Runtime pending |
| Storage | User A | Upload object under User B folder | Deny | Runtime pending |
| Storage | User A | Update object under User B folder | Deny | Runtime pending |
| Storage | User A | Delete own photo | Confirm intentional policy absence / expected behavior | Runtime pending |
| Shared Ride contacts | Confirmed passenger | Get assigned driver phone | Allow only ride/booking scoped | Runtime pending |
| Shared Ride contacts | Driver | Get booked passenger contact | Allow only matching confirmed booking | Runtime pending |
| Shared Ride contacts | Unrelated user/passenger | Get other passenger contact | Deny | Runtime pending |

## Test execution gate
Use test identities and QA-only data. Execute through app/API behavior with authenticated sessions. Do not use production accounts or real identity documents. Capture request, actor, result, and whether a policy error or application-layer denial occurred. For any successful unexpected access, stop and treat as a security finding before continuing.

## Evidence limitation
This matrix is derived from catalog policies and earlier ACL/storage reviews. It is a test plan, not proof of execution. No changes to SQL, policies, app, storage objects, or deployments were performed.
