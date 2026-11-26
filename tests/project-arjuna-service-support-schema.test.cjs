const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Project Arjuna QA service/support schema has owner/admin scoped RLS', () => {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '202611220006_arjuna_qa_service_support_schema.sql'), 'utf8');
  for (const table of ['fr_bank_enquiries','fr_service_bookings','fr_service_provider_applications','fr_support_feedback']) {
    assert.ok(sql.includes('create table if not exists public.' + table), 'table: ' + table);
    assert.ok(sql.includes('alter table public.' + table + ' enable row level security'), 'RLS: ' + table);
  }
  assert.ok(sql.includes('user_id=auth.uid()'), 'owner check for enquiries and feedback');
  assert.ok(sql.includes('provider_id=auth.uid() and status=\'pending\''), 'provider application owner and pending status');
  assert.ok(sql.includes('customer_id=auth.uid() and status=\'pending\' and payment_status=\'not_due\''), 'booking insert default state');
  assert.ok(sql.includes('exists(select 1 from public.admin_users'), 'admin membership gate');
  assert.ok(!/grant .* to anon/i.test(sql), 'no anonymous grants');
});
