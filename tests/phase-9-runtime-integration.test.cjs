'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { RuntimeSessionLifecycle } = require('../qa/arjuna-x-runtime-lifecycle.cjs');
const { decideRetry } = require('../qa/arjuna-x-retry-policy.cjs');
const { decideRecovery } = require('../qa/arjuna-x-recovery-policy.cjs');
const { createCorrelationContext, sanitizeDiagnosticEvent } = require('../qa/arjuna-x-diagnostics-context.cjs');

test('integration: start -> correlated event -> safe retry decision -> fallback -> completion', () => {
  const runtime = new RuntimeSessionLifecycle({ ttlMs: 10000, now: () => 1000 });
  runtime.openSession('sess-integration', 'customer');
  const started = runtime.beginRequest('sess-integration', 'req-integration');
  assert.equal(started.status, 'started');

  const context = createCorrelationContext({
    correlationId: 'corr-integration', requestId: 'req-integration', sessionId: 'sess-integration', role: 'customer'
  });
  const startedEvent = sanitizeDiagnosticEvent({
    type: 'request_started', context, fields: { module: 'orchestrator', operation: 'read_status', status: 'started', payload: 'should-drop' }
  });
  assert.equal(startedEvent.accepted, true);
  assert.equal('payload' in startedEvent.event.fields, false);

  const retry = decideRetry({ attempt: 1, idempotent: true, errorCode: 'NETWORK_UNAVAILABLE' });
  assert.equal(retry.retry, true);
  assert.equal(retry.nextAttempt, 2);
  const retryEvent = sanitizeDiagnosticEvent({ type: 'retry_decided', context, fields: { status: 'retry_allowed', attempt: retry.nextAttempt } });
  assert.equal(retryEvent.accepted, true);

  const recovery = decideRecovery({ errorCode: 'NETWORK_UNAVAILABLE' });
  assert.equal(recovery.recover, true);
  assert.equal(recovery.fallback, 'return_unavailable_status');
  const fallbackEvent = sanitizeDiagnosticEvent({ type: 'fallback_selected', context, fields: { status: recovery.fallback } });
  assert.equal(fallbackEvent.accepted, true);

  assert.equal(runtime.finishRequest('sess-integration', 'req-integration', 'failed').status, 'failed');
  const snap = runtime.snapshot('sess-integration');
  assert.equal(snap.requests[0].status, 'failed');
});

test('integration: non-idempotent side-effect timeout fails closed and requires reconciliation', () => {
  const runtime = new RuntimeSessionLifecycle({ now: () => 2000 });
  runtime.openSession('sess-mutating', 'partner');
  const begun = runtime.beginRequest('sess-mutating', 'req-payment');
  assert.equal(begun.status, 'started');

  const retry = decideRetry({ attempt: 1, idempotent: false, errorCode: 'TIMEOUT' });
  assert.equal(retry.retry, false);
  const recovery = decideRecovery({ errorCode: 'PAYMENT', sideEffectCommitted: true });
  assert.equal(recovery.recover, false);
  assert.equal(recovery.reconcileRequired, true);
  assert.equal(runtime.timeoutRequest('sess-mutating', 'req-payment').status, 'timed_out');
  assert.equal(begun.signal.aborted, true);

  const ctx = createCorrelationContext({ correlationId: 'corr-pay-01', requestId: 'req-payment', sessionId: 'sess-mutating', role: 'partner' });
  const event = sanitizeDiagnosticEvent({ type: 'request_timed_out', context: ctx, fields: { errorCode: 'TIMEOUT', status: 'timed_out' } });
  assert.equal(event.accepted, true);
  assert.equal(JSON.stringify(event).includes('payload'), false);
  assert.equal(runtime.finishRequest('sess-mutating', 'req-payment', 'completed').reason, 'request_not_running');
});

test('integration: policy-blocked request never retries and diagnostic is payload-free', () => {
  const runtime = new RuntimeSessionLifecycle();
  runtime.openSession('sess-blocked', 'customer');
  runtime.beginRequest('sess-blocked', 'req-blocked');
  const retry = decideRetry({ attempt: 1, idempotent: true, errorCode: 'POLICY_BLOCKED' });
  assert.equal(retry.retry, false);
  const recovery = decideRecovery({ errorCode: 'POLICY_BLOCKED' });
  assert.equal(recovery.recover, true);
  assert.equal(recovery.fallback, 'return_policy_blocked');
  const context = createCorrelationContext({ correlationId: 'corr-block', requestId: 'req-blocked', sessionId: 'sess-blocked', role: 'customer' });
  const event = sanitizeDiagnosticEvent({ type: 'policy_blocked', context, fields: { status: 'blocked', prompt: 'private text', token: 'secret' } });
  assert.equal(event.accepted, true);
  assert.equal(JSON.stringify(event).includes('private'), false);
  assert.equal(JSON.stringify(event).includes('secret'), false);
});
