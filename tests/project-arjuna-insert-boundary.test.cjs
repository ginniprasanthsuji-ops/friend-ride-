const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Project Arjuna customer inserts cannot forge booking payment/provider state or provider-review state', () => {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '202611220013_arjuna_qa_insert_boundary_hardening.sql'), 'utf8');
  const bookingPolicy = sql.split('create policy qa_service_booking_customer_insert')[1].split(';')[0];
  for (const field of ['assigned_provider_id is null','quoted_amount is null','actual_hours is null','final_amount is null','payment_reference is null','payment_submitted_at is null','payment_verified_at is null','payment_verified_by is null','laundry_unit_price is null']) {
    assert.ok(bookingPolicy.includes(field), 'booking insert boundary: ' + field);
  }
  const providerPolicy = sql.split('create policy qa_provider_application_insert_own')[1].split(';')[0];
  for (const field of ['status = \'pending\'','admin_notes is null','reviewed_by is null','reviewed_at is null']) {
    assert.ok(providerPolicy.includes(field), 'provider application boundary: ' + field);
  }
});
