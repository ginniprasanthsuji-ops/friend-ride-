# FRIEND RIDE — Phase 11 Consolidated Security Risk Register
Date: 2026-11-25
Environment: QA Supabase project only (pqsangtvietawkfgpgfu)
Method: Consolidated prior read-only static catalog, policy, ACL, and source reviews. No remediation SQL executed; production untouched.

## Status key
- High: sensitive access or broad privilege issue requiring approval and remediation priority.
- Medium: privacy, role boundary, data minimization, or implementation gap requiring verification.
- Pending: cannot close without runtime tests, app/source recovery, or external configuration review.

## High-priority risks
1. **Broad authenticated table privileges / TRUNCATE bypass of RLS** — sensitive tables include profiles, rides, driver_locations, ride_live_locations, fr_ride_sos, notification tables, admin_users and others. Catalog reviews found effective authenticated table privileges including TRUNCATE/DELETE/UPDATE/INSERT on several. RLS does not protect TRUNCATE. No changes applied.
2. **Registration privileged-field GUC boundary** — registration RPC sets transaction-local custom GUC as authorization signal, and profile trigger relies on that GUC. Static review suggests a client-settable GUC may allow bypass in combination with broad profile UPDATE privileges. Exploit not runtime-confirmed.
3. **Storage/document security readiness** — QA catalog previously showed zero storage buckets/policies at snapshot. Document path validation exists in registration RPC, but secure private storage, signed URLs, and owner/admin policies remain unverified.
4. **Admin ACL/approval boundaries** — admin_users has broad effective authenticated table privileges at catalog snapshot; policies restrict row operations but TRUNCATE bypasses RLS. Approval RPCs source-check admin membership, but runtime negative/positive tests not run.
5. **Ride GPS/location privacy** — participant policies exist on live-location records; predicates do not visibly constrain ride state/expiry. Broad authenticated privileges include TRUNCATE on ride/location/SOS tables.

## Medium / follow-up risks
6. **Driver discovery data minimization** — get_driver_requests() requires approved driver, but returns full rides rows for unassigned requested rides; possible excess customer IDs, notes, pickup/drop coordinates, and fare fields.
7. **Post-ride contact retention** — customer/driver details RPCs enforce ride participant checks and include accepted through completed states; post-completion contact access window is not defined in reviewed source.
8. **Notification/token privacy** — own-user RLS policies are present; broad table privileges remain. Push tokens are sensitive credential-like data; avoid logging/exposure. Notification text/action URL minimization and allow-list need review.
9. **OTP/session/Auth settings** — dashboard configuration not visible from database catalog. Expiry, resend throttling, session/refresh expiry, revocation, phone-change verification, admin MFA and compromised-password protections remain external configuration checks.
10. **Feedback consent/moderation** — anonymous/authenticated feedback path was reviewed earlier; consent, moderation, and data retention remain unverified.
11. **RPC privacy exposure** — customer browse RPCs and service-provider/driver listing source reviews indicated possible phone/address/GPS data exposure; role gates and field minimization require runtime confirmation.
12. **Approval history/concurrency** — reviewed admin approval source had no clearly visible history writes and assignment concurrency locking was not evident; verify workflow and audit trail.
13. **Notification dispatch** — earlier QA review noted dispatch authorization/claim workflow risks and source/app wiring uncertainty. Reconcile current deployed QA function and test claim-token uniqueness, replay and concurrency before closure.

## Lower-confidence / historical items
14. **Migration drift** — QA migration ledger had 26 entries; repository source reconciliation was incomplete, so no drift conclusion.
15. **Production historical advisor** — historical report only; not current verified and production was not queried in this continuation. Do not treat as current state.
16. **App QA isolation** — historical source review reported hard-coded production Supabase configuration and no clear QA injection path. Before E2E, fail closed and confirm test app is pointed at QA only.

## Required remediation approval gate
- [ ] Approve least-privilege plan and exact SQL before applying any changes.
- [ ] Revoke unnecessary table-level UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER privileges, then grant only necessary table/column or RPC access.
- [ ] Replace client-settable GUC authorization with an authorization signal that cannot be forged by the client.
- [ ] Implement private storage buckets and explicit owner/admin access; test signed URL expiry.
- [ ] Add ride-state and expiry checks to live-location read/write boundary; define cleanup retention.
- [ ] Restrict driver request projection to fields required for matching/acceptance.
- [ ] Define post-completion contact access window.
- [ ] Review notification content, tokens, action URL allow-list, and dispatch replay protection.
- [ ] Review OTP/session/MFA configuration in dashboard.
- [ ] Add approval audit-history and concurrency safeguards if absent.
- [ ] Run negative/positive tests with disposable QA users: customer, unapproved driver, approved driver, partner, admin, unrelated user.
- [ ] Run real-device tests only in isolated QA: OTP, push, location permission, live tracking, SOS and role dashboards.

## Closure rule
No issue is marked closed based on static inspection alone where runtime behavior/configuration is required. No test is marked passed unless actually executed and evidence recorded.

## This checkpoint
Consolidation: completed from existing audit notes.
New SQL/migrations: 0.
Runtime tests: not run.
Production: untouched.
