'use strict';

/**
 * Phase 10 contract bridge: derive authorization role from an active lifecycle
 * session, not caller-provided request fields. Pure local validation only.
 */
const { evaluateRuntimeRequest, assertSessionIsolation } = require('./arjuna-x-runtime-policy.cjs');

function evaluateSessionBoundRequest({ sessionSnapshot, requestSessionId, intent, permissions = [], correlationId } = {}) {
  if (!sessionSnapshot || typeof sessionSnapshot !== 'object' || sessionSnapshot.status !== 'active') {
    return { status: 'blocked', reason: 'session_not_active', sideEffects: false };
  }
  const isolation = assertSessionIsolation(sessionSnapshot.sessionId, requestSessionId);
  if (isolation.status !== 'ok') return isolation;
  if (!['customer', 'driver', 'partner', 'admin'].includes(sessionSnapshot.role)) {
    return { status: 'blocked', reason: 'invalid_session_role', sideEffects: false };
  }
  return evaluateRuntimeRequest({
    sessionId: sessionSnapshot.sessionId,
    role: sessionSnapshot.role,
    permissions,
    intent,
    correlationId
  });
}

module.exports = { evaluateSessionBoundRequest };
