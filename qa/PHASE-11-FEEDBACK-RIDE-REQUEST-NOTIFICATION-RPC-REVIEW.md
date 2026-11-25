# Phase 11 — Feedback, Driver Request, and Notification RPC Review (QA)

**QA project:** `pqsangtvietawkfgpgfu`  
**Audit type:** Read-only catalog/source inspection. No RPCs invoked and no changes applied.

## Findings

### 1. `fr_public_homepage_feedback()`
- SECURITY DEFINER; empty search_path.
- Effective EXECUTE: **anon = yes**, authenticated = yes, service_role = yes.
- Returns published homepage feedback records: UUID, display name, rating, message, timestamp.
- Source filters to feedback kind, `show_on_homepage=true`, and published status; limits 20.
- **Privacy concern:** Anonymous public access is intentional-looking but the source only shows a visibility flag, not explicit consent/confirmation. Verify the flag is set only with explicit user permission and that names/messages are moderated/redacted. Anonymous EXECUTE alone is not automatically a vulnerability; public output and consent process must be validated.

### 2. `get_driver_requests()`
- SECURITY DEFINER; empty search_path.
- Effective EXECUTE: anon = no; authenticated = yes; service_role = yes.
- Source explicitly requires `auth.uid()` to belong to a profile with role driver and approved driver status.
- Returns full `rides` rows for requested, unassigned rides. Previous data-minimization review noted the full row can include customer identifiers, pickup/drop details and coordinates, fare, notes, and other ride fields.
- **Privacy concern:** approved drivers may receive more ride/customer data than needed before accepting. Runtime role-negative tests not performed.

### 3. Notification functions
- `fr_notification_claim_batch(uuid,integer)`: SECURITY DEFINER, empty search_path; anon and authenticated EXECUTE denied; service_role allowed. Source uses claim token, capped batch size 50, row locking and stale-claim recovery.
- `fr_create_notification_preferences_for_new_user()`: trigger function; anon/authenticated EXECUTE denied, service_role allowed. Search path is `public`, not empty; inspect trigger context and schema qualification before recommending changes. Not externally callable by normal roles according to catalog grants.

## Recommendations / validation gate (not executed)
1. Confirm homepage feedback publication is based on explicit consent and moderation; test anonymous read output using a controlled test account.
2. Reduce pre-accept ride request data to a minimum field projection; expose detailed pickup/customer data only after authorized acceptance.
3. Run role-based negative tests for Customer, Partner, Provider, Driver (unapproved/approved), Admin and anon, using QA-only test identities.
4. Keep notification claim function restricted to trusted service_role; test dispatcher using isolated QA environment only.
5. Review trigger function search_path and verify trigger attachment/invocation privileges.

## Status
Static findings documented. **No SQL, RPC execution, or production changes.** Phase 11 remains open pending consent review, data-minimization changes if approved, and runtime evidence.
