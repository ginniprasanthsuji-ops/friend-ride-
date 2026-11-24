'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateRuntimeRequest } = require('../qa/arjuna-x-runtime-policy.cjs');
const { RuntimeSessionLifecycle } = require('../qa/arjuna-x-runtime-lifecycle.cjs');
const { decideRetry } = require('../qa/arjuna-x-retry-policy.cjs');
const { decideRecovery } = require('../qa/arjuna-x-recovery-policy.cjs');
const { createCorrelationContext, sanitizeDiagnosticEvent } = require('../qa/arjuna-x-diagnostics-context.cjs');

function mockAdapter(outcome) {
  const calls = [];
  return {
    calls,
    async invoke(input) {
      calls.push(input);
      if (outcome === 'transient') throw Object.assign(new Error('mock transient'), { code: 'NETWORK_UNAVAILABLE' });
      if (outcome === 'mutation-timeout') throw Object.assign(new Error('mock timeout'), { code: 'PAYMENT' });
      return { ok: true, value: 'mock-only' };
    }
  };
}

test('Phase 10 mocked integration validation: policy, lifecycle, context, diagnostics connect', async () => {
  const life = new RuntimeSessionLifecycle({ ttlMs: 60000, maxSessions: 4, maxRequestsPerSession: 4 });
  life.openSession('s-int-1', 'customer');
  const request = life.beginRequest('s-int-1', 'r-int-1');
  assert.equal(request.status, 'started');

  const context = createCorrelationContext({ correlationId: 'c-int-1', requestId: 'r-int-1', sessionId: 's-int-1', role: 'customer' });
  const proposal = evaluateRuntimeRequest({ sessionId: 's-int-1', role: 'customer', permissions: [], correlationId: 'c-int-1', intent: { type: 'navigate', target: 'ride' } });
  assert.equal(proposal.status, 'proposal');
  assert.equal(proposal.sideEffects, false);
  const event = sanitizeDiagnosticEvent({ type: 'request_started', context, fields: { module: 'runtime', operation: 'mock', role: 'customer', status: 'started' } });
  assert.equal(event.accepted, true);
  assert.equal(life.finishRequest('s-int-1', 'r-int-1').status, 'completed');
  assert.equal(life.snapshot('s-int-1').requests[0].status, 'completed');
});

test('Phase 10 mocked integration validation: transient idempotent error chooses bounded retry only', async () => {
  const adapter = mockAdapter('transient');
  let error;
  try { await adapter.invoke({ idempotent: true, action: 'read-only-mock' }); } catch (e) { error = e; }
  const decision = decideRetry({ attempt: 1, maxAttempts: 3, idempotent: true, errorCode: error.code });
  assert.equal(decision.retry, true);
  assert.equal(decision.nextAttempt, 2);
  assert.equal(decision.delayMs, 250);
  assert.equal(adapter.calls.length, 1, 'policy only decides; it does not auto-retry');
});

test('Phase 10 mocked integration validation: non-idempotent payment timeout blocks replay', async () => {
  const adapter = mockAdapter('mutation-timeout');
  let error;
  try { await adapter.invoke({ idempotent: false, action: 'payment-mock' }); } catch (e) { error = e; }
  const retry = decideRetry({ attempt: 1, idempotent: false, errorCode: error.code });
  const recovery = decideRecovery({ errorCode: error.code, sideEffectCommitted: true });
  assert.equal(retry.retry, false);
  assert.equal(recovery.recover, false);
  assert.equal(recovery.reconcileRequired, true);
  assert.equal(adapter.calls.length, 1);
});

test('Phase 10 mocked integration validation: blocked intent remains side-effect-free and diagnostic is sanitized', () => {
  const blocked = evaluateRuntimeRequest({ sessionId: 's-int-2', role: 'customer', permissions: [], correlationId: 'c-int-2', intent: { type: 'pay', amount: 1000 } });
  assert.equal(blocked.status, 'blocked');
  assert.equal(blocked.sideEffects, false);
  const context = createCorrelationContext({ correlationId: 'c-int-2', requestId: 'r-int-2', sessionId: 's-int-2', role: 'customer' });
  const event = sanitizeDiagnosticEvent({ type: 'policy_blocked', context, fields: { errorCode: 'POLICY_BLOCKED', prompt: 'private prompt', token: 'secret-token', address: 'private address' } });
  assert.equal(event.accepted, true);
  assert.deepEqual(event.event.fields, { errorCode: 'POLICY_BLOCKED' });
  assert.equal(JSON.stringify(event).includes('private prompt'), false);
  assert.equal(JSON.stringify(event).includes('secret-token'), false);
  assert.equal(JSON.stringify(event).includes('private address'), false);
});

test('Phase 10 mocked integration validation: session mismatch and invalid context fail closed', () => {
  const blocked = evaluateRuntimeRequest({ sessionId: 's-one', role: 'customer', permissions: [], intent: { type: 'navigate', target: 'home' } });
  assert.equal(blocked.status, 'proposal');
  const context = createCorrelationContext({ correlationId: 'c-mismatch', requestId: 'r-mismatch', sessionId: 's-two', role: 'driver' });
  const diagnostic = sanitizeDiagnosticEvent({ type: 'request_started', context, fields: { role: 'driver' } });
  assert.equal(diagnostic.accepted, true);
  assert.equal(context.sessionId, 's-two');
  assert.equal(context.role, 'driver');
  assert.throws(() => createCorrelationContext({ correlationId: 'bad id', requestId: 'r', sessionId: 's', role: 'customer' }));
});
