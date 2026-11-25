# Phase 13B — Road Ride / Referral / Campaign RLS Predicate Review (QA, Read-only)

Date: 2026-11-26
Project: QA Supabase `pqsangtvietawkfgpgfu`
Scope: Policy predicates and table-grant context for selected modules. Metadata only; no data rows accessed; no writes.

## Road Ride
- `fr_road_ride_bookings`: authenticated SELECT policy allows passenger owner OR `fr_road_ride_is_driver(ride_id)`. Policy command is SELECT only.
- `fr_road_ride_events`: authenticated SELECT requires driver OR passenger helper. Policy command SELECT only.
- `fr_road_ride_guest_profiles`: INSERT/SELECT/UPDATE policies scope rows to `driver_id = auth.uid()`; no DELETE policy surfaced in catalog. Validate the helper/driver assignment semantics and whether guest-profile columns are appropriately limited.
- `fr_road_rides`: authenticated SELECT policy exposes live rides, owned rides, or rides where helper identifies passenger. Policy command SELECT only.
- Catalog grant inventory shows broad anon table-level privileges on the Road Ride tables. However, the observed policies are authenticated-only and SELECT-only (guest profiles also INSERT/UPDATE), so table grants alone do not establish anon access or authenticated direct DML success. Confirm with role-context negative tests; do not infer exploitability.

## Referral / Reward
- `fr_customer_referral_codes`: authenticated owner-read policy checks customer_id equals auth.uid() or admin; admin ALL policy is admin helper only.
- `fr_customer_referrals`: participant SELECT checks referrer/referred customer IDs or admin; admin ALL policy.
- `fr_customer_referral_reward_ledger`: SELECT is restricted to either referral participant or admin.
- `fr_customer_reward_ledger`: SELECT restricted to user_id = auth.uid().
- `fr_referral_codes`: authenticated owner SELECT and owner INSERT policies. INSERT check binds user_id to auth.uid().
- `fr_referrals`: authenticated SELECT restricted to referral participant or admin.
- Anon table grants were observed on several referral tables, but no anon policy was observed in this predicate snapshot; role-context tests are still required to verify actual denial.

## Store Campaigns
- `fr_store_campaigns`: public SELECT policy is limited to active, approved, and currently within start/end time. Authenticated admin ALL policy uses `is_friend_ride_admin()`.
- Anon broad table grants are present in ACL inventory, but public policy observed is SELECT only; do not assume anon writes succeed.

## Follow-up test matrix (not run)
- Road Ride: anon SELECT/INSERT/UPDATE/DELETE; authenticated non-owner/owner/driver/passenger SELECT; guest-profile owner INSERT/UPDATE and cross-owner denial; direct DELETE denied.
- Referrals: anon read/write denial; owner insert/read; cross-owner denial; participant-only referral and ledger reads; admin-only mutation.
- Campaigns: anon and authenticated public read of active approved in-window campaign; deny inactive/unapproved/out-of-window; non-admin mutation denied; admin mutation allowed.
- Tests need role/auth context or staging runtime and must not use real customer data.

## Conclusion
Predicate catalog indicates intent for participant/owner/admin boundaries. ACLs are broad in places, but RLS predicates are the effective row-level gate. Runtime role tests, helper-function review, view exposure review, and column-level exposure review remain pending. No remediation applied.
