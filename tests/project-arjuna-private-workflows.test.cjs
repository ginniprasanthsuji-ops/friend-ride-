const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Project Arjuna QA notification, SOS, and KYC tables have RLS and owner/admin checks', () => {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '202611220005_arjuna_qa_private_workflows.sql'), 'utf8');
  for (const table of ['fr_emergency_contacts','fr_push_subscriptions','fr_ride_notifications','fr_ride_sos','fr_driver_documents']) {
    assert.ok(sql.includes('create table if not exists public.' + table), 'table exists: ' + table);
    assert.ok(sql.includes('alter table public.' + table + ' enable row level security'), 'RLS enabled: ' + table);
  }
  assert.ok(sql.includes('user_id=auth.uid()'), 'owner-scoped notification and contact rules');
  assert.ok(sql.includes('sender_id=auth.uid()'), 'SOS sender ownership');
  assert.ok(sql.includes('verification_status=\'pending\''), 'driver KYC user can submit only pending docs');
  assert.ok(sql.includes('exists(select 1 from public.admin_users'), 'admin membership is required for review');
  assert.ok(!/grant .* to anon/i.test(sql), 'no anon grants');
});
