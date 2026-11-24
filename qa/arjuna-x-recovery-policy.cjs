'use strict';

/**
 * ARJUNA X Phase 9 recovery decision helper.
 * Pure/fail-closed. No retries, timers, network or external effects.
 */
const SAFE_FALLBACKS = Object.freeze({
  TIMEOUT: 'return_timeout_status',
  NETWORK_UNAVAILABLE: 'return_unavailable_status',
  TEMPORARY_UNAVAILABLE: 'return_unavailable_status',
  RATE_LIMITED: 'return_rate_limited_status',
  INVALID_INPUT: 'return_validation_error',
  AUTH_FAILED: 'return_auth_required',
  FORBIDDEN: 'return_permission_denied',
  POLICY_BLOCKED: 'return_policy_blocked',
  UNKNOWN: 'return_generic_failure'
});

const EXTERNAL_EFFECT_CODES = new Set(['PAYMENT', 'BOOKING_MUTATION', 'ORDER_MUTATION', 'GPS_ACTION', 'DEVICE_ACTION']);

function decideRecovery({ errorCode, operationCompleted = false, sideEffectCommitted = false, userConfirmed = false } = {}) {
  const code = typeof errorCode === 'string' && SAFE_FALLBACKS[errorCode] ? errorCode : 'UNKNOWN';
  if (typeof operationCompleted !== 'boolean' || typeof sideEffectCommitted !== 'boolean' || typeof userConfirmed !== 'boolean') {
    return { recover: false, reason: 'invalid_recovery_context', fallback: 'return_generic_failure', reconcileRequired: true };
  }
  if (sideEffectCommitted) {
    return { recover: false, reason: 'side_effect_commit_requires_reconciliation', fallback: 'return_generic_failure', reconcileRequired: true };
  }
  if (EXTERNAL_EFFECT_CODES.has(code) || EXTERNAL_EFFECT_CODES.has(errorCode)) {
    return { recover: false, reason: 'external_effect_requires_explicit_confirmation', fallback: 'return_generic_failure', reconcileRequired: true };
  }
  if (operationCompleted) {
    return { recover: false, reason: 'completed_operation_not_replayed', fallback: 'return_completion_status', reconcileRequired: false };
  }
  if (userConfirmed) {
    return { recover: false, reason: 'confirmation_does_not_authorize_automatic_replay', fallback: SAFE_FALLBACKS[code], reconcileRequired: false };
  }
  return { recover: true, reason: 'safe_non_mutating_fallback', fallback: SAFE_FALLBACKS[code], reconcileRequired: false };
}

module.exports = { decideRecovery, SAFE_FALLBACKS, EXTERNAL_EFFECT_CODES };
