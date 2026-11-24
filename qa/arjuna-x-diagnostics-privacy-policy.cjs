'use strict';

/**
 * ARJUNA X Phase 11 privacy gate.
 * Pure fail-closed adapter. It never emits raw input, telemetry, or side effects.
 */
const { sanitizeDiagnosticEvent } = require('./arjuna-x-diagnostics-context.cjs');
const SAFE_INPUT_KEYS = new Set(['type', 'context', 'fields']);
const SAFE_STRING_FIELDS = new Set(['module', 'operation', 'role', 'status', 'errorCode']);
const SAFE_NUMERIC_FIELDS = new Set(['attempt', 'durationMs']);
const MAX_FIELDS = 7;

function isSafeRecord(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function evaluatePrivacyGate(input) {
  try {
    if (!isSafeRecord(input)) return { accepted: false, reason: 'invalid_input' };
    for (const key of Object.keys(input)) {
      if (!SAFE_INPUT_KEYS.has(key)) return { accepted: false, reason: 'input_field_not_allowlisted' };
    }
    const rawFields = input.fields === undefined ? {} : input.fields;
    if (!isSafeRecord(rawFields)) return { accepted: false, reason: 'invalid_fields' };
    const rawKeys = Object.keys(rawFields);
    if (rawKeys.length > MAX_FIELDS) return { accepted: false, reason: 'field_limit_exceeded' };
    for (const key of rawKeys) {
      if (!SAFE_STRING_FIELDS.has(key) && !SAFE_NUMERIC_FIELDS.has(key)) return { accepted: false, reason: 'field_not_allowlisted' };
      const value = rawFields[key];
      if (SAFE_STRING_FIELDS.has(key) && (typeof value !== 'string' || value.length > 64)) return { accepted: false, reason: 'unsafe_string_field' };
      if (SAFE_NUMERIC_FIELDS.has(key) && (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100000000)) return { accepted: false, reason: 'unsafe_numeric_field' };
    }
    const safe = sanitizeDiagnosticEvent(input);
    if (!safe.accepted) return { accepted: false, reason: safe.reason };
    return { accepted: true, event: safe.event, sideEffects: false };
  } catch {
    return { accepted: false, reason: 'privacy_gate_error' };
  }
}

module.exports = { evaluatePrivacyGate, SAFE_STRING_FIELDS, SAFE_NUMERIC_FIELDS, SAFE_INPUT_KEYS, MAX_FIELDS };
