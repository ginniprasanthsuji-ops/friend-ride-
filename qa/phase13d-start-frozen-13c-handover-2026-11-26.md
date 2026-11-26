# FRIEND RIDE — Phase 13D Start / Frozen 13C Handover (2026-11-26)

## Decision / phase boundary
Phase 13C is frozen at 91%. Do not edit its progress or graph. Existing 13C evidence remains preserved. Phase 13D is now the active continuation label for new read-only QA audit work, carrying forward unresolved findings without altering Production/Main.

## Frozen values (unchanged)
- Phase 13C: 91% — frozen
- Planning/Checklist: 88% — frozen
- Overall Audit: 12% — frozen
- Progress graph: frozen
- Production/Main: untouched

## 13D carry-forward backlog
1. Frontend-to-QA storage bucket mapping mismatch: frontend uses profile photo, KYC, QR, and catalogue bucket names; QA storage catalog only listed `road-ride-driver-photos`. Runtime upload/access tests remain unverified.
2. Driver/Partner profile-photo enforcement: frontend required photo upload, but inspected `fr_register_driver_partner` RPC did not visibly require or validate photo path.
3. Home Service Provider application: frontend directly uploads to `fr-service-provider-kyc` then INSERTs into `fr_service_provider_applications`; QA table RLS enabled, no policies returned in metadata query; no runtime insert test. Storage bucket not in QA catalog.
4. Shared Ride role/contact guards and participant contact isolation require runtime validation; static findings retained from 13C.
5. Market checkout, parcel, payment, and provider workflows have frontend/backend RPC/catalog mismatches from 13C; continue catalog/signature/grant/definition checks.
6. External-device validations remain deferred: OTP/SMS, real push, separate-device live tracking.

## 13D first audit item — Home Service Provider application table ACL/RLS
Read-only metadata recheck returned:
- No rows from the queried `information_schema.table_privileges` for `fr_service_provider_applications`.
- No rows from `pg_policies` for this table.
- Table RLS enabled; FORCE RLS false (prior metadata).
- `fr_admin_assign_service_provider(p_request_id uuid,p_provider_id uuid)` and `fr_service_provider_update_request(p_request_id uuid,p_status text)` have execute ACL for authenticated/service_role/postgres; this does not prove they authorize the application submission or resolve its missing-policy metadata.
- No runtime access/insert test performed.

## Scope guard
Read-only QA Supabase project `pqsangtvietawkfgpgfu`; GitHub QA branch `arjuna-x/phase-13-feature-audit`. No SQL writes, migrations, storage uploads, or Production/Main access.

## Status
Phase 13D started with the above first read-only recheck. No percentage assigned yet; 13C remains frozen and its 91% is not transferred or altered.
