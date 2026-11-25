# Phase 13C — Database Integrity & Cascade-Deletion Catalog Audit

**Scope:** Read-only catalog review of the FRIEND RIDE QA Supabase project.  
**Project:** `pqsangtvietawkfgpgfu`  
**Branch:** `arjuna-x/phase-13-feature-audit`

## Frozen progress
- Phase 13C estimate: 91% (unchanged; not sign-off)
- Planning/Checklist: 88% FROZEN
- Overall Audit estimate: 12% FROZEN
- Phase 13B Shared Ride Hardening: 70% FROZEN
- Progress graph: FROZEN

## Catalog totals observed
- Public constraints: 205
- Foreign keys: 67
- Primary keys: 39
- Unique constraints: 23
- Check constraints: 76

## Constraint examples observed
- Shared Ride booking seat count is constrained to 1–12.
- Shared Ride booking and payment status values are restricted to enumerated lists.
- Shared Ride ride records constrain seat totals/booked seats, vehicle type, status and nonnegative per-seat price.
- Earnings ledger checks positive amount, INR currency, entry type, owner role, source type, status and idempotency-key length; uniqueness includes idempotency and source-owner-entry combinations.
- Referral reward tables constrain positive paise amounts, INR currency, reward types/status and unique referral/reward combinations.
- Store campaigns constrain dates, discount type/value, quantity, per-user limits and approval status.
- Driver documents constrain document type, verification status, and unique driver/document type and storage path.

## Cascade / set-null catalog observations
Catalog lists multiple user-owned records with ON DELETE CASCADE, including profiles, notifications, tokens/subscriptions, emergency contacts, driver documents, referrals, rides/bookings, provider applications/records and saved itineraries.
Ride/booking/event/payment relationships also include cascades. Several relationships use ON DELETE SET NULL, including ride-linked SOS/feedback and campaign partner/creator/reviewer references.

## Risk / follow-up
- Cascade deletion can remove dependent operational history. Confirm data-retention and audit-history requirements for user deletion before treating these cascades as acceptable.
- Catalog inspection does not establish runtime behavior; no deletes or runtime tests were performed.
- Confirm whether ledger, payment, referral reward, ride, safety, and complaint history must be retained or anonymized rather than cascaded.
- Review cascade chains and transactional expectations for booking/payment/event tables before any authorized change.

## Restrictions respected
- QA project catalog only; production/main project not accessed.
- No user data rows queried.
- No RPC calls, writes, DDL, migrations, deployment, or runtime tests.
- This report is an observation/recommendation, not a security sign-off.
