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
