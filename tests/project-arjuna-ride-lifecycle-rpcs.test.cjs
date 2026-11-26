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

test('Ride workflow is guarded by state, ownership, driver approval, proximity and freshness', () => {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '202611220007_arjuna_qa_ride_lifecycle_rpcs.sql'), 'utf8');
  const accept = sql.match(/create or replace function public\.accept_ride[\s\S]*?end \$;/i)?.[0] || '';
  const counter = sql.match(/create or replace function public\.counter_offer_ride[\s\S]*?end \$;/i)?.[0] || '';
  const start = sql.match(/create or replace function public\.fr_driver_start_ride[\s\S]*?end \$\$;/i)?.[0] || '';
  const complete = sql.match(/create or replace function public\.fr_driver_complete_ride[\s\S]*?end \$\$;/i)?.[0] || '';
  assert.match(accept, /driver_id is null and r\.status='requested'/i, 'accept only unassigned requested rides');
  assert.match(accept, /updated_at>=now\(\)-interval '5 minutes'/i, 'driver GPS freshness enforced');
  assert.match(accept, /<=15/i, '15km proximity enforced');
  assert.match(accept, /advisory_xact_lock/i, 'driver active-ride concurrency lock');
  assert.match(counter, /r\.status='requested'/i, 'counter-offer only from requested ride');
  assert.match(counter, /agreed_fare=p_counter_fare/i, 'counter fare recorded');
  assert.match(start, /driver_id=auth\.uid\(\) and status='accepted'/i, 'only assigned driver starts accepted ride');
  assert.match(complete, /driver_id=auth\.uid\(\) and status='ongoing'/i, 'only assigned driver completes ongoing ride');
  assert.match(complete, /completed_at=now\(\)/i, 'completion timestamp set');
  assert.match(complete, /delete from public\.ride_live_locations/i, 'live location cleanup after completion');
});

test('Customer counter-offer accept and decline are owner-bound and state-limited', () => {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '202611220007_arjuna_qa_ride_lifecycle_rpcs.sql'), 'utf8');
  const accept = sql.match(/create or replace function public\.accept_counter_offer[\s\S]*?end \$\$;/i)?.[0] || '';
  const decline = sql.match(/create or replace function public\.decline_counter_offer[\s\S]*?end \$\$;/i)?.[0] || '';
  assert.match(accept, /customer_id=auth\.uid\(\) and status='counter_offered'/i);
  assert.match(accept, /driver_id is not null and agreed_fare is not null/i);
  assert.match(decline, /customer_id=auth\.uid\(\) and status='counter_offered'/i);
  assert.match(decline, /driver_id\s*=\s*null\s*,\s*agreed_fare\s*=\s*null/i);
});


test('Ride UI calls lifecycle RPCs and does not claim automatic payment verification', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  for (const rpc of ['accept_ride','counter_offer_ride','accept_counter_offer','decline_counter_offer','fr_driver_start_ride','fr_driver_complete_ride','get_driver_requests']) {
    assert.ok(html.includes("rpc('" + rpc + "'") || html.includes("rpc(\\\"" + rpc + "\\\""), 'UI invokes lifecycle RPC: ' + rpc);
  }
  assert.match(html, /Automatic payment verification.*QA scope/i);
  assert.doesNotMatch(html, /Ride Completed[^.]*Payment.*automatically/i);
});
