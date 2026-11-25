# Phase 11 — Owner-Specific Default ACL and Source Drift Check

**QA project:** `pqsangtvietawkfgpgfu`  
**Repository/branch reviewed:** `ginniprasanthsuji-ops/friend-ride-` / `phase-12-implementation-plan`  
**Method:** read-only catalog and GitHub search. No SQL or source changes except this QA documentation.

## 1. Owner-specific public default ACLs
The QA catalog confirmed separate default ACL entries for object owners **postgres** and **supabase_admin** in `public` schema. For both owners, the snapshot includes broad default access for anon, authenticated, and service_role:
- Tables: CRUD plus TRUNCATE, REFERENCES, TRIGGER (ACL notation includes `arwdDxtm`)
- Functions: EXECUTE (`X`)
- Sequences: SELECT/USAGE/UPDATE (`rwU`)

These are owner-specific defaults, so remediation must target both object owners and be reviewed for intended Supabase-managed objects. Defaults apply to future objects created by that owner in the schema, not retroactively.

## 2. Migration/source search
Repository GitHub search on the available default branch for `ALTER DEFAULT PRIVILEGES` returned no results. This is **not proof** that no such statement exists: code search coverage/branch visibility is limited and this review branch differs from the default branch.
Search results did surface existing migration files with explicit function privilege management, including laundry and TASKO/Gigger workflow migrations. These indicate function-level grant/revoke patterns exist, but do not establish complete table ACL/default ACL remediation.

## 3. Drift limitations
- No complete repository migration-tree enumeration or migration-history reconciliation was performed in this pass.
- Branch search vs deployed QA migration ledger comparison remains pending.
- Do not infer production state from QA catalog or repository search.
- GitHub search is partial evidence, not an exhaustive source scan.

## 4. Recommended next audit step
Read QA migration history and compare it to the branch migration file list, then review direct grant/revoke statements and owner-specific defaults in a migration-by-migration pass. Only after dependency mapping should least-privilege changes be drafted and approved.

## Status
Documented catalog evidence. No QA or production changes applied. Runtime tests and remediation remain pending.
