# Phase 12 — Role Security & Access-Control QA

Status: checklist committed; execution evidence pending. Do not mark PASS from UI/source presence alone.

## Role matrix
- Customer: own profile, own rides/orders/bookings, own wallet/notifications/support. Cannot access driver/partner/admin data or privileged actions.
- Driver: own profile/KYC/vehicle docs, eligible assigned rides, own earnings/payment records. Cannot access other drivers' records or arbitrary customer data.
- Partner/Merchant: own store/catalogue/stock/orders/settlements. Cannot access another partner's catalogue or order records.
- Service Provider: own profile/documents/availability, assigned service requests, own earnings. Cannot access another provider's private data.
- Admin: privileged operations require authenticated admin authorization, audit logs and server-side enforcement.

## Test cases
| ID | Test | Expected | Evidence status |
|---|---|---|---|
| SEC-01 | Customer opens Driver dashboard directly | Denied or permitted route only | NOT TESTED |
| SEC-02 | Customer opens Partner dashboard directly | Denied | NOT TESTED |
| SEC-03 | Customer opens Admin dashboard directly | Denied | NOT TESTED |
| SEC-04 | Driver accesses another driver's profile/KYC | Denied | NOT TESTED |
| SEC-05 | Driver reads unrelated customer ride | Denied | NOT TESTED |
| SEC-06 | Partner accesses/edits another shop catalogue | Denied | NOT TESTED |
| SEC-07 | Partner reads unrelated order/payment | Denied | NOT TESTED |
| SEC-08 | Provider reads another provider's private documents | Denied | NOT TESTED |
| SEC-09 | Non-admin invokes admin approval action/RPC | Server-side denied | NOT TESTED |
| SEC-10 | Unauthorized role invokes privileged SQL/RPC | Server-side denied | NOT TESTED |
| SEC-11 | Role/session change and refresh | Correct authorized dashboard; no stale privilege | NOT TESTED |
| SEC-12 | Unauthorized private-storage file access | Denied | NOT TESTED |
| SEC-13 | Logout then revisit protected route | Auth required; no leakage | NOT TESTED |
| SEC-14 | Admin action | Audit trail with actor attribution | NOT TESTED |

## Execution requirements
- Dedicated QA accounts; no real sensitive documents.
- Check frontend routing and backend/RLS/RPC enforcement.
- Test direct URL, API/RPC attempts—not only visible menu checks.
- Record date, environment, role, expected/actual result, evidence, verdict.
- Staging/QA only; production untouched.

## Gate
Any access-control failure is a security blocker. No security PASS is claimed until tests are executed and evidence recorded.
