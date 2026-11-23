// Phase 8.13 — Data integrity & duplicate prevention assertions.
'use strict';
const assert = require('node:assert/strict');
const c = require('../qa/data-integrity-duplicate-prevention-contract.cjs');

assert.equal(c.validId('r-1'), true);
assert.equal(c.validId('  '), false);
assert.equal(c.validMoney(0), true);
assert.equal(c.validMoney(-1), false);
assert.equal(c.validMoney(NaN), false);
assert.equal(c.validTotal(110,100,10,0), true);
assert.equal(c.validTotal(120,100,10,0), false);
assert.equal(c.validTotal(-1,100,10,0), false);

// Duplicate ride/order/request identifier prevention.
assert.equal(c.checkDuplicate([{ride_id:'ride-1'}],{ride_id:'ride-1'},'ride_id').duplicate,true);
assert.equal(c.checkDuplicate([{order_id:'o1'}],{order_id:'o2'},'order_id').duplicate,false);
assert.equal(c.checkDuplicate([], {ride_id:''}, 'ride_id').reason,'missing_identifier');

// Repeated submit/idempotency key is rejected.
assert.equal(c.checkIdempotency(['submit-1'],'submit-1').reason,'repeated_submission');
assert.equal(c.checkIdempotency(['submit-1'],'submit-2').allowed,true);
assert.equal(c.checkIdempotency([], '').reason,'invalid_idempotency_key');

// Ownership and store identity checks.
assert.equal(c.checkOwnership({customer_id:'c1'},'c1'),true);
assert.equal(c.checkOwnership({customer_id:'c1'},'c2'),false);
assert.equal(c.checkOwnership(null,'c1'),false);
assert.equal(c.checkStoreOrderMatch({store_id:'s1',order_store_id:'s1'}),true);
assert.equal(c.checkStoreOrderMatch({store_id:'s1',order_store_id:'s2'}),false);

// Stale workflow-state protection.
assert.equal(c.checkWorkflowFreshness('confirmed','confirmed').fresh,true);
assert.equal(c.checkWorkflowFreshness('cancelled','confirmed').reason,'stale_state');
assert.equal(c.checkWorkflowFreshness('', 'confirmed').reason,'missing_state');

// Payload integrity checks.
assert.equal(c.checkCreatePayload('ride',{ride_id:'r1',customer_id:'c1'}).valid,true);
assert.equal(c.checkCreatePayload('ride',{ride_id:'r1',customer_id:'c1',total:-5}).reason,'invalid_total');
assert.equal(c.checkCreatePayload('ride',{total:50,items_total:40,fees:5}).reason,'total_mismatch');
assert.equal(c.checkCreatePayload('marketplace_order',{store_id:'s1',order_store_id:'s2'}).reason,'store_order_mismatch');
assert.equal(c.checkCreatePayload('marketplace_order',{store_id:'s1',order_store_id:'s1',order_id:'o1',customer_id:'c1'}).valid,true);
console.log('Phase 8.13 contract assertions authored; runtime execution pending.');
