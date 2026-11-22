# Project Arjuna — QA-Only Marketplace & Parcel Schema Design

**Status:** Design proposal; NOT an applied migration.  
**Basis:** Frontend contracts in `index.html` and the current QA catalog gap audit.  
**Guardrails:** QA project only; no production SQL, no deploy, no merge, no payment provider.

## Proposed normalized tables

1. `fr_stores`
   - `id uuid PK`, `partner_profile_id uuid FK profiles`, approval/status, store name, store category, location point/lat-long, delivery radius, timestamps.
   - Constraint: lat in [-90,90], longitude [-180,180]; status allowlist.
   - Indexes: partner profile, approval/status, spatial/coordinate lookup as supported.

2. `fr_catalogue_items`
   - `id uuid PK`, store FK, master SKU, name, category, unit, description, price_paise bigint, offer_price_paise bigint nullable, image URL, available, prescription-required, timestamps.
   - Unique store + master SKU; prices non-negative; offer <= base price; SKU/name/category/unit non-empty and length-bounded.
   - Index: store + available; SKU lookup.

3. `fr_market_orders`
   - `id uuid PK`, order_number unique, customer profile FK, store FK, delivery address snapshot, status allowlist, quote deadline, created/updated timestamps.
   - Indexes: customer + created desc; store + status + created desc; unique order number.
   - Customer identity comes from JWT; store approval and eligibility checked inside transaction.

4. `fr_market_order_items`
   - `id uuid PK`, order FK, catalogue item FK nullable for legacy/free-form, item name snapshot, quantity positive numeric, unit price paise, prescription-required snapshot, image snapshot, status.
   - Index order id. Item price and identity validated server-side against store catalogue.

5. `fr_market_order_quotes`
   - `id uuid PK`, order FK, partner profile FK, quote revision, state (submitted/accepted/countered/declined/expired), total paise, created timestamp.
   - Unique order + revision. Index order/revision and partner.
   - Quote offers stored as quote items with order-item FK, offered price paise and validated positive/non-negative rules.

6. `fr_market_order_quote_items`
   - Quote FK, order-item FK, price paise, PK/unique quote+item.
   - Only items belonging to the same order are quotable; reject omitted/duplicate/foreign item IDs.

7. `fr_parcel_requests`
   - `id uuid PK`, tracking id unique, customer FK, assigned driver FK nullable, sender/receiver contact snapshots, pickup/drop address snapshots, description, weight, status allowlist, created/accepted/completed timestamps.
   - Weight positive and bounded; phone/address length bounds; index customer + created desc; status + created; assigned driver + status.
   - Atomic accept: conditional update only when requested and driver is eligible; prevent concurrent double-accept.

8. `fr_parcel_delivery_otp`
   - Parcel FK unique, OTP hash (never plaintext), expires_at, attempt_count, generated_at, verified_at.
   - Customer may retrieve/generate only for own parcel; driver verification only for assigned driver. Expiry and max-attempt checks are atomic; avoid OTP leakage in list/detail RPC.

9. `fr_market_order_status_history` and `fr_parcel_status_history`
   - Append-only transition history with actor profile, old/new status, timestamp, reason.
   - Index entity + created timestamp. RPCs enforce transition graph; history insert in same transaction.

## RPC authorization matrix

| RPC group | Customer | Partner | Driver | Admin |
|---|---|---|---|---|
| Approved store/catalogue browse | Read public approved/available only | Own store data | No private catalog access | Full read |
| Place/list/counter/accept market order | Own orders | No customer identity override | No | Admin review only |
| Partner list/quote/update orders | No | Own approved store orders | No | Admin |
| Create/list parcel requests | Own parcels | No | No | Admin |
| List/accept parcel work | No | No | Approved driver; atomic accept | Admin |
| Delivery OTP issue | Own assigned parcel as customer | No | No OTP read | Admin audit only, no plaintext |
| OTP verify/complete delivery | No | No | Assigned driver only | Admin audit |

## Mandatory RLS and RPC controls
- RLS enabled on every table; default deny.
- Public/anon grants only to narrowly designed approved-store/catalogue read surface; no direct write grants.
- Authenticated table grants minimized; mutations via SECURITY DEFINER RPCs with fixed search_path, explicit role checks, and ownership checks.
- SECURITY DEFINER functions must not accept caller IDs as authorization source; derive `auth.uid()`.
- Admin role check uses server-controlled profile/role claim with explicit authorization, never a client-settable metadata field.
- Keep private sender/receiver phone/address data inaccessible to unrelated users.
- Storage uploads (catalogue images) require bounded type/size, safe paths, and approved-store ownership.
- Do not use `unit_price_paise` from browser as authoritative; look up current catalogue and compute totals server-side.

## Transaction boundaries
- Single-store checkout: validate store approval, items, prices, delivery fields and insert order + items atomically.
- Multi-store checkout: prevalidate every store/items; transaction creates all store orders or rolls back. Return exact order count and order identifiers.
- Quote/counter/accept: lock order/quote rows; validate current state and deadline; record immutable quote revision and transition history in one transaction.
- Parcel accept: row-lock/conditional update for requested state and eligible driver; double accept must return a safe conflict.
- OTP: issue hashed code with expiry; verification increment/compare attempts atomically; completion transition and OTP verification commit together.

## Required test matrix before implementation is considered complete
- Schema: constraints, indexes, FK cascades/restrictions, RLS enabled, default-deny.
- Role tests: anon, customer A/B, partner A/B, approved driver A/B, unapproved driver, admin.
- Ownership: cross-customer order/parcel access denied; partner cannot access another partner's orders; unassigned driver cannot verify.
- Concurrency: double partner quote, accept quote races, double driver parcel accept.
- OTP: wrong, expired, repeated-attempt lock, correct OTP, reuse after completion.
- Price: client price tampering, unavailable item, cross-store SKU, invalid/negative/oversized values.
- Multi-store: one invalid store rejects/rolls back whole request; successful output count equals store count.
- CI: migration lint, unit contract tests, authenticated Supabase integration, Playwright end-to-end.

**Decision:** Design is ready for review, but implementation should wait until the base-schema source and exact UI contracts are reconciled. This document does not authorize or apply schema changes.
