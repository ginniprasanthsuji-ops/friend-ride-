const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('food-order RLS read policy links delivery assignment to the order row', () => {
  const migration = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '202611220001_fix_food_order_delivery_partner_read_policy.sql'), 'utf8');
  assert.match(migration, /d\.order_id\s*=\s*fr_food_orders\.id/i);
  assert.match(migration, /d\.delivery_partner_id\s*=\s*auth\.uid\(\)/i);
  assert.match(migration, /customer_id\s*=\s*auth\.uid\(\)/i);
  assert.match(migration, /r\.owner_id\s*=\s*auth\.uid\(\)/i);
  assert.doesNotMatch(migration, /d\.order_id\s*=\s*d\.id/i);
});
