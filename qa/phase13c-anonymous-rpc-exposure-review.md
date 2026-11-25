# Phase 13C — Anonymous RPC Exposure Review

Date: 2026-11-26
Environment: QA Supabase project `pqsangtvietawkfgpgfu`
Mode: Read-only function ACL and definition review. No RPC calls or data mutation.

## Anonymous/public EXECUTE catalog scan
The scan of public-schema routines with anon/PUBLIC execute ACL and non-trigger return types returned one function:
- `fr_public_homepage_feedback()`: SECURITY DEFINER, anon/authenticated execute.

The `fr_earnings_ledger_immutable()` trigger function also has a PUBLIC/anon execute ACL entry, but it is a trigger-returning function and its definition only raises an immutable-ledger exception. Direct execution behavior should be checked only through safe runtime test context; it is not a normal callable RPC.

## Public homepage feedback function
Definition returns curated feedback records:
- `kind='feedback'`
- `show_on_homepage=true`
- `status='published'`
- newest-first, limit 20
- returned columns: id, display name (bounded name or generic fallback), rating, message, created_at.

This appears consistent with a public homepage testimonials/feedback listing. Privacy controls should still be verified against the product consent/approval workflow.

## Runtime negative/positive checks to add
1. Anonymous call returns only records that satisfy feedback + homepage-visible + published predicates.
2. Unpublished records never appear.
3. Hidden-from-homepage records never appear.
4. Other support kinds (e.g., complaints/requests) never appear.
5. Maximum 20 rows and only curated return columns.
6. Confirm display-name publication consent or expected privacy setting.
7. Verify the trigger function cannot be used as a normal RPC and ledger immutability behavior is enforced on attempted ledger row mutation via test-only role/context.

## Finding classification
- Intended public feedback display: likely expected exposure, but consent and runtime checks pending.
- Ledger immutable trigger PUBLIC/anon EXECUTE ACL: catalog flag; trigger-function context and actual RPC behavior need safe validation.
- No production/main project accessed.

## Status
Catalog ACL scan and function-definition review completed. Runtime tests pending. No overall security certification.
