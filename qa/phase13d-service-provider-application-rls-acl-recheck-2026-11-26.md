# Phase 13D QA — Service Provider Application RLS/ACL Recheck (2026-11-26)

## Scope
Read-only metadata review in QA Supabase project `pqsangtvietawkfgpgfu`. Production/Main untouched; no SQL writes, data changes, or runtime impersonation tests.

## Current catalog evidence
Table: `public.fr_service_provider_applications`
- RLS enabled; FORCE RLS is false.
- Authenticated table-level grants include SELECT, INSERT, UPDATE, DELETE.
- Policies present:
  - SELECT: `qa_provider_application_read_own_admin` — provider can read own rows; admin membership (`admin_users.user_id = auth.uid()`) can read.
  - INSERT: `qa_provider_application_insert_own` — `provider_id = auth.uid()` and initial `status = 'pending'`.
  - UPDATE: `qa_provider_application_admin_update` — admin membership required in both USING and WITH CHECK.
  - No DELETE policy returned. The authenticated DELETE grant is therefore not evidence of effective delete access; RLS is expected to block ordinary deletion, but runtime test is not performed.

## Required-column contract
Non-null columns include `provider_id`, `service_category`, `full_name`, `phone`, `full_address`, `profile_photo_path`, `identity_document_path`, `identity_document_type`, `emergency_contact_name`, `emergency_contact_phone`, `reference_friend_consent`, `status`, `created_at`, and `updated_at`. This schema requires profile photo and identity-document paths.

## Reconciliation
The frozen 13D handover's initial metadata check reported no policies. This later read-only recheck now returns three policies with the names and predicates above. Treat the earlier no-policy observation as superseded by this current QA catalog snapshot; no change was made by this audit.

## Risk / follow-up
- RLS policies provide own-row provider insert/read and admin-only update; static predicates appear appropriately scoped.
- Authenticated DELETE grant should be reviewed for least-privilege cleanup, although no DELETE policy is present in this snapshot.
- Confirm frontend insert field names, storage bucket existence/policies for `fr-service-provider-kyc`, and runtime authenticated provider/admin/other-user isolation.
- Runtime insert/upload, role impersonation, and storage access were not tested.

## Frozen tracking
Phase 13C remains frozen at 91%; Planning/Checklist 88%, Overall Audit 12%; progress graph frozen. This report is QA-branch-only and does not modify Production/Main.
