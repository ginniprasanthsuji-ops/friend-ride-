# Phase 13D — Security Advisor Review (QA) — 2026-11-26

QA project: `pqsangtvietawkfgpgfu`.

## Supabase Security Advisor
Advisor reports:
- 1 warning: `public.fr_public_homepage_feedback()` callable by `anon` and SECURITY DEFINER.
- 51 warnings: authenticated-callable SECURITY DEFINER functions.

## Manual review of public homepage feedback RPC
Function definition confirmed:
- SQL, STABLE, SECURITY DEFINER, empty search_path.
- Returns up to 20 published, homepage-visible feedback entries.
- Returns id, display_name (name truncated to 80 chars, fallback label), rating, message, created_at.
- Filters `kind='feedback'`, `show_on_homepage=true`, `status='published'`.

This appears intentionally public for homepage testimonials, but user-generated `message` can still contain sensitive text. Keep public access only if homepage consent/visibility workflow and message moderation are enforced. Do not revoke anon EXECUTE blindly; could break the public homepage.

## Authenticated SECURITY DEFINER RPC warnings
Supabase Advisor flags authenticated-executable SECURITY DEFINER RPCs generically. This is not by itself proof of vulnerability; each RPC must be checked for authorization checks, input validation, row ownership, and admin membership. Audited Phase 13D RPCs have documented authorization guards; remaining functions require broader function-by-function audit. No blanket revoke or privilege changes made.

## Action
No database changes made from this advisor review. Main/Production untouched.
