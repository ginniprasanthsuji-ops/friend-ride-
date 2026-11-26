const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const audit = readFileSync(join(__dirname, '..', 'qa', 'phase13c-source-to-qa-module-inventory.sql'), 'utf8');
const executable = audit.replace(/--[^\n]*|\/\*[\s\S]*?\*\//g, '');

test('Phase 13C module inventory is read-only', () => {
  assert.doesNotMatch(executable, /^\s*(?:insert|update|delete|create|alter|drop|grant|revoke|truncate|commit|begin)\s/im);
  assert.match(audit, /pg_get_functiondef/);
  assert.match(audit, /has_function_privilege/);
});

test('security/RLS and Admin inventory checks exist', () => {
  for (const token of ['rls_enabled','force_rls','client_truncate_maintain','definer_missing_search_path','admin_rows','admin_functions','admin_users_policy']) assert.ok(audit.includes(token), token);
});

test('core ride, payment/QR, catalogue/order, services, referral, Flash Sale, ERS/RRS inventories exist', () => {
  for (const module of ['core_ride','payment_qr','catalog_order','home_services','referral','flash_sale','ers_rrs']) assert.ok(audit.includes(`('${module}'`), module);
});

test('audit explicitly includes currently missing backend workflow endpoints', () => {
  for (const rpc of ['fr_customer_create_ride_payment','fr_customer_place_market_order','fr_tasko_submit_payment','fr_customer_special_day_set','fr_flash_sale_attach_order','fr_shared_ride_confirm_booking']) assert.ok(audit.includes(rpc), rpc);
});
