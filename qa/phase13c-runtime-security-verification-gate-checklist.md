# Phase 13C — Runtime Security Verification Gate Checklist (Catalog Audits Consolidated)

Date: 2026-11-26
QA project: `pqsangtvietawkfgpgfu`
Purpose: Prepare runtime QA scenarios based on catalog reviews. This checklist is not test evidence; scenarios are still pending execution.

## Gate 0 — Test identities and isolation
- [ ] Anonymous (no JWT)
- [ ] Customer A / Customer B
- [ ] Driver A / Driver B (approved and pending states)
- [ ] Partner A / Partner B (approved and pending states)
- [ ] Service provider approved-online / offline / unapproved
- [ ] Admin account in admin_users
- [ ] Test-only records and test project confirmation

## Gate 1 — Admin membership and privileged RPC
- [ ] Anonymous calls rejected
- [ ] Non-admin authenticated calls rejected across admin RPCs
- [ ] Admin_users self-insert/alter/delete/truncate attempts rejected for non-admin
- [ ] Admin review RPC decisions invalid values rejected
- [ ] Admin actions attributed to auth.uid() and audit trail exists

## Gate 2 — Profile and role escalation
- [ ] Customer cannot change own role to driver/partner/admin
- [ ] Customer cannot self-set driver/partner approval status
- [ ] Registration guard cannot be spoofed through client-controlled custom setting
- [ ] Cross-user profile updates rejected
- [ ] Sensitive profile fields do not leak through API projections

## Gate 3 — Driver documents and storage
- [ ] Driver can create own document with pending status only
- [ ] Driver cannot self-verify/reject documents
- [ ] Driver cannot spoof reviewed_by/reviewed_at/review_note
- [ ] Cross-user document read/update/delete rejected
- [ ] Storage path ownership enforced; cross-user read/upload/update denied
- [ ] Document/profile photo access matches private bucket design

## Gate 4 — Ride/Shared Ride privacy
- [ ] LIVE listing exposes only approved public fields (no phone, documents, payment identifiers)
- [ ] Nonparticipants cannot read ride private fields/event history
- [ ] Passenger and driver contacts visible only for confirmed/eligible specific booking
- [ ] Multiple confirmed passengers get correct passenger-specific contact (no latest-booking ambiguity)
- [ ] Public listing never exposes contact numbers
- [ ] Shared Ride booking seat counts, duplicate active booking and self-booking constraints hold

## Gate 5 — Safety, location, notifications, events
- [ ] Anonymous event table read/write denied
- [ ] Nonparticipant event history denied
- [ ] Cross-user location read/write/delete denied
- [ ] Unapproved driver cannot go online
- [ ] Cross-user emergency contact CRUD denied
- [ ] Cross-user notification/token/preferences CRUD denied
- [ ] SOS sender spoofing rejected; cross-user SOS denied except admin
- [ ] Direct client ledger insert/update/delete denied

## Gate 6 — Admin operations
- [ ] Driver review requires admin and role=driver
- [ ] Partner review requires admin and role=partner
- [ ] Revoked/rejected driver online state is stopped
- [ ] Provider assignment requires approved online provider and matching category
- [ ] Referral approval eligibility threshold enforced
- [ ] Referral duplicate rewards are idempotent under sequential and concurrent requests

## Gate 7 — Evidence and sign-off
- [ ] Test each scenario in QA only
- [ ] Record test identity, request/action, expected, actual, timestamp, screenshot/log evidence
- [ ] Mark Pass only from actual execution evidence
- [ ] Failures logged with reproduction and remediation owner
- [ ] Production/Main untouched
- [ ] No schema/policy/migration changes without explicit approval

## Current status
Catalog review provides positive evidence of many authorization guards and participant/owner policies. Runtime verification is NOT executed and remains a release gate. Do not claim tests passed until evidence is recorded.
