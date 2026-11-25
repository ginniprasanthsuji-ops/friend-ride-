# Phase 11 — QA Table ACL and RLS Policy Cross-Check

**Project:** QA Supabase `pqsangtvietawkfgpgfu`  
**Method:** Read-only catalog queries. No data mutation or policy changes.

## Findings

### Authenticated direct privileges
The current QA catalog lists authenticated grants of SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, and TRIGGER on:
- `admin_users`
- `profiles`
- `rides`
- `driver_locations`
- `fr_service_bookings`
- `fr_service_requests`
- `fr_support_feedback`

`fr_notification_events` currently shows authenticated SELECT only.

### RLS policy presence cross-check
| Table | Policies found | UID reference in policy qual/check (aggregate) |
|---|---:|---|
| admin_users | 1 | Qual references auth.uid |
| driver_locations | 1 | Qual/check references auth.uid |
| fr_service_bookings | 3 | Qual/check references auth.uid |
| fr_service_requests | 3 | Qual/check references auth.uid |
| fr_support_feedback | 3 | Qual/check references auth.uid |
| profiles | 4 | Qual/check references auth.uid |
| rides | 2 | Qual/check references auth.uid |

The aggregate check is only a presence signal; it does not validate each policy's semantics or whether policies combine safely.

## Risk interpretation
- RLS is a row-level filter for covered commands, but does not govern TRUNCATE.
- Broad authenticated table grants increase the importance of verifying RLS for each command and can permit non-row-scoped table operations (e.g. TRUNCATE, REFERENCES, TRIGGER) if effective grants remain.
- Current catalog indicates broad privileges across sensitive tables; this should be remediated through least-privilege ACLs after dependency review and validated with role-based tests.
- Existing policies' presence is not evidence of complete protection; the prior admin_users TRUNCATE finding remains a specific high-priority risk.
- Do not revoke broadly without checking app code and RPC/table dependencies, because direct client CRUD may currently rely on these grants.

## Recommended remediation gate (draft only)
1. Inventory actual app direct table operations and required CRUD per role.
2. Revoke unnecessary TRUNCATE, REFERENCES, TRIGGER from authenticated and review INSERT/UPDATE/DELETE/SELECT table grants for least privilege.
3. Prefer narrow grants plus explicit RLS policies; where business operations should only occur via RPC, revoke direct mutation and use validated RPCs.
4. Test Customer, Driver (approved/unapproved), Partner, Provider, Admin, anon and service_role in isolated QA.
5. Compare source migrations with deployed QA schema and record migration drift.

## Status
**Finding documented; no SQL changes applied.** No production access or mutation in this review.
