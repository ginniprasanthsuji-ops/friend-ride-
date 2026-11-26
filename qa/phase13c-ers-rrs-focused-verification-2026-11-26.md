# FRIEND RIDE Phase 13C — ERS/RRS focused verification

- Frozen handover: Planning/Checklist **88%**; Overall Audit **12%**; graph frozen.
- Repository: QA branch `arjuna-x/phase-13-feature-audit`; source fetch verified.
- Supabase QA project `pqsangtvietawkfgpgfu`: `ACTIVE_HEALTHY`; project inventory confirmed QA and production project separately.
- Production/Main: untouched.

## Live QA findings verified by read-only SQL

1. `fr_road_ride_create` allows any authenticated user (only login guard; no profile role/driver approval check).
2. `fr_road_ride_book` allows any authenticated user (only login guard; no Customer role check).
3. `fr_road_ride_get_participant_contact` driver-side branch returns only one passenger contact via `ORDER BY b.created_at DESC LIMIT 1`. This is a confirmed implementation limitation; it does not expose all confirmed passenger contacts.
4. RPC execution grants: `anon` denied and `authenticated` allowed for all inspected `fr_road_ride_*` RPCs, including create/book/confirm/contact/profile save. This is least-privilege on execution role but does not replace role checks inside RPCs.
5. Guest-profile save is currently `SECURITY INVOKER` (not definer); other inspected RPCs are definer with fixed empty search_path.

## QA-branch-only artifact added

- `qa/phase13c-ers-rrs-focused-readonly-audit.sql`: focused read-only SQL to reproduce function execution grants and the single-contact limitation.
- `tests/phase13c-ers-rrs-focused-readonly-audit.test.cjs`: static test verifies the audit is read-only and includes those checks.

## Checks performed

- Live QA SQL: **executed** for RPC function definitions and execution privileges.
- Static assertion against fetched SQL: **2 checks passed** (audit contains privilege checks; detects contact-limit pattern; write statements absent).
- Node test runner: **not executed** (no local repository/dependencies).
- SQL draft migrations: **not applied**.
- Frontend runtime: not tested; source has no direct ERS/RRS RPC references in inspected `index.html`.

## Release

**BLOCKED**: Role guards and participant contact UX are not implemented in live QA; draft SQL remains review-only. No production changes. Frozen estimates unchanged.
