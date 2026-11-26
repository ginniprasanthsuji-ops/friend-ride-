# Phase 13C — QA Security Advisor and Service-Only Table Review

Date: 2026-11-26
Environment: QA project `pqsangtvietawkfgpgfu`
Mode: Read-only catalog review; no data mutation, grants, policy changes, or runtime tests.

## Fresh QA Security Advisor snapshot

- RLS-enabled/no-policy INFO: 2 findings (`fr_phase13d_ers_rrs_bookings`, `fr_ride_refund_requests`)
- Anon SECURITY DEFINER WARN: 1 (`fr_public_homepage_feedback()`)
- Authenticated SECURITY DEFINER WARN: 64
- Advisor is a catalog warning list; each function requires intended-role/ownership/security validation before changing EXECUTE grants.

## No-policy tables disposition

Catalog grant review shows `fr_phase13d_ers_rrs_bookings` and `fr_ride_refund_requests` have direct table privileges only for `service_role`; anon and authenticated table grants were not returned. This supports the service-only table access pattern and explains the no-policy INFO alerts. The Phase 13D booking operations are exposed via RPCs; their RPC authorization guards were inspected in prior review. Runtime authenticated/anon negative tests still pending.

## Refund RPC guard review

- `fr_admin_ride_refund_queue`: checks authenticated user exists and `is_friend_ride_admin()`; caps queue limit to 250.
- `fr_admin_ride_refund_mark_paid`: checks authenticated admin, requires nonblank refund reference, row-locks target request, validates status eligibility, then marks refunded.
- Function body catalog review only; no test invocation or data change.

## Storage review checkpoint

All six QA storage buckets are private, with MIME allowlists and file-size limits. Object policies use owner-folder checks for user uploads and explicit admin/participant access where applicable. Runtime cross-user, admin, and participant tests remain pending.

## ACL/RLS priority issues retained

- Five authenticated table grants include TRUNCATE; anon has TRUNCATE on guest profiles and road rides. No destructive testing.
- anon table DML grants exist on guest profiles and road rides; catalog RLS policy coverage is incomplete for anon, runtime validation required.
- FORCE RLS false across the six previously reviewed application tables.
- Road-ride driver photo bucket has no DELETE policy in catalog.
- 64 authenticated SECURITY DEFINER functions and 1 anon SECURITY DEFINER function remain advisor warnings; these are not automatically vulnerabilities. Review and safe role-negative tests must be prioritized by business function, with admin guards and cross-user boundaries verified.

## Next actions

1. Continue inventory/classification of SECURITY DEFINER functions into admin-only, owner/participant scoped, public read-only, and service-only.
2. Review function grants vs body guard for priority admin and sensitive data RPCs; perform safe negative tests only when QA auth test identities exist.
3. Prepare (not apply) least-privilege grant/policy SQL proposals with regression notes.
4. Complete cross-user storage/API tests using isolated QA users; QA currently has zero auth users/profile/document rows, blocking authenticated runtime test paths.
5. Phase 13C acceptance requires runtime negative tests and reviewed risk disposition. Main/production untouched.

## Current status

Catalog review expanded and documented. No schema/auth/privilege/storage changes made. Phase 13C is not yet accepted.
