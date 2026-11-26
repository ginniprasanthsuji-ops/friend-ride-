# FRIEND RIDE Phase 13 — QA continuation evidence (2026-11-26)

## Frozen handover
- Planning / Checklist: **88% (unchanged)**
- Overall Audit estimate: **12% (unchanged)**
- Progress graph: **frozen**
- Production/Main: **untouched**

## Access verified this run
- GitHub QA branch `arjuna-x/phase-13-feature-audit`: source files fetched successfully.
- Dedicated Supabase project `FRIEND RIDE QA` (`pqsangtvietawkfgpgfu`): `ACTIVE_HEALTHY`.
- No SQL was issued to the production project.

## Read-only QA audit executed
- Public tables: **39**; RLS enabled: **39/39**; RLS-disabled list: none.
- SECURITY DEFINER functions without fixed search_path: **0**.
- Admin review guard functions: **2**; `admin_users` rows: **0**.
- Profiles table query returned no role rows; role-based runtime testing has no QA fixture accounts.
- Current client TRUNCATE/MAINTAIN grants on public tables: **0/0**.
- PostgreSQL-owned default client TRUNCATE/MAINTAIN grants: **0**.
- Supabase-managed `supabase_admin` default ACL entries for client TRUNCATE/MAINTAIN: **4**; unresolved due current SQL role-membership permission boundary.
- Shared Ride: **4** direct-write policies and **20** client write privilege entries; approved-driver creation, customer booking, confirmation, contact and cancellation RPC checks remain missing in live QA.
- Core Ride lifecycle RPCs: **7 present**.
- Payment/QR RPCs: **6 missing**.
- Catalogue/cart/order tables: **0**; required RPCs: **11 missing**.
- Home Services tables: **5**; Tasko payment RPCs: **2 missing**.
- Referral tables: **5**; referral RPCs: **7 present**.
- Flash Sale tables: **2**; reservation RPCs: **2 present**.
- ERS/RRS tables: **4**; road-ride RPCs: **8 present**.

## ERS/RRS security findings confirmed in QA
- `fr_road_ride_create`: no approved-driver/customer guest-profile role guard.
- `fr_road_ride_book`: no customer-role guard.
- `fr_road_ride_confirm_booking`: ride owner check exists, but no eligible-role/approval recheck.
- `fr_road_ride_save_guest_driver_profile`: no customer-role guard in live QA.
- Participant contact RPC lacks explicit role/driver eligibility guard.
- Cancelled/refunded rebooking defect: booking function permits those statuses in its duplicate check but the table has an unconditional UNIQUE(ride_id,passenger_id); the current implementation then inserts a new row, which will conflict.
- ERS/RRS direct client write grants: **15** (9 anon grants on rides/bookings/events; 3 anon and 3 authenticated grants on guest profiles).
- ERS/RRS direct-write policies: **2** (authenticated own guest-profile INSERT/UPDATE).
- Inspected app `index.html` has no direct ERS/RRS RPC integration.

## QA-branch-only artifacts added/updated
### Draft SQL (not applied)
`qa/phase13-ers-rrs-role-hardening-draft.sql`:
- Ride creation limited to approved Driver or Customer with own guest-driver profile.
- Customer-only booking.
- Reuse cancelled/refunded booking row to honor existing UNIQUE constraint and support rebooking.
- Ride-first locking for confirmation.
- Confirmation checks ride owner, eligibility, booking state, and future departure.
- Participant contact role/driver-eligibility checks.
- Driver/guest profile phone, registration, private photo-path and uploaded-object validation.
- Revokes client writes on RRS tables, drops guest-profile direct INSERT/UPDATE policies, retains authenticated read grants, and exposes validated write through authenticated RPC.
- Revokes public/anon execute and grants authenticated execute for the six primary RPCs and two helper RPCs.

Draft is review-only and **not applied**. No rows were modified.

### Audit SQL
Updated `qa/phase13-readonly-security-audit-assertions.sql` with ERS/RRS role guard, rebooking, direct-write policy, privilege, and unique-constraint checks. Re-executed against QA; current live gaps remain reported as `missing`.

### Regression spec
Added `tests/phase13-ers-rrs-role-hardening-static.test.cjs`. It is included by existing `test:unit` script (`node --test tests/*.test.cjs`) and covers the source integration gap, role guards, rebooking row reuse, lock order, contact authorization, private photo checks, least-privilege grants, audit read-only behavior, and draft-not-applied marker.

## Checks actually executed
- Read-only QA SQL audit: **executed**.
- Code-mode assertions against fetched branch source, draft and audit: **9/9 passed**.
- Node `--check` on a local mirror of the new test file: **passed** (syntax only).
- Node test runner `npm run test:unit`: **not executed**; no local repository checkout/dependencies.
- Playwright/browser tests: **not executed**.
- GitHub commit status check and PR workflow-run query for the test commit: **no statuses / no workflow runs returned**.

## Release status
**BLOCKED.** Admin/runtime role tests are blocked by empty QA profile/admin fixtures. Shared Ride security draft, core payment/QR backend, catalogue/order backend, home-service payment verification, and runtime regression remain unapplied/unverified. ERS/RRS hardening draft is not applied.

No production changes. Frozen estimates and progress graph remain unchanged.
