const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Project Arjuna customer ride insert must start unassigned and requested', () => {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '202611220016_arjuna_qa_ride_insert_boundary.sql'), 'utf8');
  const policy = sql.split('create policy "QA customers insert own rides"')[1].split(';')[0];
  for (const field of ['(select auth.uid()) = customer_id','driver_id is null','status = \'requested\'','agreed_fare is null']) {
    assert.ok(policy.includes(field), 'ride insert boundary: ' + field);
  }
});
