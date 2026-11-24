'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createCorrelationContext, sanitizeDiagnosticEvent } = require('../qa/arjuna-x-diagnostics-context.cjs');

const ctx = { correlationId: 'corr-abc123', requestId: 'req-01', sessionId: 'sess-02', role: 'admin' };

test('creates immutable validated correlation context', () => {
  const c = createCorrelationContext(ctx);
  assert.equal(c.correlationId, ctx.correlationId);
  assert.equal(c.role, 'admin');
  assert.equal(Object.isFrozen(c), true);
});

test('invalid IDs are rejected', () => {
  assert.throws(() => createCorrelationContext({ ...ctx, requestId: 'bad id' }), /requestId is invalid/);
  assert.throws(() => createCorrelationContext({ ...ctx, correlationId: '' }), /correlationId is invalid/);
});

test('sanitizer keeps allowlisted diagnostic fields only', () => {
  const result = sanitizeDiagnosticEvent({ type: 'request_failed', context: ctx, fields: {
    module: 'runtime', status: 'failed', errorCode: 'TIMEOUT', durationMs: 120,
    prompt: 'sensitive prompt text', token: 'secret', payload: { data: 'private' }, attempt: 2
  }});
  assert.equal(result.accepted, true);
  assert.deepEqual(result.event.fields, { module: 'runtime', status: 'failed', errorCode: 'TIMEOUT', durationMs: 120, attempt: 2 });
  assert.equal(JSON.stringify(result).includes('sensitive'), false);
  assert.equal(JSON.stringify(result).includes('secret'), false);
});

test('rejects unapproved event types and missing or invalid context', () => {
  assert.equal(sanitizeDiagnosticEvent({ type: 'custom_event', context: ctx }).accepted, false);
  assert.equal(sanitizeDiagnosticEvent({ type: 'request_started' }).accepted, false);
  assert.equal(sanitizeDiagnosticEvent({ type: 'request_started', context: { ...ctx, sessionId: 'bad id' } }).accepted, false);
});

test('unknown role is downgraded to unknown and event remains minimal', () => {
  const result = sanitizeDiagnosticEvent({ type: 'request_started', context: { ...ctx, role: 'root' }, fields: { status: 'started' } });
  assert.equal(result.accepted, true);
  assert.equal(result.event.context.role, 'unknown');
});
