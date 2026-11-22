const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const coreMissing = [
  'fr_partner_list_market_orders',
  'fr_partner_update_market_order',
  'fr_get_platform_business_details',
  'fr_admin_save_platform_business_details',
  'fr_partner_save_location',
  'fr_customer_place_market_order',
  'fr_partner_save_catalogue_item',
  'fr_partner_list_catalogue',
  'fr_customer_list_partner_catalogue',
  'fr_partner_quote_market_order',
  'fr_customer_list_market_orders',
  'fr_customer_accept_market_quote',
  'fr_customer_counter_market_order',
  'fr_customer_create_parcel_request',
  'fr_driver_list_parcel_requests',
  'fr_driver_accept_parcel',
  'fr_customer_list_parcel_requests',
  'fr_customer_get_parcel_delivery_otp',
  'fr_driver_verify_parcel_delivery_otp',
  'fr_customer_place_multi_market_order'
];

test('Project Arjuna missing core RPC gaps remain explicitly documented until implemented', () => {
  const report = fs.readFileSync(path.join(__dirname, '..', 'qa', 'PROJECT-ARJUNA-MISSING-CORE-RPC-CONTRACTS.md'), 'utf8');
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  const migrations = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .map(file => fs.readFileSync(path.join(migrationsDir, file), 'utf8'))
    .join('\n');
  for (const rpc of coreMissing) {
    assert.ok(report.includes(rpc), 'audit report tracks ' + rpc);
    assert.ok(!new RegExp('create\\s+(?:or\\s+replace\\s+)?function\\s+(?:public\\.)?' + rpc + '\\s*\\(', 'i').test(migrations),
      rpc + ' must not be marked implemented without a reviewed migration');
  }
  assert.match(report, /Security \/ design requirements before implementation/i);
  assert.match(report, /No schema or runtime writes/i);
});
