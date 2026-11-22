const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Project Arjuna QA ride lifecycle RPC migration includes authenticated role gates and no anon execution', () => {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '202611220007_arjuna_qa_ride_lifecycle_rpcs.sql'), 'utf8');
  for (const fn of ['get_driver_requests','accept_ride','counter_offer_ride','accept_counter_offer','decline_counter_offer','fr_customer_list_nearby_drivers','fr_driver_start_ride','fr_driver_complete_ride','get_ride_driver_details','get_ride_customer_details_v2']) {
    assert.ok(sql.includes('function public.' + fn), 'RPC implemented: ' + fn);
  }
  assert.match(sql, /security definer set search_path=''/i);
  assert.match(sql, /driver_approval_status='approved'/i);
  assert.match(sql, /customer_id=auth\.uid\(\)/i);
  assert.match(sql, /revoke all on function .* from public,anon/i);
  assert.match(sql, /grant execute on function .* to authenticated/i);
  assert.ok(sql.includes('Payment-provider integration is deferred'));
});
