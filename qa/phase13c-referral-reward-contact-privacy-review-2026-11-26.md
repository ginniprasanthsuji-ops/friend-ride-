# Phase 13C — Referral, Reward, Subscription & Shared-Ride Contact Review

Date: 2026-11-26
Environment: QA Supabase `pqsangtvietawkfgpgfu`
Scope: Read-only catalog, selected SECURITY DEFINER function bodies and RLS policy review. No RPC executions or database mutations.

## Referral & rewards

Reviewed functions:
- `fr_admin_verify_and_reward_referral`: admin_users membership guard, row lock, rejected referral blocked, already-rewarded idempotent response, inserts both participant rewards with conflict protection, marks rewarded.
- `fr_customer_referral_admin_review`: authentication and Friend Ride admin guard, decision limited approve/reject, row lock, approval requires at least two eligible completed orders, final-state protection.
- `fr_customer_referral_reward_credit`: authentication/admin guard, row lock, requires approved status and two eligible orders, configured ₹50 reward check, ledger conflict protection and idempotent already-credited handling.
- `fr_customer_referral_bind_code`: authenticated customer role only, active code, self-referral blocked, one referral per referred user via uniqueness handling.
- `fr_customer_referral_get_or_create_code`: authenticated customer only, per-user code.
- `fr_referral_apply_code`: authenticated, rejects empty/invalid/self-referral, unique violation handles duplicate use.
- `fr_admin_verify_and_reward_referral`: uses unique/referral reward conflict protection.

RLS reviewed:
- Referral rows participant/admin read.
- Customer referral code own/admin read.
- Customer referral reward ledger read restricted to referrer/referred participant/admin.
- Reward ledger owner SELECT restricted to own user.

Runtime tests pending: cross-account referral read, self/duplicate code, fake qualifying orders, unauthorized review/credit, repeated credit and concurrency.

## Shared Road Ride contact privacy

Function `fr_road_ride_get_participant_contact(p_ride_id)` requires login and confirmed/active booking status before revealing contact; passengers receive driver contact and driver receives passenger contact. It rejects users outside confirmed participants.

**Potential correctness/privacy issue — driver branch returns only the most recent confirmed passenger for a ride** (ORDER BY booking.created_at DESC LIMIT 1). The RPC takes ride ID only, not booking/passenger ID. For shared rides with multiple confirmed passengers, the driver may not be able to retrieve each passenger's contact through this function, and it may return the wrong passenger relative to the caller's intended booking. This is a high-priority functional issue to validate and fix in a draft PR; no change applied.

Passenger branch returns driver contact for the ride, with booking statuses allowed: confirmed, boarding, in_progress, dropped, completed, disputed. Driver branch likewise checks a booking with those statuses.

RLS:
- Road ride bookings SELECT: passenger own or ride driver.
- Road rides SELECT: LIVE, driver-owned, or authorized passenger.
- Guest driver profile: owner SELECT/INSERT/UPDATE only.

Runtime privacy tests pending: confirmed booking only, unconfirmed/rejected/cancelled user denied, participant contact mutuality, cross-ride denial, multi-passenger contact selection.

## Subscription

Function-name search did not identify matching SECURITY DEFINER subscription functions in this pass. Subscription workflow, table/RPC inventory, grants and frontend integration remain to be mapped; absence in this search is not proof no subscription implementation exists.

## Status
Read-only checkpoint completed. No user identities created, no RPCs invoked, no SQL changes. Phase 13C remains open.