# Project X2 Food/Shop Catalogue Foundation — Migration Review

Branch: `yt-test-1-to-15`
Migration: `supabase/migrations/202611270005_project_x2_food_shop_catalogue_foundation.sql`

## Included
- Partner-owned catalogue table keyed to `profiles.id` (verified store ID source).
- Owner + master SKU unique index, lookup index.
- RLS enabled and direct table access revoked; RPC-only access.
- Partner save/upsert RPC with authentication, approved-partner check, basic field validation, integer paise, offer/base-price guard.
- Partner-scoped catalogue listing RPC.
- Customer catalogue RPC for approved stores, available items only.
- Execute grants limited to authenticated role.

## Review notes / limitations
- This is catalogue foundation only; no orders/quotes/payment RPCs are implemented here.
- Existing catalogue photo flow currently uses public URL storage; migration stores the URL as supplied. A separate storage-security review is needed before relying on image uploads.
- Migration has been committed to the QA branch but NOT applied to Supabase.
- SQL syntax/behavior is not yet runtime-verified in QA. Review and test on QA before applying.
- Main/production untouched.
