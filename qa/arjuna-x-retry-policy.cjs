'use strict';

/**
 * ARJUNA X Phase 9 retry policy.
 * Pure decision helper only: no network calls, timers, mutations or automatic retries.
 * Retries are allowed ONLY for explicitly idempotent operations and known transient codes.
 */
const TRANSIENT_CODES = new Set(['TIMEOUT', 'NETWORK_UNAVAILABLE', 'TEMPORARY_UNAVAILABLE', 'RATE_LIMITED']);
const NON_RETRYABLE_CODES = new Set(['AUTH_FAILED', 'FORBIDDEN', 'INVALID_INPUT', 'POLICY_BLOCKED', 'PAYMENT', 'BOOKING_MUTATION']);

function positiveInt(value, name) {
  if (!Number.isInteger(value) || value < 1) throw new Error(name + ' must be a positive integer');
  return value;
}

function decideRetry({ attempt, maxAttempts = 3, idempotent = false, errorCode, baseDelayMs = 250, maxDelayMs = 4000 } = {}) {
  positiveInt(attempt, 'attempt');
  positiveInt(maxAttempts, 'maxAttempts');
  if (!Number.isInteger(baseDelayMs) || baseDelayMs < 0) throw new Error('baseDelayMs must be a non-negative integer');
  if (!Number.isInteger(maxDelayMs) || maxDelayMs < 0) throw new Error('maxDelayMs must be a non-negative integer');
  if (typeof idempotent !== 'boolean') throw new Error('idempotent must be boolean');
  const code = typeof errorCode === 'string' ? errorCode : 'UNKNOWN';
  if (!idempotent) return { retry: false, reason: 'operation_not_idempotent', attempt, delayMs: 0 };
  if (NON_RETRYABLE_CODES.has(code)) return { retry: false, reason: 'non_retryable_error', attempt, delayMs: 0 };
  if (!TRANSIENT_CODES.has(code)) return { retry: false, reason: 'unknown_error_fail_closed', attempt, delayMs: 0 };
  if (attempt >= maxAttempts) return { retry: false, reason: 'attempt_limit_reached', attempt, delayMs: 0 };
  const exponent = Math.min(attempt - 1, 20);
  const delayMs = Math.min(maxDelayMs, baseDelayMs * (2 ** exponent));
  return { retry: true, reason: 'transient_idempotent_operation', attempt, nextAttempt: attempt + 1, delayMs };
}

module.exports = { decideRetry, TRANSIENT_CODES, NON_RETRYABLE_CODES };
