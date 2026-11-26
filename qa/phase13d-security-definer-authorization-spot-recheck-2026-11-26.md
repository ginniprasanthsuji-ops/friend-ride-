# Phase 13D — SECURITY DEFINER Function Authorization Spot Recheck (2026-11-26)

## Scope
QA Supabase project `pqsangtvietawkfgpgfu` only. Read-only catalog inspection of public functions that are SECURITY DEFINER and executable by authenticated users. Main/Production was not touched.

## Catalog snapshot
The catalog query enumerated authenticated-executable SECURITY DEFINER functions and checked for:
- `auth.uid()` references
- `admin_users` references
- apparent role checks
- write operations
- explicit `search_path` configuration

These text-presence checks are triage signals, not proof of authorization correctness. Each function still requires semantic review and runtime tests with controlled identities.

## Spot-reviewed functions
- `fr_customer_referral_admin_review`: authenticated user check plus `is_friend_ride_admin()`; decision constrained to approve/reject; approval requires 2 qualifying orders; row lock and terminal-state guard.
- `fr_customer_referral_reward_credit`: authenticated user check plus admin helper; only approved referrals; minimum two eligible orders; fixed ₹50 reward; unique referral ledger insertion and credited-state transition.
- `fr_customer_list_nearby_drivers`: requires authenticated customer or admin; validates coordinates and radius (maximum 15 km); only online approved drivers with recent location (5 minutes); limit 100.
- `fr_get_ride_payment_state`: authentication and ride participant check; reads payment session; may transition pending expired session to expired; returns session details only to ride participant.
- `fr_public_homepage_feedback`: public-facing STABLE SECURITY DEFINER function; only published feedback marked homepage-visible; returns up to 20 records. The anon-executable security advisor warning is consistent with intended public testimonials, but consent/moderation for homepage display should be verified.
- Admin review/list/ledger functions in sampled catalog show `admin_users` authorization checks in definitions. No blanket EXECUTE revoke recommended from this static sample.

## Findings / disposition
1. No confirmed authorization defect in these spot-reviewed definitions.
2. Public homepage-feedback function remains a policy/consent verification item, not an automatic revoke recommendation.
3. The catalog's text heuristics can produce false positives/negatives; full semantic review of all functions remains incomplete.
4. Runtime cross-user/admin-denial tests remain BLOCKED pending controlled QA identities and ride/payment/provider fixtures.
5. No QA data was seeded and no production changes were made.

## Next
Continue function-by-function semantic review, prioritize functions that mutate money, approvals, contact data, ride state, and admin-controlled records. Then perform runtime authorization tests using controlled staging identities.
