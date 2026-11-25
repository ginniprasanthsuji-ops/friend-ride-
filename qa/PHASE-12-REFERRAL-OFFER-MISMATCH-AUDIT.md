# Phase 12 — Referral & Offer Rule Mismatch Audit

Status: discrepancy documentation only; no rewards or eligibility code changed.

## Observed mismatch
Existing driver referral backend rule (from previously audited function behavior):
- Referrer must be approved.
- Self-referral is blocked.
- Two referred drivers are required.
- Each referred driver must complete four rides.
- Reward request is subject to admin review.
- Admin approval grants one month of free subscription and marks reward used.

Frontend copy observed in earlier project review advertised a lower ride threshold (two rides). This is inconsistent with backend eligibility.

## Must not change automatically
Do not silently lower backend requirement or change the UI promise. Product owner must approve the exact rule and wording.

## Test cases needed
1. Self-referral -> blocked.
2. Unapproved referrer -> blocked.
3. 1 referred driver only -> not eligible.
4. 2 referred drivers but one has 3 completed rides -> not eligible under current backend.
5. Both referred drivers have 4 completed rides -> eligible to request review.
6. Request repeated -> no duplicate reward request.
7. Admin rejects -> reward remains ungranted and request status recorded.
8. Admin approves -> one-month entitlement created exactly once.
9. Repeated admin approval -> idempotent; no extra month or duplicate reward.
10. UI text matches backend threshold after owner-approved policy.

## Customer and Partner offer gap
Previously audited backend did not verify end-to-end reward enforcement for the advertised customer ₹50 offer and partner one-month free subscription. These remain unverified; no balance or entitlement should be displayed as real without backend record.

## Release blocker
Frontend/backend eligibility mismatch and offer entitlement verification remain unresolved. Release must remain blocked for these reward claims until the rules are approved, backend verified, and tests run.