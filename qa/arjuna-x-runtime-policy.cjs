'use strict';

/**
 * ARJUNA X Phase 9 runtime policy adapter.
 * Pure proposal/decision layer: no app mutation, network, mic, GPS, booking, or payment.
 */
const SAFE_NAV = new Set(['home','ride','orders','services','profile','help']);
const SAFE_RIDES = new Set(['bike','auto','car']);
const ROLES = new Set(['customer','driver','partner','admin']);

function safeDiagnostic(code, correlationId) {
  const knownCodes = new Set(['invalid_request','missing_session','invalid_role','invalid_permissions','invalid_intent','proposal_navigation','proposal_ride_selection','confirmation_required','blocked_intent','policy_denied','session_mismatch']);
  const safeCorrelation = typeof correlationId === 'string' && /^[a-z][a-z0-9_-]{0,39}$/i.test(correlationId) ? correlationId : undefined;
  return { code: knownCodes.has(code) ? code : 'runtime_error', correlationId: safeCorrelation };
}

function evaluateRuntimeRequest(request) {
  if (!request || typeof request !== 'object' || Array.isArray(request)) {
    return {status:'blocked', reason:'invalid_request', diagnostic:safeDiagnostic('invalid_request')};
  }
  const {sessionId, role, intent, permissions = [], correlationId} = request;
  if (typeof sessionId !== 'string' || !sessionId.trim()) {
    return {status:'blocked', reason:'missing_session', diagnostic:safeDiagnostic('missing_session', correlationId)};
  }
  if (!ROLES.has(role)) {
    return {status:'blocked', reason:'invalid_role', diagnostic:safeDiagnostic('invalid_role', correlationId)};
  }
  if (!Array.isArray(permissions) || permissions.some(p => typeof p !== 'string')) {
    return {status:'blocked', reason:'invalid_permissions', diagnostic:safeDiagnostic('invalid_permissions', correlationId)};
  }
  if (!intent || typeof intent !== 'object' || Array.isArray(intent)) {
    return {status:'blocked', reason:'invalid_intent', diagnostic:safeDiagnostic('invalid_intent', correlationId)};
  }

  if (intent.type === 'navigate' && Object.keys(intent).sort().join(',') === 'target,type' && SAFE_NAV.has(intent.target)) {
    return {status:'proposal', action:{type:'navigate', target:intent.target}, sideEffects:false, diagnostic:safeDiagnostic('proposal_navigation', correlationId)};
  }
  if (intent.type === 'select_ride' && Object.keys(intent).sort().join(',') === 'rideType,type' && SAFE_RIDES.has(intent.rideType) && role === 'customer') {
    return {status:'proposal', action:{type:'select_ride', rideType:intent.rideType}, sideEffects:false, diagnostic:safeDiagnostic('proposal_ride_selection', correlationId)};
  }
  if (intent.type === 'review_booking' && Object.keys(intent).sort().join(',') === 'execution,requiresConfirmation,type' && intent.requiresConfirmation === true && intent.execution === 'none' && role === 'customer') {
    return {status:'confirmation_required', action:{type:'review_booking'}, sideEffects:false, confirmation:'explicit_in_app', diagnostic:safeDiagnostic('confirmation_required', correlationId)};
  }
  if (intent.type === 'unknown' || intent.type === 'blocked_action') {
    return {status:'blocked', reason:'intent_not_executable', sideEffects:false, diagnostic:safeDiagnostic('blocked_intent', correlationId)};
  }
  return {status:'blocked', reason:'intent_not_allowed', sideEffects:false, diagnostic:safeDiagnostic('policy_denied', correlationId)};
}

function assertSessionIsolation(currentSessionId, requestSessionId) {
  if (typeof currentSessionId !== 'string' || typeof requestSessionId !== 'string' || currentSessionId !== requestSessionId) {
    return {status:'blocked', reason:'session_mismatch', sideEffects:false, diagnostic:safeDiagnostic('session_mismatch')};
  }
  return {status:'ok', sideEffects:false};
}

module.exports = {evaluateRuntimeRequest, assertSessionIsolation, safeDiagnostic, SAFE_NAV, SAFE_RIDES, ROLES};
