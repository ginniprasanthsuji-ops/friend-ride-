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

test('KYC owner update policy cannot change review status out of pending', () => {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '202611220005_arjuna_qa_private_workflows.sql'), 'utf8');
  const ownerStart = sql.indexOf('create policy qa_driver_documents_update_own_pending');
  const ownerPolicy = ownerStart >= 0 ? sql.slice(ownerStart, sql.indexOf(';', ownerStart) + 1) : '';
  assert.match(ownerPolicy, /using\\s*\\(owner_id=auth\\.uid\\(\\)\\s+and\\s+verification_status='pending'\\)/i);
  assert.match(ownerPolicy, /with check\\s*\\(owner_id=auth\\.uid\\(\\)\\s+and\\s+driver_id=auth\\.uid\\(\\)\\s+and\\s+verification_status='pending'\\)/i);
  assert.doesNotMatch(ownerPolicy, /verification_status\\s*<>\\s*'pending'/i);
});

test('KYC review updates require admin membership in both USING and WITH CHECK', () => {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '202611220005_arjuna_qa_private_workflows.sql'), 'utf8');
  const adminStart = sql.indexOf('create policy qa_driver_documents_admin_review');
  const adminPolicy = adminStart >= 0 ? sql.slice(adminStart, sql.indexOf(';', adminStart) + 1) : '';
  assert.match(adminPolicy, /using\\s*\\(exists\\s*\\(select 1 from public\\.admin_users a where a\\.user_id=auth\\.uid\\(\\)\\)\\)/i);
  assert.match(adminPolicy, /with check\\s*\\(exists\\s*\\(select 1 from public\\.admin_users a where a\\.user_id=auth\\.uid\\(\\)\\)\\)/i);
});
