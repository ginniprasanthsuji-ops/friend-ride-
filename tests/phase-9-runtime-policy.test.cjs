'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {evaluateRuntimeRequest, assertSessionIsolation, safeDiagnostic} = require('../qa/arjuna-x-runtime-policy.cjs');

const base = {sessionId:'session-a', role:'customer', permissions:[], correlationId:'corr-123', intent:{type:'navigate',target:'home'}};

test('safe navigation produces proposal only, with no side effects', () => {
  const result = evaluateRuntimeRequest(base);
  assert.equal(result.status, 'proposal');
  assert.deepEqual(result.action, {type:'navigate',target:'home'});
  assert.equal(result.sideEffects, false);
});

test('allowlisted ride selection is customer-only and draft proposal', () => {
  assert.equal(evaluateRuntimeRequest({...base,intent:{type:'select_ride',rideType:'bike'}}).status,'proposal');
  assert.equal(evaluateRuntimeRequest({...base,role:'driver',intent:{type:'select_ride',rideType:'bike'}}).status,'blocked');
  assert.equal(evaluateRuntimeRequest({...base,intent:{type:'select_ride',rideType:'truck'}}).status,'blocked');
});

test('booking review requires explicit in-app confirmation and is not executed', () => {
  const result=evaluateRuntimeRequest({...base,intent:{type:'review_booking',requiresConfirmation:true,execution:'none'}});
  assert.equal(result.status,'confirmation_required');
  assert.equal(result.confirmation,'explicit_in_app');
  assert.equal(result.sideEffects,false);
  assert.equal(evaluateRuntimeRequest({...base,intent:{type:'review_booking',requiresConfirmation:true,execution:'book_now'}}).status,'blocked');
});

test('payment, cancellation, unknown and injected intents fail closed', () => {
  for (const intent of [
    {type:'pay',amount:100},{type:'cancel_ride',rideId:'x'},
    {type:'unknown',reason:'unrecognized'},{type:'navigate',target:'admin'},
    {type:'navigate',target:'../../admin'},{type:'select_ride',rideType:'car',execute:true}
  ]) assert.equal(evaluateRuntimeRequest({...base,intent}).status,'blocked',JSON.stringify(intent));
});

test('invalid session, role and permission payload fail closed', () => {
  assert.equal(evaluateRuntimeRequest({...base,sessionId:''}).reason,'missing_session');
  assert.equal(evaluateRuntimeRequest({...base,role:'superuser'}).reason,'invalid_role');
  assert.equal(evaluateRuntimeRequest({...base,permissions:'all'}).reason,'invalid_permissions');
  assert.equal(evaluateRuntimeRequest(null).status,'blocked');
});

test('session isolation rejects cross-session requests', () => {
  assert.equal(assertSessionIsolation('s1','s1').status,'ok');
  assert.equal(assertSessionIsolation('s1','s2').reason,'session_mismatch');
  assert.equal(assertSessionIsolation(null,'s1').status,'blocked');
});

test('diagnostics redact arbitrary strings and keep compact codes', () => {
  const diagnostic=safeDiagnostic('bad code / phone 9876543210','correlation:9876543210');
  assert.match(diagnostic.code,/^[a-z0-9_]+$/i);
  assert.doesNotMatch(JSON.stringify(diagnostic),/9876543210|phone/i);\n  assert.equal(diagnostic.correlationId, undefined);
});
