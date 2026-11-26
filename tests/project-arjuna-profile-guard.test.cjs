const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Project Arjuna profile security guard blocks non-admin role and approval self-promotion', () => {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '202611220004_arjuna_profile_privilege_guard.sql'), 'utf8');
  assert.match(sql, /security definer set search_path=public/i);
  assert.match(sql, /new\.role is distinct from old\.role/i);
  assert.match(sql, /new\.driver_approval_status is distinct from old\.driver_approval_status/i);
  assert.match(sql, /new\.partner_approval_status is distinct from old\.partner_approval_status/i);
  assert.match(sql, /not exists\(select 1 from public\.admin_users/i);
  assert.match(sql, /revoke all on function .* from public, anon, authenticated/i);
  assert.match(sql, /qa_profiles_admin_read_drivers/i);
});
