'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { decideRetry } = require('../qa/arjuna-x-retry-policy.cjs');

test('allows bounded retries only for explicitly idempotent transient errors', () => {
  assert.deepEqual(decideRetry({ attempt: 1, idempotent: true, errorCode: 'TIMEOUT' }), {
    retry: true, reason: 'transient_idempotent_operation', attempt: 1, nextAttempt: 2, delayMs: 250
  });
  assert.equal(decideRetry({ attempt: 2, idempotent: true, errorCode: 'NETWORK_UNAVAILABLE' }).delayMs, 500);
  assert.equal(decideRetry({ attempt: 3, maxAttempts: 3, idempotent: true, errorCode: 'TIMEOUT' }).reason, 'attempt_limit_reached');
});

test('non-idempotent operations never retry even on transient errors', () => {
  assert.deepEqual(decideRetry({ attempt: 1, idempotent: false, errorCode: 'TIMEOUT' }), {
    retry: false, reason: 'operation_not_idempotent', attempt: 1, delayMs: 0
  });
});

test('auth, policy, payment and mutation errors never retry', () => {
  for (const errorCode of ['AUTH_FAILED', 'FORBIDDEN', 'INVALID_INPUT', 'POLICY_BLOCKED', 'PAYMENT', 'BOOKING_MUTATION']) {
    assert.equal(decideRetry({ attempt: 1, idempotent: true, errorCode }).retry, false, errorCode);
  }
});

test('unknown error codes fail closed without retry', () => {
  assert.deepEqual(decideRetry({ attempt: 1, idempotent: true, errorCode: 'UNCLASSIFIED' }), {
    retry: false, reason: 'unknown_error_fail_closed', attempt: 1, delayMs: 0
  });
});

test('retry delay is capped and options validated', () => {
  assert.equal(decideRetry({ attempt: 3, maxAttempts: 5, idempotent: true, errorCode: 'TIMEOUT', baseDelayMs: 1000, maxDelayMs: 1500 }).delayMs, 1500);
  assert.throws(() => decideRetry({ attempt: 0 }), /positive integer/);
  assert.throws(() => decideRetry({ attempt: 1, baseDelayMs: -1 }), /non-negative integer/);
});
