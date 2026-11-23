// Phase 8.12 — cross-module workflow consistency contract assertions
'use strict';
const assert = require('node:assert/strict');
const c = require('../qa/cross-module-workflow-consistency-contract.cjs');

assert.equal(c.MODULES.length, 6);
for (const m of c.MODULES) assert.equal(c.validModule(m), true);
assert.equal(c.validModule('unknown'), false);
assert.equal(c.validStatus('ride','draft'), true);
assert.equal(c.validStatus('ride','fake_status'), false);

// Lifecycle transition allow/deny
assert.equal(c.canTransition('ride','draft','review'), true);
assert.equal(c.canTransition('ride','draft','completed'), false);
assert.equal(c.canTransition('marketplace','cart','review'), true);
assert.equal(c.canTransition('orders','confirmed','assigned'), true);
assert.equal(c.canTransition('services','assigned','in_progress'), true);
assert.equal(c.canTransition('tasko_laundry','in_progress','completed'), true);
assert.equal(c.canTransition('education','enrollment_review','enrolled'), true);
assert.equal(c.canTransition('education','browse','active'), false);

// Ownership guard
assert.equal(c.checkOwnership({customer_id:'cust1'},'cust1'), true);
assert.equal(c.checkOwnership({customer_id:'cust1'},'cust2'), false);
assert.equal(c.checkOwnership(null,'cust1'), false);

// Cross-module references/validation
assert.equal(c.checkCrossModuleRecord('ride',{ride_id:'r1',customer_id:'c1',pickup_confirmed:true,drop_confirmed:true}).valid,true);
assert.equal(c.checkCrossModuleRecord('ride',{ride_id:'r1',customer_id:'c1',pickup_confirmed:false,drop_confirmed:true}).reason,'locations_not_confirmed');
assert.equal(c.checkCrossModuleRecord('ride',{ride_id:'r1',customer_id:'c1',pickup_confirmed:true,drop_confirmed:true,pickup_id:'p',drop_id:'p'}).reason,'pickup_drop_same');
assert.equal(c.checkCrossModuleRecord('marketplace_order',{store_id:'s1',order_store_id:'s2',customer_id:'c1',order_id:'o1'}).reason,'store_order_mismatch');
assert.equal(c.checkCrossModuleRecord('marketplace_order',{store_id:'s1',order_store_id:'s1',customer_id:'c1',order_id:'o1'}).valid,true);
assert.equal(c.checkCrossModuleRecord('service',{request_id:'q1',customer_id:'c1',category:'cleaning'}).valid,true);
assert.equal(c.checkCrossModuleRecord('tasko_laundry',{request_id:'q1',customer_id:'c1',service_type:'laundry'}).valid,true);
assert.equal(c.checkCrossModuleRecord('education',{enrollment_id:'e1',student_id:'st1',course_id:'co1'}).valid,true);
assert.equal(c.checkCrossModuleRecord('invalid_kind',{}).valid,false);

// Confirmations and role-contract gate
assert.equal(c.checkWorkflowConsistency({moduleName:'ride',currentStatus:'draft',nextStatus:'review'}).consistent,true);
assert.equal(c.checkWorkflowConsistency({moduleName:'ride',currentStatus:'review',nextStatus:'confirmed'}).reason,'confirmation_required');
assert.equal(c.checkWorkflowConsistency({moduleName:'ride',currentStatus:'review',nextStatus:'confirmed',confirmed:true}).consistent,true);
assert.equal(c.checkWorkflowConsistency({moduleName:'orders',currentStatus:'confirmed',nextStatus:'assigned',role:'driver',action:'update_assigned'}).reason,'role_contract_not_confirmed');
assert.equal(c.checkWorkflowConsistency({moduleName:'orders',currentStatus:'confirmed',nextStatus:'assigned',role:'driver',action:'update_assigned',roleContractAllowed:true}).consistent,true);
assert.equal(c.checkWorkflowConsistency({moduleName:'ride',currentStatus:'draft',nextStatus:'cancelled'}).reason,'confirmation_required');
assert.equal(c.checkWorkflowConsistency({moduleName:'unknown',currentStatus:'draft',nextStatus:'review'}).reason,'unknown_module');

console.log('Cross-module workflow contract: assertions authored (not executed).');
