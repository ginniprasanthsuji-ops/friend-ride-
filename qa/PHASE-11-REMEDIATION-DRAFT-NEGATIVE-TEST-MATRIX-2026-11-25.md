# Phase 11 — Remediation Draft & Negative-Test Matrix (NOT APPLIED)

Date: 2026-11-25
Target: QA Supabase only; project ref `pqsangtvietawkfgpgfu`
Status: Draft planning document. No SQL executed.

## Priority remediation

### A. Remove dangerous table-level privileges
Authenticated currently has broad privileges on `public.profiles`, including UPDATE/DELETE/TRUNCATE. A safe migration must first inspect app-required profile update fields and then:
- REVOKE table-level UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER from authenticated.
- Keep SELECT/INSERT only to the extent required by current app flows.
- Grant UPDATE only for approved non-sensitive columns after a workflow/field inventory.
- Ensure role, driver_approval_status, partner_approval_status are not client-writable.
- Do not issue a blanket replacement grant until the field inventory is complete; avoid breaking existing profile-edit flows.

Draft concept (review only; not executable as-is):
```sql
-- REVIEW DRAFT ONLY
REVOKE UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
ON TABLE public.profiles FROM authenticated;

-- Then grant UPDATE only on explicitly approved columns after app workflow inventory.
-- Do not include role, driver_approval_status, partner_approval_status.
```

### B. Remove client-set GUC authorization reliance
The trigger currently allows role/approval changes when `app.friend_ride_role_registration` equals auth.uid(). Do not rely on a client-set custom GUC as proof of authorization.

Preferred design direction:
- Keep role/approval fields non-writable by authenticated directly.
- Registration SECURITY DEFINER RPC performs validated role assignment and pending approval update.
- Admin approval occurs only through trusted admin RPCs.
- Reassess whether the guard trigger remains necessary once privileges and trusted RPC boundaries are correctly enforced. Avoid introducing another forgeable session flag.

### C. Privilege review after draft migration
Read-only verify:
- authenticated no effective UPDATE on protected columns;
- authenticated no DELETE/TRUNCATE/REFERENCES/TRIGGER on profiles;
- registration RPC EXECUTE remains authenticated and anon denied;
- admin RPCs remain gated by admin membership;
- role/approval changes cannot be made through direct API.

## Isolated negative-test matrix (requires approval + disposable QA account)

| Test | Expected result |
|---|---|
| Authenticated direct UPDATE role | Denied |
| Authenticated direct UPDATE driver approval | Denied |
| Authenticated direct UPDATE partner approval | Denied |
| Client-set GUC then protected direct UPDATE | Denied |
| Direct DELETE own profile | Denied unless explicitly required and approved |
| TRUNCATE profiles via client role | Denied |
| Legitimate driver registration RPC | Pending driver role only, validated fields |
| Legitimate partner registration RPC | Pending partner role only, validated fields |
| Repeat role registration | Rejected |
| Admin approval RPC from non-admin | Denied |
| Admin approval RPC from admin QA account | Allowed, test only |

## Test execution gate
Not approved/confirmed yet:
- Disposable QA account identity
- Account baseline and cleanup plan
- Exact mutation test procedure
- Explicit permission to perform the test

No test was executed and no changes were applied. Production is excluded.
