const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const root = join(__dirname, '..');
const audit = readFileSync(join(root, 'qa/phase13c-ers-rrs-focused-readonly-audit.sql'), 'utf8');

test('Phase 13C ERS/RRS audit is read-only and checks function execute grants', () => {
  assert.match(audit, /has_function_privilege\('anon',f\.oid,'EXECUTE'\)/);
  assert.match(audit, /has_function_privilege\('authenticated',f\.oid,'EXECUTE'\)/);
  const executable = audit.replace(/--[^\n]*|\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(executable, /^\s*(?:insert|update|delete|create|alter|drop|grant|revoke|truncate|commit|begin)\s/im);
});

test('audit flags the live single-passenger LIMIT 1 contact behavior', () => {
  assert.match(audit, /participant_contact_single_row_limit/);
  assert.match(audit, /order by b\.created_at desc limit 1/i);
});
