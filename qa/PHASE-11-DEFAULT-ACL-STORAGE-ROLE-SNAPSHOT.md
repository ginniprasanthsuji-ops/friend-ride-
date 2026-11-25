# Phase 11 — Default ACL, Storage, and Role Escalation Snapshot

**Project:** QA Supabase `pqsangtvietawkfgpgfu`  
**Method:** Read-only catalog inspection. No migrations or ACL changes applied.

## 1. Default privileges (catalog snapshot)
Default ACL entries exist for `public` schema objects:
- Tables: default entries include anon, authenticated, service_role, postgres with broad CRUD/table privileges (including TRUNCATE/REFERENCES/TRIGGER).
- Functions: default entries include EXECUTE for anon, authenticated, service_role, postgres.
- Sequences: default entries include sequence usage/select/update for anon, authenticated, service_role, postgres.
The catalog showed entries owned by both postgres and supabase_admin, so defaults must be reviewed owner-by-owner. This is a high-priority least-privilege concern for future objects; default privileges affect newly created objects under the relevant owner/schema and are not retroactive.

## 2. Storage
Current QA snapshot:
- Storage buckets: **0**
- Storage policies: **0**
Thus photo/document upload storage is not configured or security-verifiable in this QA project snapshot. This does not prove production storage state.

## 3. Role capability snapshot
- `anon`: no superuser, create-role, create-db, replication, or bypass-RLS attributes.
- `authenticated`: same restricted role attributes; bypass-RLS false.
- `service_role`: bypass-RLS true (expected privileged backend role; secret must never be client-exposed).
- `supabase_admin`: superuser and privileged role attributes (platform role).
- `postgres`: create-role/create-db/replication and bypass-RLS attributes shown; superuser false in this catalog snapshot.
No memberships were returned for anon/authenticated/service_role in the filtered membership query (result set not present in tool response; treat membership evidence as incomplete rather than confirmed absence).

## 4. Findings and gates
1. **High:** Public-schema default privileges appear broad for anon/authenticated on tables, functions, and sequences. Validate exact defaults for each object owner and schema, then narrow defaults in a reviewed migration.
2. **High/Release blocker:** Storage has no QA buckets/policies. Define intended private buckets and role/owner policies before profile photos, driver documents, partner/provider photos, or other sensitive uploads are enabled.
3. **Positive:** anon/authenticated role attributes do not show bypass-RLS or privileged role-creation capabilities in this snapshot.
4. **Critical secret handling gate:** service_role is BYPASSRLS; ensure it remains server-only and never bundled in client app, repo, or logs.
5. Existing default ACLs are not proof that every object is exploitable; verify actual object grants, RLS, function checks, and application dependency before remediation.

## Status
Catalog evidence documented. No QA or production changes. Runtime role tests, owner-by-owner default ACL verification, storage design, and migration drift remain pending.
