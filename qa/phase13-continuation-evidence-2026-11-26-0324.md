# FRIEND RIDE Phase 13 — continuation evidence (2026-11-26 03:24 IST)

## Frozen handover
- Planning/Checklist: **88%** (unchanged)
- Overall Audit estimate: **12%** (unchanged)
- Progress graph: **frozen**
- Production/Main: **untouched**

## Access verified this run
- GitHub QA branch `arjuna-x/phase-13-feature-audit`: source read/write available.
- Dedicated Supabase QA project `pqsangtvietawkfgpgfu` (`FRIEND RIDE QA`): `ACTIVE_HEALTHY`.
- Local checkout/Node test runner and dedicated QA website URL were not available in the execution environment; Playwright was not run.

## Read-only QA SQL executed
- Public tables: **39**; RLS enabled: **39/39**; FORCE RLS: **0**.
- SECURITY DEFINER functions: **50**; missing fixed search_path: **0** (verified using each function's `proconfig`, including empty search path).
- `admin_users`: **0 rows**; static admin-review RPC guards: **2**.
- Profile privileged-field trigger: **1**.
- Shared Ride tables: 4; policies total: **8**; direct-write policies: **4**.
- Shared Ride client table privilege entries: **54 total**; write/delete/truncate subset: **28** (anon: 16, authenticated: 12).
- Public-schema client TRUNCATE grants: **54 across 37 tables**.
- Shared Ride create approved-driver guard: **missing**.
- Shared Ride booking customer-role guard: **missing**.
- Shared Ride confirm/contact/cancel RPCs: **all missing**.
- Existing Core Ride RPC inventory: 7 expected ride lifecycle RPCs present.
- Payment/QR RPCs missing: 6.
- Catalogue/cart/order tables: **none**; expected catalogue/order RPCs missing: **11**.
- Home Service tables: **5**; TASKO payment RPCs missing: **2**.
- Referral tables: **5**; referral RPCs found: **7**.
- Flash Sale tables: **2**; reservation/cancel RPCs found: **2**.
- ERS/RRS road-ride tables: **4**; road-ride RPCs found: **8**.
- Max applied QA migration version: `20261125182631`.

## QA-branch-only changes
1. Extended `qa/phase13-shared-ride-role-and-privilege-hardening-draft.sql` with draft RPCs for driver-owned booking confirmation and booking-specific counterpart contact disclosure. The contact function requires an active confirmed/boarding/in-progress booking and returns only the other participant's contact. Added explicit authenticated-only execution grants and public/anon revokes.
2. Expanded `qa/phase13-readonly-security-audit-assertions.sql` with total/direct-write policy counts, client write-privilege count, missing confirmation/contact RPC checks, and corrected SECURITY DEFINER fixed-search-path check.
3. Added `tests/phase13-shared-ride-security-static.test.cjs` to the `test:unit` glob for static regression checks covering the security draft, participant privacy, grants, and read-only audit.

## Tests/checks executed this run
- Updated read-only audit SQL executed against the dedicated QA database; results above are returned by Supabase.
- In-memory static assertions against the fetched QA branch source/drafts: **11/11 passed**.
- CI status query for the latest test commit returned no status checks.
- Node `test:unit` and Playwright suites were **not executed**; no local checkout/test runner or QA app URL was available.
- SQL hardening draft was **not applied** to any database.

## Known limitations and findings
- Shared Ride feature is not wired into the current `index.html` UI/RPC source.
- Shared Ride authorization gaps remain in the live QA DB until reviewed SQL is applied and role tests are run.
- Admin runtime checks remain blocked because QA `admin_users` is empty.
- Payment/QR, catalogue/order, and TASKO payment backends are incomplete in QA.
- Existing road-ride participant-contact RPC returns only one passenger contact to the driver (`LIMIT 1`); multi-passenger contact display should be addressed during ERS/RRS integration review.
- No live OTP, push, GPS, settlement, or full browser regression tests were performed.

## Commits
- Shared Ride confirmation/contact draft: `aa7938a06d6eb845649ed00028abf0bc8e7b0d11`
- Read-only audit expansion: `1c02bcc1f707caa17f225db61a20e7405d933028`
- Static security regression test: `6e59a6829367d7e5bb4051e7819bb0641440e775`
- Read-only test correction: `8f00c089ec69a8574fb23f27ee440ee23fe1d00`

**Release status: BLOCKED.** Planning/Checklist 88%, Overall Audit 12%, graph frozen; no estimates changed. No production/Main changes, no database mutations.
