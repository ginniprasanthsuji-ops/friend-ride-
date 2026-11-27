# Project X2 Food/Shop — Store Ownership Verified

Date: 2026-11-27
Branch: `yt-test-1-to-15`

## Confirmed store identity
Read-only QA SQL inspection of `public.fr_customer_list_approved_stores_geo` confirmed that its approved-store list selects `profiles.id` as `id`, and filters `profiles.role='partner'` with `partner_approval_status='approved'`. Therefore the customer-facing approved store ID is the partner profile UUID. Catalogue and market-order tables can use this profile UUID as partner/store owner, with authorization checks against `auth.uid()` and the partner role/approval status.

## Important
- This is a verified mapping for the existing approved-store UI/RPC, not proof that catalogue/order tables or RPCs exist.
- QA still has no verified catalogue/order schema/RPCs from the previous audit.
- No database write/migration was executed in this checkpoint.
- Main/production untouched.
