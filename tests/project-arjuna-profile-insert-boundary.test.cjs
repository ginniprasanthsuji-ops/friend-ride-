const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Project Arjuna profile insert cannot self-approve driver or partner status', () => {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '202611220015_arjuna_qa_profile_insert_boundary.sql'), 'utf8');
  const policy = sql.split('create policy qa_profiles_insert_own')[1].split(';')[0];
  for (const field of ['id = auth.uid()','role in (\'customer\',\'driver\',\'partner\')','driver_approval_status = \'pending\'','partner_approval_status = \'pending\'']) {
    assert.ok(policy.includes(field), 'profile insert boundary: ' + field);
  }
});
