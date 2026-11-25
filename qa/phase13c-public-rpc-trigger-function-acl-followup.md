# Phase 13C — Public RPC and Trigger-Function ACL Follow-up

**Date:** 2026-11-26  
**Environment:** QA Supabase project `pqsangtvietawkfgpgfu` only  
**Method:** Read-only catalog/function-definition inspection. No data rows, RPC calls, writes, DDL, migrations, deployment, or Production/Main access.

## Catalog findings

### 1. `fr_public_homepage_feedback()`
- Catalog indicates SECURITY DEFINER.
- Explicit empty search_path (`SET search_path TO ''`) is configured.
- Function returns published homepage feedback only: rows with kind='feedback', show_on_homepage=true, status='published', ordered newest-first, limit 20.
- Projection: id, display_name (name trimmed and capped at 80 chars with fallback label), rating, message, created_at.
- anon and authenticated have EXECUTE according to privilege checks/ACL.
- Public execution appears consistent with a public homepage feedback-read function based on its definition, but runtime behavior not tested. Review output privacy of message/name and ensure publication flags/status are correctly admin-controlled.

### 2. `fr_earnings_ledger_immutable()`
- Catalog shows anon, authenticated, PUBLIC and service_role EXECUTE grants.
- Function is a PL/pgSQL trigger function and raises an exception to block ledger row changes, directing reversals instead.
- No non-internal trigger was found attached to this function in the inspected public schema catalog query. This is a catalog observation; verify whether the function is intentionally unattached, replaced by another enforcement mechanism, or missing its expected trigger.
- Broad EXECUTE grants on trigger-only functions are usually unnecessary; ACL cleanup should be considered in an authorized change review, without altering during this audit.

## Follow-up actions
- Confirm the ledger immutability enforcement path/trigger attachment and inspect related triggers/constraints catalog-only.
- Review public homepage feedback content exposure and admin control path.
- Do not run RPC or runtime tests until explicitly authorized and safely staged.

## Scope
No user rows queried. No changes applied. No app changes. Production/Main untouched. Frozen progress figures remain unchanged.
