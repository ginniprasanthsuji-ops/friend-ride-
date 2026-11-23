const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const migration = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '202611230001_fr_notification_claim_batch.sql'), 'utf8');
const dispatch = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'functions', 'fr-notification-dispatch', 'index.ts'), 'utf8');

test('notification queue migration adds processing lease and SKIP LOCKED claim', () => {
  assert.match(migration, /ADD COLUMN IF NOT EXISTS claim_token uuid/i);
  assert.match(migration, /ADD COLUMN IF NOT EXISTS claimed_at timestamptz/i);
  assert.match(migration, /'processing'/i);
  assert.match(migration, /FOR UPDATE SKIP LOCKED/i);
  assert.match(migration, /fr_notification_claim_batch/i);
  assert.match(migration, /GRANT EXECUTE[\s\S]*TO service_role/i);
  assert.match(migration, /REVOKE ALL[\s\S]*FROM PUBLIC, anon, authenticated/i);
});

test('dispatch claims before send and finalizes only rows owned by its claim token', () => {
  assert.match(dispatch, /rpc\(["']fr_notification_claim_batch["']/);
  assert.match(dispatch, /claim_token: null, claimed_at: null/);
  assert.match(dispatch, /\.eq\(["']claim_token["'], claimToken\)/);
  assert.match(dispatch, /status: ["']processing["']/);
  assert.doesNotMatch(dispatch, /\.select\(["']\*["']\)\.eq\(["']status["'], ["']queued["']\)/);
});
