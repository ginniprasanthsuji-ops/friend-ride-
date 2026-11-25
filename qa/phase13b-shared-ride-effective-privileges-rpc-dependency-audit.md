# Phase 13B — Effective Privilege & RPC Dependency Audit

Read-only QA audit, 2026-11-26. No data writes or SQL remediation.

## Effective table privileges
Catalog effective privilege checks confirm:
- anon: SELECT/INSERT/UPDATE/DELETE/TRUNCATE true on all four Shared Ride tables.
- authenticated: SELECT true on all four; INSERT/UPDATE false on rides and bookings, but DELETE and TRUNCATE true; events and payments SELECT/INSERT/UPDATE/DELETE/TRUNCATE all true.
This confirms the previous table-grant review is an effective privilege concern, not just a raw ACL listing.

## RPC inventory
Only three matching deployed public RPCs returned:
- fr_shared_ride_book_seats — SECURITY DEFINER, fixed empty search_path, anon EXECUTE false, authenticated EXECUTE true.
- fr_shared_ride_create — SECURITY DEFINER, fixed empty search_path, anon EXECUTE false, authenticated EXECUTE true.
- fr_shared_ride_is_passenger — SECURITY DEFINER, fixed empty search_path, anon EXECUTE false, authenticated EXECUTE true.
No deployed participant-contact RPC or booking confirm/cancel RPC was returned by this matching catalog query.

## Contact columns
The four Shared Ride tables do not expose phone/contact/name/email columns by the queried naming patterns. This is a catalog-only column-name review; no actual personal data was selected.

## Membership and views
The role membership query did not return rows in the combined output. No shared-ride-named public views were found in prior audit. Membership/effective inherited grants should be rechecked with separate focused catalog queries if needed.

## Risk / next
The strongest confirmed direct table permission exposure is anon DML/TRUNCATE and authenticated DELETE/TRUNCATE across rides/bookings, plus authenticated DML/TRUNCATE events/payments. Existing RLS/policies are not a substitute for table ACL least-privilege. Stage 2 draft remains unapplied. Next: map client code/RPC dependencies for event/payment mutations and inspect exact ACL role inheritance; prepare approved rollback/test matrix.

No SQL applied. Main/Production untouched. No merge/deploy. No PASS claims.


## Role membership and effective privilege follow-up (2026-11-26)

### Role membership
- `authenticator` is a member of `anon`, `authenticated`, and `service_role` (no admin option shown).
- `anon` and `authenticated` have no role memberships in the focused catalog result.
- `postgres` has broad administrative memberships; these are not app client roles.
- `anon`, `authenticated`, and `service_role` are non-login roles.

### Effective privilege recheck (`has_table_privilege`)
- `anon`: SELECT/INSERT/UPDATE/DELETE/TRUNCATE true on all 4 Shared Ride tables; public schema USAGE true.
- `authenticated`: SELECT true on all 4; DELETE and TRUNCATE true on rides/bookings; events/payments SELECT/INSERT/UPDATE/DELETE/TRUNCATE true; public schema USAGE true. Direct INSERT/UPDATE false for rides/bookings.
- `service_role`: all five table privileges true on all 4 tables; public schema USAGE true.

This confirms the prior effective-grant findings. No application SQL or ACL changes were applied. ACL stage 2 remains blocked by source dependency mapping.
