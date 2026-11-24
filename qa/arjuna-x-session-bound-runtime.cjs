'use strict';

/**
 * Phase 10 contract bridge: resolve role from the lifecycle manager itself.
 * Caller-supplied session snapshots/roles are intentionally not accepted.
 */
const { evaluateRuntimeRequest, assertSessionIsolation } = require('./arjuna-x-runtime-policy.cjs');

function evaluateSessionBoundRequest({ lifecycle, sessionId, requestSessionId, intent, permissions = [], correlationId } = {}) {
  if (!lifecycle || typeof lifecycle.snapshot !== 'function') {
    return { status: 'blocked', reason: 'invalid_lifecycle_source', sideEffects: false };
  }
  const sessionSnapshot = lifecycle.snapshot(sessionId);
  if (!sessionSnapshot || sessionSnapshot.status !== 'active') {
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
