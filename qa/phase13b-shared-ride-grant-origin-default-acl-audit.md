# Phase 13B — Grant Origin & Default ACL Audit

Date: 2026-11-26. QA catalog read-only.

## Direct ACLs / owners
- All 4 Shared Ride tables owned by `postgres`.
- `pg_class.relacl` contains explicit ACL arrays including `anon` and `authenticated` entries; no PUBLIC grant entry shown in those arrays.
- Table ACLs align with `postgres`-creator default ACL for public tables; default ACL currently grants broad privileges to anon/authenticated/service_role for tables created by postgres.
- This indicates the privilege pattern is likely default-privilege configuration rather than a unique Shared Ride-only grant. ACL provenance was not established beyond matching default ACL and owner; avoid claiming exact originating migration without migration source.

## Default privileges (public, creator postgres)
- Tables: broad all-table privileges granted to anon, authenticated, service_role.
- Functions: EXECUTE granted to anon, authenticated, service_role.
- Sequences: broad sequence privileges granted to anon, authenticated, service_role.
- `supabase_admin` also has public-schema defaults broadly granted for tables/functions/sequences.

## Remediation implication
- Shared Ride table-level revoke drafts alone do not fix future tables created by `postgres`; public-schema default privileges must be reviewed separately, with scope and compatibility impact.
- Do not change global/default ACLs without explicit approval and broad project dependency audit. Avoid revoking `authenticated` SELECT or service_role access indiscriminately.
- Stage a separate, narrow default-privilege review plan and list existing tables impacted by current default patterns before remediation.

No ACL/default privileges changed. No data rows read. Main/Production untouched.
