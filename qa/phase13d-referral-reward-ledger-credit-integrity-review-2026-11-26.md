# Phase 13D QA — Referral Reward Ledger Credit Integrity Review (2026-11-26)

## Scope
Read-only source and QA catalog review of customer referral approval and reward credit flow. No data writes or migrations. Production/Main untouched.

## Findings
- Repository migration `20261125201100_phase13_customer_referral_reward_ledger_credit.sql` defines a reward ledger with unique `referral_id`, positive amount constraint, INR-only currency, and fixed reward entry type.
- Credit RPC uses `SECURITY DEFINER`, empty search_path, auth requirement, explicit admin guard, row lock on referral, approved-state and 2-order eligibility checks, and ₹50 reward configuration check.
- Idempotency is implemented through unique referral_id and `ON CONFLICT DO NOTHING`, plus returning an existing ledger entry on repeat attempts. Referral status is updated to credited/rewarded after inserting the ledger row.
- Ledger RLS policy restricts SELECT to referrer, referred participant, or admin. Direct INSERT/UPDATE/DELETE are revoked from anon/authenticated.
- QA catalog confirms a policy for `fr_customer_referral_reward_ledger`; the current QA function source for `fr_customer_referral_reward_credit` and `fr_customer_referral_admin_review` matches the reviewed hardened logic.
- Static concern: the older `sql/phase13_referral_reward_ledger.sql` references the separate legacy `fr_referrals`/ `fr_customer_reward_ledger` model and an RPC whose execute grant is to authenticated. Do not confuse this older/parallel schema with the newer `fr_customer_referrals` model. Confirm which frontend path is active before rollout.
- Static-only review: no live role-based or duplicate-credit test was executed.

## QA disposition
**SOURCE/CATALOG REVIEWED; RUNTIME CREDIT TEST NOT PERFORMED.** Core protections appear present in the reviewed newer referral-credit RPC. The legacy referral-ledger SQL is a separate model and needs frontend-path reconciliation to avoid accidental use of the wrong reward flow.

## Next action
Inspect frontend referral code and RPC call sites to map legacy vs newer referral schema and identify the active customer/admin workflow. Keep QA-only and read-only.
