'use strict';

const assert = require('node:assert/strict');
const { checkStatusTransition, validateOrderSummary, validateServiceRequestSummary } = require('../qa/orders-services-readiness-contract.cjs');

assert.equal(checkStatusTransition('order', 'pending', 'accepted').allowed, true);
assert.equal(checkStatusTransition('order', 'delivered', 'accepted').reason, 'invalid_transition');
assert.equal(checkStatusTransition('order', 'pending', 'cancelled').reason, 'cancellation_requires_explicit_ui_confirmation');
assert.equal(checkStatusTransition('order', 'pending', 'cancelled', { explicitUiConfirmation: true }).execution, 'not_performed');
assert.equal(checkStatusTransition('service', 'requested', 'quoted').allowed, true);
assert.equal(checkStatusTransition('service', 'completed', 'in_progress').reason, 'invalid_transition');
assert.equal(checkStatusTransition('service', 'requested', 'cancelled').allowed, false);
assert.equal(checkStatusTransition('other', 'x', 'y').reason, 'unsupported_domain');

assert.equal(validateOrderSummary({ orderId: 'O1', status: 'pending', total: 0, currency: 'INR' }).valid, true);
assert.equal(validateOrderSummary({ orderId: '', status: 'pending', total: 100, currency: 'INR' }).reason, 'missing_order_id');
assert.equal(validateOrderSummary({ orderId: 'O2', status: 'pending', total: -1, currency: 'INR' }).reason, 'invalid_total');
assert.equal(validateOrderSummary({ orderId: 'O3', status: 'pending', total: 100, currency: 'USD' }).reason, 'unsupported_currency');

assert.equal(validateServiceRequestSummary({ requestId: 'S1', status: 'requested', category: 'Laundry' }).valid, true);
assert.equal(validateServiceRequestSummary({ requestId: 'S2', status: 'unknown', category: 'Laundry' }).reason, 'invalid_status');
assert.equal(validateServiceRequestSummary({ requestId: 'S3', status: 'requested', category: '' }).reason, 'missing_category');

console.log('Orders & Services readiness contract tests: assertions defined (not executed in this environment).');
