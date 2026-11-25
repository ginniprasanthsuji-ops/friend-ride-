# Phase 12 QA — Admin Privileged Function Review
Date: 2026-11-25
Scope: QA project pqsangtvietawkfgpgfu only. Static function-definition/grant review; no runtime testing. Production untouched.

## Functions reviewed
- admin_list_driver_applications()
- admin_list_driver_documents()
- admin_review_driver(uuid,text)
- admin_review_driver_document(uuid,text,text)
- fr_admin_assign_service_provider(uuid,uuid)
- fr_admin_confirm_pending_earning(uuid)
- fr_admin_list_partner_applications()
- fr_admin_post_earnings_ledger(uuid,text,text,text,uuid,numeric,text,text,text)
- fr_admin_review_partner(uuid,text)

All observed functions are SECURITY DEFINER. anon EXECUTE=false; authenticated EXECUTE=true. Most set empty search_path. Two ledger functions use search_path=public.

## Authorization checks
Each reviewed function checks membership in public.admin_users against auth.uid() before privileged work.
Decision inputs are validated for driver/partner approval and document review.
Service-provider assignment checks request status and provider category, approval and online state.
Ledger posting validates amount, owner role, entry type, source type and status; direct confirmed posting is restricted to admin_adjustment. Pending earning confirmation checks admin membership and pending credit state and uses idempotency keys.

## Hardening note
The two ledger functions with search_path=public are a search-path hardening item to review. No exploit was demonstrated; their table references and runtime behavior need verification. Prefer explicit qualification and an empty search_path where practical, but do not change without approval.

## Admin bootstrap/membership management
Repository keyword search for admin_users INSERT/bootstrap/seed returned no matching result in this scoped search. This is not proof no bootstrap path exists. Admin provisioning process remains unknown.

## Pending verification
- Runtime negative tests as non-admin for each privileged function.
- Admin membership bootstrap/provisioning audit.
- Review ledger SECURITY DEFINER search_path hardening.
- Confirm service-role credentials remain server-only.
- End-to-end role/approval workflows and release gates.
