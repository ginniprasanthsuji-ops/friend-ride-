'use strict';

/**
 * ARJUNA X Phase 9 diagnostics context.
 * Pure helpers: IDs must be supplied by caller; no PII, secrets, payloads or side effects.
 */
const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const SAFE_EVENT_TYPES = new Set([
  'request_started', 'request_completed', 'request_failed', 'request_cancelled',
  'request_timed_out', 'fallback_selected', 'policy_blocked', 'retry_decided'
]);
const SAFE_FIELDS = new Set(['module', 'operation', 'role', 'status', 'errorCode', 'attempt', 'durationMs']);

function looksLikePhoneNumber(value) {
  if (typeof value !== 'string') return false;
  const digits = value.replace(/[+().\s-]/g, '');
  return /^\d{8,15}$/.test(digits) || /\d{8,}/.test(value);
}

function validId(value, label) {
  if (typeof value !== 'string' || !ID_PATTERN.test(value)) throw new Error(label + ' is invalid');
  return value;
}

function createCorrelationContext({ correlationId, requestId, sessionId, role } = {}) {
  return Object.freeze({
    correlationId: validId(correlationId, 'correlationId'),
    requestId: validId(requestId, 'requestId'),
    sessionId: validId(sessionId, 'sessionId'),
    role: typeof role === 'string' && ['customer', 'driver', 'partner', 'admin', 'system'].includes(role) ? role : 'unknown'
  });
}

function sanitizeDiagnosticEvent({ type, context, fields = {} } = {}) {
  if (!SAFE_EVENT_TYPES.has(type)) return { accepted: false, reason: 'event_type_not_allowlisted' };
  if (!context || typeof context !== 'object') return { accepted: false, reason: 'missing_context' };
  try {
    const safeContext = createCorrelationContext(context);
    const safeFields = {};
    for (const key of Object.keys(fields || {})) {
      if (!SAFE_FIELDS.has(key)) continue;
      const value = fields[key];
      if (typeof value === 'string' && value.length <= 96 && ID_PATTERN.test(value) && !looksLikePhoneNumber(value)) safeFields[key] = value;
      else if (typeof value === 'number' && Number.isFinite(value) && value >= 0 && ['attempt', 'durationMs'].includes(key)) safeFields[key] = value;
    }
    return { accepted: true, event: Object.freeze({ type, context: safeContext, fields: Object.freeze(safeFields) }) };
  } catch {
    return { accepted: false, reason: 'invalid_context' };
  }
}

module.exports = { createCorrelationContext, sanitizeDiagnosticEvent, ID_PATTERN, SAFE_EVENT_TYPES, SAFE_FIELDS, looksLikePhoneNumber };
