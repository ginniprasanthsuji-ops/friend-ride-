# FRIEND RIDE Phase 13 — Continuation Evidence (2026-11-26 05:05 IST)

## Frozen handover
- Planning / Checklist: **88% (unchanged)**
- Overall Audit estimate: **12% (unchanged)**
- Progress graph: **frozen**
- Production/Main: **untouched**

## Access verified
- GitHub QA source branch `arjuna-x/phase-13-feature-audit`: available; source and QA artifacts fetched.
- Supabase project `FRIEND RIDE QA` (`pqsangtvietawkfgpgfu`): `ACTIVE_HEALTHY`.
- This run used only QA source/database. No production project SQL was issued.

## Read-only database audit executed
The branch's `qa/phase13-readonly-security-audit-assertions.sql` was executed against FRIEND RIDE QA.

Verified result:
- Public tables: **39**; RLS enabled: **39/39**; RLS-disabled table list: none.
- SECURITY DEFINER functions without fixed search_path: **0**.
- Admin review RPC guard count: **2**; admin_users rows: **0**; privileged-profile guard trigger: **1**.
- Client TRUNCATE/MAINTAIN grants on current public tables: **0/0**.
- PostgreSQL-owner default client TRUNCATE/MAINTAIN grants: **0**.
- Supabase-managed `supabase_admin` default ACL client TRUNCATE/MAINTAIN entries: **4** (unresolved; role membership prevents changing that ACL with current SQL role).
- Shared Ride: **4** direct-write policies, **20** client write privilege entries; approved-driver create guard, customer booking guard, confirmation/contact/cancellation RPCs absent in the live QA database.
- Core Ride lifecycle RPCs: **7 present**.
- Ride payment/QR RPCs: **6 missing**.
- Catalogue/cart/order tables: **0**; required RPCs missing: **11**.
- Home Services: **5 tables**; Tasko payment RPCs missing: **2**.
- Referral: **5 tables**, **7 RPCs present**.
- Flash Sale: **2 tables**, **2 RPCs present**.
- ERS/RRS: **4 tables**, **8 RPCs present**.
- Latest applied migration version observed: `20261125225012`.

## QA-branch-only changes this run

### Shared Ride security draft
Updated `qa/phase13-shared-ride-role-and-privilege-hardening-draft.sql`:
- Added passenger cancellation for pending/confirmed bookings before departure.
- Cancellation releases reserved seats and returns a previously full ride to live.
- Confirmation and cancellation now lock the ride row before the booking row, to serialize seat/status transitions consistently.
- Contact disclosure now share-locks the booking and verifies the assigned driver remains approved.
- Draft still revokes direct client table writes and grants authenticated RPC execution only.

### Payment / QR draft
Updated `qa/phase13-core-ride-payment-qr-backend-draft.sql`:
- Fixed a literal escaped newline in the QR storage policy SQL, which was invalid as drafted.
- Kept the QR bucket private, MIME-restricted, and limited to 2 MB.
- Draft is manual UPI UTR submission + assigned-driver confirmation, not provider settlement.

### Regression specs
- Expanded Shared Ride static test for cancellation and lock order; corrected its privilege-revoke assertion.
- Added Core Ride payment/QR static test and corrected its UTR assertion to compare the exact SQL contract.
- `package.json` already includes `test:unit` with `node --test tests/*.test.cjs`.

## Tests/checks executed
- Read-only QA SQL audit: **executed**.
- Code-mode static source/draft assertions: **21/21 passed** (checks are static text/contract assertions; not database behavior tests).
- `node --check` on local mirrors of the two regression-spec files: **passed**.
- Node test runner (`npm run test:unit`): **not executed**; there is no local checkout with the fetched repository files/dependencies in this runtime.
- Playwright/browser tests: **not executed**.
- GitHub commit statuses/workflow runs checked: **none returned** for inspected QA commits.

## Not applied / blockers
- Neither new SQL draft was applied to QA; no data mutation was performed this run.
- Shared Ride live integration remains absent from `index.html`.
- Core payment/QR backend remains missing from live QA database.
- Catalogue/order backend remains absent.
- Home-service payment verification remains absent.
- Admin runtime testing is blocked because QA `admin_users` currently has 0 rows.
- `supabase_admin` default ACL entries remain unresolved.
- Full Node and browser regression suites remain unexecuted.

**Release status: BLOCKED.** Frozen estimates and progress graph remain unchanged. Production/Main was not touched.
