# Phase 13C — Policy Role/Command Matrix and Table Grant Exposure Snapshot

**Date:** 2026-11-26  
**Target:** QA Supabase project `pqsangtvietawkfgpgfu` only  
**Mode:** Catalog-only/read-only. No table rows queried; no writes, DDL, RPC execution, migrations, deployment, or production access.

## Policy inventory grouping
- Policies: **77**
- Tables represented: **39**
- Policy roles are authenticated-only across the grouped table/command inventory, except the public campaign SELECT policy.
- Grouped policy commands include SELECT, INSERT, UPDATE, DELETE, and ALL; the exact per-table command grouping was inspected in catalog output.
- Anon-scoped policy found: `fr_store_campaigns.fr_store_campaign_public_read_active` — SELECT, anon+authenticated, restricted to active, approved campaigns whose time window is active.

## Grant catalog warning
The information_schema table_privileges catalog shows broad table-level grants to anon and authenticated, including SELECT and mutation privileges (INSERT/UPDATE/DELETE), and ancillary privileges (TRIGGER, REFERENCES, TRUNCATE) across many listed objects. This is a **grant-catalog observation**, not proof that anonymous/authenticated callers can perform those operations: RLS, object type (table/view), security-invoker/definer behavior, column grants, and effective privilege paths must be evaluated. However, broad grants paired with absent/mismatched policies warrant focused reconciliation.

## High-priority next catalog checks
1. Identify the exact object type for every object with anon INSERT/UPDATE/DELETE/TRUNCATE grant (tables vs views).
2. Compare grants to RLS policy commands and role scope, especially objects with anon mutation grants but no anon mutation policy.
3. Inspect view security settings and underlying relations, including `fr_road_rides_public`.
4. Review authenticated DELETE/TRUNCATE grants against explicit policies and verify whether grants are direct, inherited, or default privileges.
5. Prepare runtime negative tests using isolated QA identities only; do not run yet.

## Scope and frozen status
- No production/main Supabase accessed.
- No app changes.
- No user data rows accessed.
- Runtime negative tests remain pending.
- Frozen Phase 13 tracking percentages and graph remain unchanged.
