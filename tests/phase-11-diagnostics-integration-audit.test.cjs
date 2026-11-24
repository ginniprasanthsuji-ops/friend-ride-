'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { evaluatePrivacyGate } = require('../qa/arjuna-x-diagnostics-privacy-policy.cjs');
const { sanitizeDiagnosticEvent } = require('../qa/arjuna-x-diagnostics-context.cjs');

const context = { correlationId: 'audit-corr', requestId: 'audit-req', sessionId: 'audit-session', role: 'system' };

test('Phase 11 integration audit: privacy gate is the only accepted diagnostics adapter contract', () => {
  const safe = evaluatePrivacyGate({ type: 'request_failed', context, fields: { module: 'runtime', operation: 'fallback', status: 'failed', errorCode: 'NETWORK_UNAVAILABLE', attempt: 1 } });
  assert.equal(safe.accepted, true);
  assert.equal(safe.sideEffects, false);
  assert.deepEqual(Object.keys(safe.event).sort(), ['context', 'fields', 'type']);
  assert.equal(sanitizeDiagnosticEvent({ type: 'request_failed', context, fields: { errorCode: 'NETWORK_UNAVAILABLE' } }).accepted, true);
});

test('Phase 11 integration audit: raw exception details are never part of the diagnostic contract', () => {
  const exception = new Error('raw private message with email user@example.com and phone 9876543210');
  const result = evaluatePrivacyGate({ type: 'request_failed', context, fields: { module: 'runtime', operation: 'exception', status: 'failed', errorCode: 'INTERNAL_ERROR' } });
  const serialized = JSON.stringify(result);
  assert.equal(result.accepted, true);
  assert.equal(serialized.includes(exception.message), false);
  assert.equal(serialized.includes('user@example.com'), false);
  assert.equal(serialized.includes('9876543210'), false);
  assert.equal(serialized.includes('stack'), false);
});

test('Phase 11 integration audit: diagnostics policy source has no outbound or logging sinks', () => {
  const source = fs.readFileSync(path.resolve(__dirname, '../qa/arjuna-x-diagnostics-privacy-policy.cjs'), 'utf8');
  const forbidden = ['fetch(', 'XMLHttpRequest', 'WebSocket(', 'navigator.sendBeacon', 'console.', 'sendTelemetry(', 'trackEvent(', 'localStorage', 'sessionStorage'];
  for (const marker of forbidden) assert.equal(source.includes(marker), false, 'outbound/logging sink marker detected: ' + marker);
  assert.equal(source.includes('sanitizeDiagnosticEvent'), true);
  assert.equal(source.includes('SAFE_INPUT_KEYS'), true);
});

test('Phase 11 integration audit: unsafe failure inputs are rejected without echoing payloads', () => {
  const payload = 'private prompt phone 9876543210 email user@example.com';
  const result = evaluatePrivacyGate({ type: 'request_failed', context, fields: { operation: payload } });
  assert.equal(result.accepted, false);
  assert.equal(JSON.stringify(result).includes(payload), false);
  assert.equal(JSON.stringify(result).includes('user@example.com'), false);
  assert.equal(JSON.stringify(result).includes('9876543210'), false);
});
