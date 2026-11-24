'use strict';

/**
 * ARJUNA X Phase 11 privacy gate.
 * Pure fail-closed adapter. It never emits raw input, telemetry, or side effects.
 */
const { sanitizeDiagnosticEvent } = require('./arjuna-x-diagnostics-context.cjs');
const SAFE_STRING_FIELDS = new Set(['module', 'operation', 'role', 'status', 'errorCode']);
const SAFE_NUMERIC_FIELDS = new Set(['attempt', 'durationMs']);
const MAX_FIELDS = 7;

function evaluatePrivacyGate(input) {
  try {
    if (!input || typeof input !== 'object' || Array.isArray(input)) return { accepted: false, reason: 'invalid_input' };
    const safe = sanitizeDiagnosticEvent(input);
    if (!safe.accepted) return { accepted: false, reason: safe.reason };
    const fields = safe.event.fields;
    if (!fields || typeof fields !== 'object' || Array.isArray(fields)) return { accepted: false, reason: 'invalid_fields' };
    const keys = Object.keys(fields);
    if (keys.length > MAX_FIELDS) return { accepted: false, reason: 'field_limit_exceeded' };
    for (const key of keys) {
      if (SAFE_STRING_FIELDS.has(key)) {
        if (typeof fields[key] !== 'string' || fields[key].length > 64) return { accepted: false, reason: 'unsafe_string_field' };
      } else if (SAFE_NUMERIC_FIELDS.has(key)) {
        if (typeof fields[key] !== 'number' || !Number.isFinite(fields[key]) || fields[key] < 0 || fields[key] > 100000000) return { accepted: false, reason: 'unsafe_numeric_field' };
      } else return { accepted: false, reason: 'field_not_allowlisted' };
    }
    return { accepted: true, event: safe.event, sideEffects: false };
  } catch {
    return { accepted: false, reason: 'privacy_gate_error' };
  }
}

module.exports = { evaluatePrivacyGate, SAFE_STRING_FIELDS, SAFE_NUMERIC_FIELDS, MAX_FIELDS };
