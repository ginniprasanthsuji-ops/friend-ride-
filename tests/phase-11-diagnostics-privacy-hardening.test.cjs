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
