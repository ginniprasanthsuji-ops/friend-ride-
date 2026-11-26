# FRIEND RIDE Phase 13 — Service Provider Registration / TASKO Static Review (2026-11-26)

## Scope
Static inspection of QA branch `index.html` (blob `6b18c4ae088c733c6d9b64139ad688573e3875e6`) and `qa/read-only-regression.sql` (blob `b341a1bf881bb326d08fc6fd4f48005a3663d8c8`). Production untouched.

## Findings
### Service Provider KYC registration
- Frontend requires logged-in account; validates name/address/emergency contact, 10-digit phone formats, passport-style photo (JPEG/PNG/WEBP, <=3 MB), identity document (JPEG/PNG/WEBP/PDF, <=5 MB), and terms checkbox.
- Uploads photo and identity document into `fr-service-provider-kyc` bucket under a folder based on current user ID; photo upload is removed if second upload fails.
- Application record is created with direct `fr_service_provider_applications` table INSERT and selected fields; status is set to pending. This is a frontend source observation, not a verified server-side authorization.
- If database INSERT fails after both uploads succeed, no cleanup is visible in the inspected handler; possible orphaned KYC files.
- Storage bucket policies, private/public status, user ownership enforcement, and Admin access restrictions were not verified. The read-only QA SQL inventories other expected buckets/policy names, but does not include this service-provider KYC bucket/policy set.
### TASKO booking
- Customer-role check in frontend.
- Validates category, hours/date/time, address, and work details; rejects past datetime.
- Direct insert to `fr_service_bookings` table; no RPC/server function found in inspected call-site.
- Frontend calculates a rate preview; the UI text states Admin quote/final confirmation. Payment is not verified in this source review.
- Server-side customer ownership, allowed fields, booking-state transitions, and price/quote integrity remain unverified.
### Home service provider list/assignment
- Customer call-site for `fr_customer_list_approved_service_providers` is present and sends category slug.
- Targeted repository search did not locate definitions for provider-list, Admin-assignment, or provider-update RPCs. Absence in source search is not evidence of absence in deployed DB.

## Evidence limits
- No database/RLS/storage execution.
- No authenticated runtime tests.
- No actual KYC uploads.
- No production changes or deployments.
- Tests executed this continuation: 0.

## Recommendation / release gate
Before release, verify server-side policies for `fr_service_provider_applications`, `fr-service-provider-kyc`, and `fr_service_bookings`; confirm authenticated user can create only own pending application/booking; Admin-only review/assignment; private KYC access with least privilege; and cleanup for uploads when application insert fails. Live evidence still required.
