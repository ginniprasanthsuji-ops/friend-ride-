const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Project Arjuna customer ride insert must start unassigned/requested with valid coordinates and fare', () => {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '202611220019_arjuna_qa_ride_location_bounds.sql'), 'utf8');
  const policy = sql.split('create policy "QA customers insert own rides"')[1].split(';')[0].replace(/\\s+/g, ' ');
  for (const field of [
    '(select auth.uid()) = customer_id',
    'driver_id is null',
    "status = 'requested'",
    'agreed_fare is null',
    'pickup_lat is not null and pickup_lat between -90 and 90',
    'pickup_lng is not null and pickup_lng between -180 and 180',
    'drop_lat is not null and drop_lat between -90 and 90',
    'drop_lng is not null and drop_lng between -180 and 180',
    "nullif(btrim(pickup), '') is not null",
    "nullif(btrim(drop), '') is not null",
    'fare_offer is not null and fare_offer > 0'
  ]) {
    assert.ok(policy.includes(field), 'ride insert boundary: ' + field);
  }
});
