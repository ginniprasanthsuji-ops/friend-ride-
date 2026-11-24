'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createCorrelationContext, sanitizeDiagnosticEvent } = require('../qa/arjuna-x-diagnostics-context.cjs');

const context = { correlationId: 'corr-11', requestId: 'req-11', sessionId: 'sess-11', role: 'customer' };

test('Phase 11 privacy hardening: diagnostic fields are allowlisted and PII/secrets are excluded', () => {
  const result = sanitizeDiagnosticEvent({
    type: 'request_failed',
    context,
    fields: {
      module: 'runtime', operation: 'retry', role: 'customer', status: 'failed', errorCode: 'NETWORK_UNAVAILABLE',
      prompt: 'private user prompt', token: 'secret-token', phone: '9876543210', email: 'private@example.com',
      address: 'private address', rideId: 'ride-private', fare: 500, paymentId: 'pay-private'
    }
  });
  assert.equal(result.accepted, true);
  assert.deepEqual(result.event.fields, {
    module: 'runtime', operation: 'retry', role: 'customer', status: 'failed', errorCode: 'NETWORK_UNAVAILABLE'
  });
  const serialized = JSON.stringify(result);
  for (const secret of ['private user prompt', 'secret-token', '9876543210', 'private@example.com', 'private address', 'ride-private', '500', 'pay-private']) {
    assert.equal(serialized.includes(secret), false, 'diagnostics must not leak: ' + secret);
  }
});

test('Phase 11 privacy hardening: malformed IDs, invalid role and unknown event types fail safely', () => {
  assert.throws(() => createCorrelationContext({ ...context, correlationId: 'contains spaces' }));
  assert.throws(() => createCorrelationContext({ ...context, requestId: 'x'.repeat(129) }));
  const invalidRole = createCorrelationContext({ ...context, role: 'superuser-secret' });
  assert.equal(invalidRole.role, 'unknown');
  assert.equal(sanitizeDiagnosticEvent({ type: 'user_message', context, fields: { module: 'runtime' } }).accepted, false);
  assert.equal(sanitizeDiagnosticEvent({ type: 'request_started', context: null }).accepted, false);
});

test('Phase 11 privacy hardening: unsafe or oversized diagnostic values are dropped', () => {
  const result = sanitizeDiagnosticEvent({
    type: 'request_completed', context,
    fields: { module: 'runtime', operation: 'safe-op', status: 'completed', errorCode: 'bad code with spaces', attempt: -1, durationMs: Infinity }
  });
  assert.equal(result.accepted, true);
  assert.deepEqual(result.event.fields, { module: 'runtime', operation: 'safe-op', status: 'completed' });
});

test('Phase 11 privacy hardening: nested payloads, arrays, Unicode and oversized values never pass', () => {
  const result = sanitizeDiagnosticEvent({
    type: 'retry_decided', context: { ...context, phone: '9999999999', accessToken: 'do-not-copy' },
    fields: {
      module: 'runtime', operation: 'retry', status: 'decided',
      errorCode: { detail: 'nested secret' }, role: ['customer', 'driver'],
      attempt: 2, durationMs: 120, prompt: '🚨 private prompt', oversized: 'x'.repeat(200)
    }
  });
  assert.equal(result.accepted, true);
  assert.deepEqual(result.event.context, context);
  assert.deepEqual(result.event.fields, { module: 'runtime', operation: 'retry', status: 'decided', attempt: 2, durationMs: 120 });
  assert.equal(JSON.stringify(result).includes('do-not-copy'), false);
  assert.equal(JSON.stringify(result).includes('nested secret'), false);
});

test('Phase 11 privacy hardening: output objects are immutable and isolated from caller mutation', () => {
  const inputFields = { module: 'runtime', operation: 'safe-op', status: 'started' };
  const inputContext = { ...context, unexpected: 'private-extra' };
  const result = sanitizeDiagnosticEvent({ type: 'request_started', context: inputContext, fields: inputFields });
  assert.equal(result.accepted, true);
  inputFields.status = 'tampered';
  inputContext.role = 'admin';
  assert.equal(result.event.fields.status, 'started');
  assert.equal(result.event.context.role, 'customer');
  assert.equal(Object.isFrozen(result.event), true);
  assert.equal(Object.isFrozen(result.event.context), true);
  assert.equal(Object.isFrozen(result.event.fields), true);
});

test('Phase 11 privacy hardening: context getter failures are fail-closed', () => {
  const hostile = { ...context };
  Object.defineProperty(hostile, 'requestId', { enumerable: true, get() { throw new Error('private getter payload'); } });
  const result = sanitizeDiagnosticEvent({ type: 'request_started', context: hostile });
  assert.equal(result.accepted, false);
  assert.equal(result.reason, 'invalid_context');
  assert.equal(JSON.stringify(result).includes('private getter payload'), false);
});

const { evaluatePrivacyGate } = require('../qa/arjuna-x-diagnostics-privacy-policy.cjs');

test('Phase 11 privacy gate accepts bounded safe fields and marks no side effects', () => {
  const result = evaluatePrivacyGate({
    type: 'request_failed', context,
    fields: { module: 'runtime', operation: 'retry', status: 'failed', errorCode: 'SAFE_CODE', attempt: 1, durationMs: 300 }
  });
  assert.equal(result.accepted, true);
  assert.equal(result.sideEffects, false);
  assert.equal(result.event.fields.errorCode, 'SAFE_CODE');
});

test('Phase 11 privacy gate rejects field-count, value-length and numeric boundaries', () => {
  const tooLong = evaluatePrivacyGate({ type: 'request_started', context, fields: { module: 'x'.repeat(65) } });
  assert.equal(tooLong.accepted, false);
  const outOfRange = evaluatePrivacyGate({ type: 'retry_decided', context, fields: { attempt: 100000001 } });
  assert.equal(outOfRange.accepted, false);
  const fieldLimit = evaluatePrivacyGate({ type: 'request_started', context, fields: { module:'a',operation:'b',role:'customer',status:'ok',errorCode:'c',attempt:1,durationMs:2,extra:'no' } });
  assert.equal(fieldLimit.accepted, false);
});

test('Phase 11 privacy gate fails closed on hostile objects and unknown fields', () => {
  const hostile = {};
  Object.defineProperty(hostile, 'fields', { enumerable: true, get() { throw new Error('sensitive getter'); } });
  assert.equal(evaluatePrivacyGate(hostile).accepted, false);
  const unknown = evaluatePrivacyGate({ type:'request_started', context, fields:{ prompt:'not allowed' } });
  assert.equal(unknown.accepted, false);
});

test('Phase 11 privacy gate module remains pure and dependency-limited', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const source = fs.readFileSync(path.resolve(__dirname, '../qa/arjuna-x-diagnostics-privacy-policy.cjs'), 'utf8');
  for (const forbidden of ['fetch(', 'XMLHttpRequest', 'WebSocket(', 'setTimeout(', 'setInterval(', 'console.log(', 'console.info(', 'console.warn(', 'console.error(', 'sendTelemetry(', 'trackEvent(']) {
    assert.equal(source.includes(forbidden), false, 'forbidden side-effect marker: ' + forbidden);
  }
  assert.equal(source.includes('evaluatePrivacyGate'), true);
});

test('Phase 11 privacy gate rejects arrays, class instances and prototype-polluted shapes', () => {
  assert.equal(evaluatePrivacyGate([]).accepted, false);
  assert.equal(evaluatePrivacyGate({ type: 'request_started', context, fields: [] }).accepted, false);
  class CustomFields { constructor() { this.module = 'runtime'; } }
  assert.equal(evaluatePrivacyGate({ type: 'request_started', context, fields: new CustomFields() }).accepted, false);
  const polluted = Object.create({ prompt: 'inherited secret' });
  polluted.module = 'runtime';
  assert.equal(evaluatePrivacyGate({ type: 'request_started', context, fields: polluted }).accepted, false);
  const topLevelLeak = evaluatePrivacyGate({ type: 'request_started', context, fields: {}, prompt: 'raw prompt' });
  assert.equal(topLevelLeak.accepted, false);
});

test('Phase 11 privacy gate safely accepts null-prototype allowlisted records', () => {
  const nullFields = Object.create(null);
  nullFields.module = 'runtime';
  nullFields.status = 'started';
  const nullInput = Object.create(null);
  nullInput.type = 'request_started';
  nullInput.context = context;
  nullInput.fields = nullFields;
  const result = evaluatePrivacyGate(nullInput);
  assert.equal(result.accepted, true);
  assert.deepEqual(result.event.fields, { module: 'runtime', status: 'started' });
});
