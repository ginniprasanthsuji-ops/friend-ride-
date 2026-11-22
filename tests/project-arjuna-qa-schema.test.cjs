const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Project Arjuna QA core migration enables owner/participant RLS and excludes anon grants', () => {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '202611220003_arjuna_qa_core_schema_parity.sql'), 'utf8');
  for (const table of ['profiles','driver_locations','ride_live_locations','fr_app_notifications']) {
    assert.ok(sql.includes('create table if not exists public.' + table), 'idempotent create for ' + table);
    assert.ok(sql.includes('alter table public.' + table + ' enable row level security'), 'RLS enabled for ' + table);
  }
  assert.ok(sql.includes("role in ('customer','driver','partner')"), 'self-registration cannot create admin role');
  assert.ok(sql.includes('driver_id=auth.uid()'), 'driver location owner condition');
  assert.ok(sql.includes('r.customer_id=auth.uid() or r.driver_id=auth.uid()'), 'ride tracking participant condition');
  assert.match(sql,/for update to authenticated[\\s\\S]*with check\\(user_id=auth\.uid\(\) and exists\(select 1 from public\.rides r where r\.id=ride_id and \(r\.customer_id=auth\.uid\(\) or r\.driver_id=auth\.uid\(\)\)\)\)/i, 'live-location updates must retain ride participant boundary');
  assert.ok(sql.includes('user_id=auth.uid()'), 'notification ownership');
  assert.ok(sql.includes('grant select,insert,update on public.profiles to authenticated'));
  assert.ok(!/grant .* to anon/i.test(sql), 'no anon grants');
});
