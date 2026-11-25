# Phase 13 Referral Dashboard Integration — QA only

## Current safe integration package
- Customer panel: `features/phase13/referral-ui.html` + `referral-ui.js`
- Admin panel: `features/phase13/referral-admin.html` + `referral-admin.js`
- Database migration: `sql/phase13_referral_foundation.sql`, `sql/phase13_referral_reward_ledger.sql`
- Admin read policy: applied in QA database.

## Integration guards
Do not blindly append these fragments into `index.html`: it is a large single-page application with role routing, and the exact current dashboard mount points must be identified first. This integration is still on the feature branch only.

### Customer
1. Add a new customer-only page/container with id `referrals` using the Referral UI fragment.
2. Add a customer dashboard/menu navigation item targeting `referrals`.
3. Load `referral-ui.js` after the existing Supabase client initialization and auth helpers.
4. On opening the page, call `frReferralLoadCode()` and `frReferralLoadRewards()`.
5. Never display reward as cash/wallet balance. Show as referral reward ledger entry only, pending policy/eligibility confirmation.

### Admin
1. Mount Admin UI only inside authenticated `adminDashboard`.
2. Load `referral-admin.js` after Supabase initialization.
3. Admin-only RLS protects referral listing; RPC verifies admin and processes reward atomically.
4. Admin must verify eligibility before clicking Verify & Credit Both ₹50.

## Required QA workflow
- New customer A: generate own referral code.
- Customer B: apply A's code; verify referral record created.
- B applies again: rejected / no second record.
- A attempts own code: rejected.
- Admin opens referrals list and verifies correct record.
- Admin credits rewards: exactly 2 reward ledger entries, 5000 paise each.
- Admin clicks credit again: no duplicate entries.
- A and B refresh their rewards list and only see own reward.
- Non-admin cannot read all referrals or execute admin reward RPC.
- Rejected referral never gets credited.
- Confirm rewards are not treated as spendable wallet balance until a wallet redemption integration is approved.

## Status
Backend and feature fragments exist. Main SPA mount-point discovery, integration, browser E2E and production deployment are pending.