const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Project Arjuna marketplace/parcel schema design covers required safety controls', () => {
  const file = path.join(__dirname, '..', 'qa', 'PROJECT-ARJUNA-MARKET-PARCEL-SCHEMA-DESIGN.md');
  const design = fs.readFileSync(file, 'utf8');
  for (const phrase of [
    'Status:** Design proposal; NOT an applied migration',
    'fr_stores',
    'fr_catalogue_items',
    'fr_market_orders',
    'fr_market_order_items',
    'fr_market_order_quotes',
    'fr_market_order_quote_items',
    'fr_parcel_requests',
    'fr_parcel_delivery_otp',
    'Append-only transition history',
    'RLS enabled on every table; default deny',
    'derive \`auth.uid()\`',
    'atomically',
    'double-accept',
    'expired',
    'client price tampering',
    'cross-customer order/parcel access denied',
    'No production SQL, no deploy, no merge'
  ]) assert.ok(design.includes(phrase), 'schema proposal must cover: ' + phrase);
});
