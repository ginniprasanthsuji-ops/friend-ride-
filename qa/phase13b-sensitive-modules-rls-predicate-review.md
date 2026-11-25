# Phase 13B — Sensitive Modules RLS Predicate Review (QA, Read-only)

Date: 2026-11-26
Project: QA Supabase `pqsangtvietawkfgpgfu`
Scope: Policy predicates for service, SOS, emergency contacts, driver documents, profiles, location tables, admin users, bank enquiries. Metadata only; no data rows accessed and no changes made.

## Policy findings
- `admin_users`: authenticated SELECT limited to own user_id.
- `driver_locations`: authenticated ALL policy scoped to driver_id=auth.uid(); online check requires own profile role=driver and driver_approval_status=approved.
- `fr_bank_enquiries`: authenticated INSERT requires user_id=auth.uid(), status='new', admin_note NULL; SELECT own/admin; UPDATE admin only.
- `fr_driver_documents`: INSERT own owner_id/driver_id and pending status; UPDATE own pending record with owner/driver identity checks; SELECT own/admin; admin review UPDATE.
- `fr_emergency_contacts`: authenticated ALL scoped to user_id=auth.uid().
- `fr_ride_sos`: authenticated INSERT sender_id=auth.uid(); SELECT own sender or admin.
- `fr_service_bookings`: customer INSERT requires own customer_id, pending status, payment_status not_due; SELECT customer/assigned provider/admin; admin UPDATE.
- `fr_service_categories`: active category SELECT for authenticated, admin management.
- `fr_service_provider_applications`: own provider_id INSERT pending; own/admin SELECT; admin UPDATE.
- `fr_service_providers`: approved providers, owner, or admin SELECT; admin ALL management.
- `fr_service_requests`: customer INSERT requested with provider_id NULL; SELECT customer/provider-owner/admin; admin UPDATE.
- `profiles`: INSERT own id with role allowlist customer/driver/partner; SELECT own; UPDATE own id; admin SELECT driver rows.
- `ride_live_locations`: INSERT/SELECT scoped to ride customer or driver participants and user identity; UPDATE requires own user_id and participant ride condition.

## Sensitive-column and ACL concern
Column grants catalog returned broad authenticated privileges for sensitive fields across selected modules, including profile fields such as Aadhaar/license, phone, UPI, payment identifiers, vehicle details and document paths; document storage paths/review fields; emergency-contact names/phones; location coordinates; and bank enquiry fields. This is a metadata observation, not proof of cross-user exposure. RLS predicates, helper functions, and column-grant pathways need runtime tests and a least-privilege review.

## Priority runtime validation
1. Profiles: non-owner reads of sensitive fields denied; owner access works; role/approval fields cannot be self-escalated; admin driver-review path scoped.
2. Driver documents: cross-owner SELECT/UPDATE denied; owner cannot change verification/reviewer fields; admin review works.
3. Emergency contacts: cross-user read/write denied.
4. SOS: sender-only and admin read; unrelated user denied.
5. Driver locations: non-driver cannot set online; unapproved driver cannot set online; cross-driver rows denied.
6. Live locations: unrelated user denied; participant INSERT/UPDATE limited to own identity and ride; test stale/completed rides.
7. Service: cross-customer/provider access denied; customer cannot create non-pending or preassigned request; non-admin cannot update administrative fields.
8. Bank enquiries: owner insert cannot set admin note or non-new status; non-admin update denied; cross-user reads denied.

## Limitations and conclusion
- Policy predicates and grant metadata only; no role-context runtime tests.
- No table data read.
- No changes or remediation applied.
- Main/Production untouched.
