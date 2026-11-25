const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const root = join(__dirname, '..');
const applied = readFileSync(join(root, 'qa/phase13-client-maintenance-privilege-hardening-applied-qa.sql'), 'utf8');
const audit = readFileSync(join(root, 'qa/phase13-readonly-security-audit-assertions.sql'), 'utf8');
const sharedDraft = readFileSync(join(root, 'qa/phase13-shared-ride-role-and-privilege-hardening-draft.sql'), 'utf8');

test('QA applied hardening revokes TRUNCATE and MAINTAIN from client roles on existing public tables', () => {
  assert.match(applied, /REVOKE TRUNCATE, MAINTAIN ON ALL TABLES IN SCHEMA public FROM anon, authenticated/i);
});

test('QA future table defaults for postgres owner revoke client TRUNCATE and MAINTAIN', () => {
  assert.match(applied, /ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE TRUNCATE, MAINTAIN ON TABLES FROM anon, authenticated/i);
});

test('Read-only inventory checks current and postgres-owned future client grants', () => {
  assert.match(audit, /public_client_truncate_grants/);
  assert.match(audit, /public_client_maintain_grants/);
  assert.match(audit, /postgres_default_client_truncate_maintain_grants/);
  assert.match(audit, /supabase_admin_default_client_truncate_maintain_grants/);
});

test('Shared Ride draft includes the same least-privilege cleanup and documents the owner-role limitation', () => {
  assert.match(sharedDraft, /revoke truncate, maintain on all tables in schema public from anon,authenticated/i);
  assert.match(sharedDraft, /alter default privileges for role postgres in schema public revoke truncate, maintain/i);
  assert.match(sharedDraft, /Supabase-managed default ACL for supabase_admin was observed to include both privileges/i);
  assert.match(sharedDraft, /blocked by the current SQL connection's role membership/i);
});
