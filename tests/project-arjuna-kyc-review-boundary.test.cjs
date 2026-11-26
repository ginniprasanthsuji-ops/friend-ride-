const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Project Arjuna KYC applicant cannot forge review metadata', () => {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '202611220014_arjuna_qa_kyc_review_boundary.sql'), 'utf8');
  const insertPolicy = sql.split('create policy qa_driver_documents_insert_own_pending')[1].split(';')[0];
  const updatePolicy = sql.split('create policy qa_driver_documents_update_own_pending')[1].split(';')[0];
  for (const policy of [insertPolicy, updatePolicy]) {
    for (const field of ['review_note is null','reviewed_by is null','reviewed_at is null','verification_status = \'pending\'']) {
      assert.ok(policy.includes(field), 'KYC review boundary: ' + field);
    }
  }
  assert.ok(updatePolicy.includes('using ('), 'update policy restricts the old row');
  assert.ok(updatePolicy.includes('with check ('), 'update policy restricts the new row');
});
