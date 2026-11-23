const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const sql = fs.readFileSync(path.join(__dirname, '..', 'qa', 'read-only-regression.sql'), 'utf8');
const expectedTables = [
  'admin_users','driver_locations','fr_app_notifications','fr_bank_enquiries',
  'fr_driver_documents','fr_emergency_contacts','fr_push_subscriptions',
  'fr_ride_notifications','fr_ride_sos','fr_service_bookings','fr_service_categories',
  'fr_service_provider_applications','fr_service_providers','fr_service_requests',
  'fr_support_feedback','profiles','ride_live_locations','rides'
];

test('QA SQL contains least-privilege checks for all sampled anon-grant tables', () => {
  for (const table of expectedTables) assert.ok(sql.includes(`('${table}')`), `missing table check: ${table}`);
  assert.match(sql, /ANON TABLE GRANTS/);
  assert.match(sql, /grantee='anon'/);
  assert.match(sql, /relrowsecurity/);
  assert.match(sql, /ANON\/PUBLIC POLICY/);
  assert.match(sql, /pg_policies/);
});
