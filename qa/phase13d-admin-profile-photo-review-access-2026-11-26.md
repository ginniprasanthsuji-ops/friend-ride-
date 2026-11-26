# Phase 13D — Admin Profile Photo Review Access (2026-11-26)

## Finding
Profile-photo buckets were private and owner-only. The QA profiles table had an admin read policy for driver rows, but storage admin-read policies for driver and partner profile photo buckets were absent. Admin review could therefore lack photo access.

## Remediation
QA-only migration `20261126000800_phase13d_admin_profile_photo_review_read.sql` adds SELECT policies:
- Driver photo bucket: admin_users membership required.
- Partner photo bucket: admin_users membership required.
- No customer-photo admin access added.
- No public bucket access; owners retain their own-folder rules.

## Verification
Catalog check confirms both policies exist with SELECT command. Static/catalog only; signed URL/runtime admin image preview and non-admin denial remain untested pending controlled QA identities.

## Scope
Dedicated QA project only. Main/Production untouched.
