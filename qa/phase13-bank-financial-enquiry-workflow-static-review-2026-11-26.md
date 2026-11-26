# FRIEND RIDE Phase 13 — Bank / Financial Enquiry Workflow Static Review (2026-11-26)

## Scope
Static source inspection of QA branch `index.html` (blob `6b18c4ae088c733c6d9b64139ad688573e3875e6`). No database queries, no runtime execution, and no production changes.

## Source observations
- Customer enquiry handler validates service selection, name length, 10-digit mobile, and area before inserting to `fr_bank_enquiries`.
- Insert includes `user_id: currentUser.id`, service type, name, phone, area; it returns a reference ID in the UI.
- Admin list handler checks `currentProfile.role === 'admin'` and `selectedRole === 'admin'`, then selects all columns from `fr_bank_enquiries`, orders newest-first, and limits 150.
- Admin UI exposes statuses `in_review`, `contacted`, `resolved`; handler allowlists `in_review`, `contacted`, `resolved`, `closed`, then updates status and timestamp.
- The UI includes financial-safety copy: use regulated institutions/providers and never share passwords, PINs, CVVs, or OTPs; FRIEND RIDE does not approve loans or guarantee returns.

## Security / integrity gaps
1. Frontend Admin role check is not an authorization boundary; server-side table RLS and update policy were not inspected/executed.
2. Admin list selects all columns. Confirm schema contains only necessary enquiry fields and no sensitive financial/identity data; enforce Admin-only SELECT server-side.
3. Customer INSERT policy should enforce authenticated caller can insert only own `user_id`; client validation can be bypassed.
4. Status update should enforce Admin role, allowlisted state transitions, and protect fields other than status/updated_at. These rules were not verified.
5. The source search did not locate SQL/migration definitions for `fr_bank_enquiries` policies; search gap is not proof deployed policy is missing.

## Test status
- Static review: completed.
- Runtime / DB tests: not executed.
- Production changes/deployments: 0.
- Fixes: 0.

## Release gate
Bank/financial enquiry flow remains source-wired but server authorization and data protection are unverified. Keep release gate blocked until RLS/policies and Admin status-update permissions are confirmed with staging evidence.
