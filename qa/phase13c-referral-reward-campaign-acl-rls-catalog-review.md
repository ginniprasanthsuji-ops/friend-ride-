# Phase 13C — Referral, Reward Ledger, and Store Campaign ACL/RLS Catalog Review

**Scope:** Read-only catalog review of QA Supabase project `pqsangtvietawkfgpgfu`. Production/Main was not accessed. No runtime requests, writes, migrations, policy changes, app changes, or deployments were performed.

## Tables reviewed
- `fr_customer_referral_codes`
- `fr_customer_referral_reward_ledger`
- `fr_customer_referrals`
- `fr_customer_reward_ledger`
- `fr_referral_codes`
- `fr_referrals`
- `fr_store_campaign_redemptions`
- `fr_store_campaigns`

## Catalog observations

### Customer referral codes / referral records
- Customer referral code table has admin ALL policy guarded by `is_friend_ride_admin()`; owner/admin SELECT policy.
- Customer referral records have admin ALL policy guarded by `is_friend_ride_admin()`; participant/admin SELECT.
- Customer referral reward ledger SELECT is participant (referrer/referred) or admin.
- Catalog grants include broad anon/authenticated SELECT/REFERENCES/TRIGGER/TRUNCATE on several tables despite policies being authenticated-role scoped. Effective anonymous access and grant exposure require runtime verification.
- Grants for customer referral code and referral tables appear read-oriented for anon/authenticated; do not infer effective write access from policy/grant catalog alone.

### Legacy/general referral tables
- `fr_referral_codes`: authenticated owner INSERT and owner SELECT policies; catalog shows broad anon grants including INSERT/UPDATE/DELETE. **ACL-policy mismatch risk**: anonymous table grants exist while no anon policy is present in the reviewed policy set. Verify effective anonymous denial and authenticated owner isolation with runtime tests.
- `fr_referrals`: participant SELECT and admin SELECT policies; catalog shows anon grants (including SELECT/REFERENCES/TRIGGER/TRUNCATE) but no anon policy. Verify anonymous denial, participant-only read, and admin access.

### Customer reward ledger
- `fr_customer_reward_ledger`: own-user SELECT only (`user_id = auth.uid()`).
- Catalog grants include anon/authenticated SELECT/REFERENCES/TRIGGER/TRUNCATE. No anon policy was observed in the policy catalog. Verify anonymous denial and ensure authenticated users cannot write or read another user's reward rows.

### Store campaigns / redemptions
- `fr_store_campaigns`: public/anon + authenticated SELECT policy only for active, approved campaigns inside the start/end window. Admin ALL policy guarded by `is_friend_ride_admin()`.
- `fr_store_campaign_redemptions`: owner/admin SELECT only; no user INSERT/UPDATE policy observed in catalog. Catalog grants include anon/authenticated SELECT/REFERENCES/TRIGGER/TRUNCATE. Verify anon denial and confirm redemption creation/update occurs only through intended secure RPC/backend flow, not direct client table writes.

## Runtime verification required (not performed)
1. Anonymous reads/writes against referral codes, referrals, customer reward ledger, referral reward ledger, campaign redemptions must be denied except intended public campaign listing.
2. User A cannot read or write User B referral code/referral/reward records.
3. Users cannot directly insert/update/delete reward-ledger rows or alter reward amounts/status/eligibility.
4. Admin-only changes to customer referral code and referral records are enforced.
5. Campaign listing returns only approved, active, in-window campaigns; anonymous access is limited to intended public fields.
6. Campaign redemption ownership and duplicate/limit handling are enforced through the intended secure workflow.
7. Test cross-user and role-negative cases with isolated QA identities; do not use production data.

## Conclusion
Catalog policies generally indicate participant/owner/admin isolation and intentionally public active-campaign SELECT. The main catalog risk is broad table grants (especially anonymous grants on referral/reward/campaign-redemption tables) that need effective-access runtime validation. This is **catalog-only evidence**, not a runtime security pass.

## Safety boundary
QA-only, read-only catalog queries. Production/Main untouched. No migrations, app code, policy edits, deployments, merges, or runtime security tests.
