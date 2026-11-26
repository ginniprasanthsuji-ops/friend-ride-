# Phase 13D QA — Payment/Earnings Table ACL & RLS Audit (2026-11-26)

## Scope
Read-only catalog review in QA project `pqsangtvietawkfgpgfu`. No payment data rows queried, no SQL writes, no runtime auth tests, Main/Production untouched.

## Tables found
- `fr_earnings_ledger`
- `fr_shared_ride_payments`

Both have RLS enabled; FORCE RLS false.

## Policies
### fr_earnings_ledger
SELECT policy `fr_earnings_ledger_owner_select`: authenticated may read rows where owner_id=auth.uid() or admin_users membership exists. No INSERT/UPDATE/DELETE policy returned.

### fr_shared_ride_payments
SELECT policy `fr_shared_payments_booking_participant_read`: authenticated passenger for associated booking or driver of associated ride can read payment rows. No INSERT/UPDATE/DELETE policy returned.

## Grants / risk note
Metadata lists broad table privileges for `fr_shared_ride_payments` to anon/authenticated, including INSERT/UPDATE/DELETE, but no matching RLS policies for those commands. Since RLS is enabled, these grants alone do not establish effective writes; absent write policies are expected to deny ordinary direct writes. Runtime verification not performed. `fr_earnings_ledger` grants authenticated SELECT only; service_role has broad privileges.

## Ledger integrity
`fr_earnings_ledger` has UPDATE and DELETE triggers invoking `fr_earnings_ledger_immutable()`. Static metadata confirms triggers exist; function body/trigger runtime behavior not tested.

## Conclusions
- Static read policies appear owner/admin for ledger and booking-participant/ride-driver for shared payments.
- No direct authenticated write policies found on either table.
- Broad grants on shared payments are a least-privilege review item: consider revoking direct DML from anon/authenticated and expose only approved payment RPC/edge flow, but no change was made in this audit.
- Payment settlement/release/refund workflow and RPC permissions remain unverified; function-name search returned no matches earlier.

## Frozen tracking
13C 91%, Planning/Checklist 88%, Overall Audit 12%, progress graph frozen. QA branch only.
