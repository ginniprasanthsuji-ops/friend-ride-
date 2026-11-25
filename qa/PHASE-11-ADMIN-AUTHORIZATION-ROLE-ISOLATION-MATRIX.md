# Phase 11 — Admin Authorization & Role-Isolation Test Matrix

**QA project:** pqsangtvietawkfgpgfu  
**Review type:** Read-only catalog and test planning  
**Database changes:** NONE  
**Runtime tests:** NOT RUN (no dedicated role-separated QA sessions available in this audit)

## QA catalog observation
- `admin_users` table columns in inspected QA schema: `user_id uuid`, `created_at timestamptz`.
- A query for functions with names matching admin/review/role returned no function rows in the QA snapshot query. This does **not** establish that admin checks are absent; functions may use other names, be in another schema, or be omitted by query conditions. Source/call-site inventory is still needed.
- Previous production audit documented a historical `is_admin()` hard-coded identity mismatch versus `admin_users`. QA current snapshot has not confirmed that function or mismatch. Treat it as a historical finding pending revalidation.

## Role-negative test matrix (must run with dedicated test accounts)
| Test | Role/session | Attempt | Expected |
|---|---|---|---|
| A1 | Customer | Admin dashboard/RPC access | Denied; no admin data |
| A2 | Driver | Admin dashboard/RPC access | Denied |
| A3 | Partner | Admin dashboard/RPC access | Denied |
| A4 | Service provider | Admin dashboard/RPC access | Denied |
| A5 | Admin | Allowed admin listing/review operations | Allowed only within admin scope |
| A6 | Non-admin | Approve/reject driver or partner | Denied |
| A7 | Non-admin | Edit admin_users membership | Denied |
| A8 | Authenticated user | Change own profile role to admin | Denied or overwritten by trusted guard |
| A9 | Authenticated user | Set approval/status/financial privileged fields | Denied or validated server-side |
| A10 | Admin | Attempt cross-role sensitive data beyond admin policy | Only authorized admin scope |
| A11 | Anonymous | Call admin RPC | Denied |
| A12 | Expired/revoked session | Call privileged RPC | Denied |

## Test setup safety
- Use distinct QA Customer, Driver, Partner, Provider, Admin and Anonymous sessions.
- Use synthetic accounts and data only.
- Do not test privilege escalation against production or real user records.
- Record request, response, role, account class, timestamp and evidence, but redact JWTs, OTPs, phone numbers and secrets.
- If an RPC does not exist in the QA environment, record NOT APPLICABLE / missing inventory rather than treating it as PASS.

## Remediation gates
1. Map all admin UI actions to RPC/table operations.
2. Inventory every privileged function, including differently named functions and overloads.
3. Verify membership source is consistently `admin_users` or a documented approved mechanism.
4. Ensure `admin_users` write operations are service/admin-only and no client can self-add.
5. Ensure profile role/approval fields are guarded server-side.
6. Review execute ACL and SECURITY DEFINER body for every privileged RPC.
7. Perform role-negative tests and preserve evidence.
8. Re-run privilege and RLS audit; test critical app workflows after any changes.

**No security test was executed against authenticated role sessions in this continuation. No SQL was changed.**
