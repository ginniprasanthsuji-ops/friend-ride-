'use strict';

/**
 * ARJUNA X Phase 9 runtime session/request lifecycle.
 * Local lifecycle coordination only: no backend, network, booking, payment, GPS or mic effects.
 */
const SAFE_ROLES = new Set(['customer', 'driver', 'partner', 'admin']);
const REQUEST_STATES = new Set(['running', 'completed', 'failed', 'cancelled']);

function validId(value, label) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > 128) {
    throw new Error(label + ' must be a non-empty string (max 128 chars)');
  }
  return value.trim();
}

class RuntimeSessionLifecycle {
  constructor(options = {}) {
    const { ttlMs = 30 * 60 * 1000, maxSessions = 100, maxRequestsPerSession = 100, now = () => Date.now() } = options;
    for (const [label, value] of [['ttlMs', ttlMs], ['maxSessions', maxSessions], ['maxRequestsPerSession', maxRequestsPerSession]]) {
      if (!Number.isInteger(value) || value < 1) throw new Error(label + ' must be a positive integer');
    }
    if (typeof now !== 'function') throw new Error('now must be a function');
    this.ttlMs = ttlMs;
    this.maxSessions = maxSessions;
    this.maxRequestsPerSession = maxRequestsPerSession;
    this.now = now;
    this.sessions = new Map();
  }

  openSession(sessionId, role) {
    const id = validId(sessionId, 'sessionId');
    if (!SAFE_ROLES.has(role)) throw new Error('Invalid role');
    this._expireStale();
    if (this.sessions.has(id)) throw new Error('Session already exists');
    if ([...this.sessions.values()].filter((s) => s.status === 'active').length >= this.maxSessions) throw new Error('Session capacity reached');
    const time = this.now();
    const session = { id, role, status: 'active', createdAt: time, lastActivityAt: time, requests: new Map() };
    this.sessions.set(id, session);
    return this.snapshot(id);
  }

  snapshot(sessionId) {
    const session = this._getActive(sessionId);
    if (!session) return undefined;
    return {
      sessionId: session.id,
      role: session.role,
      status: session.status,
      createdAt: session.createdAt,
      lastActivityAt: session.lastActivityAt,
      requestCount: session.requests.size,
      requests: [...session.requests.values()].map(({ id, status, startedAt, endedAt }) => ({ id, status, startedAt, endedAt }))
    };
  }

  beginRequest(sessionId, requestId) {
    const session = this._getActive(sessionId);
    if (!session) return { status: 'blocked', reason: 'session_not_active' };
    const id = validId(requestId, 'requestId');
    if (session.requests.has(id)) return { status: 'duplicate', reason: 'request_id_already_used' };
    if (session.requests.size >= this.maxRequestsPerSession) return { status: 'blocked', reason: 'request_limit_reached' };
    const controller = new AbortController();
    const record = { id, status: 'running', startedAt: this.now(), endedAt: undefined, controller };
    session.requests.set(id, record);
    session.lastActivityAt = record.startedAt;
    return { status: 'started', signal: controller.signal };
  }

  finishRequest(sessionId, requestId, outcome = 'completed') {
    if (outcome !== 'completed' && outcome !== 'failed') throw new Error('outcome must be completed or failed');
    const session = this._getActive(sessionId);
    if (!session) return { status: 'blocked', reason: 'session_not_active' };
    const record = session.requests.get(validId(requestId, 'requestId'));
    if (!record) return { status: 'blocked', reason: 'request_not_found' };
    if (record.status !== 'running') return { status: 'blocked', reason: 'request_not_running' };
    record.status = outcome;
    record.endedAt = this.now();
    session.lastActivityAt = record.endedAt;
    return { status: outcome };
  }

  cancelRequest(sessionId, requestId) {
    const session = this._getActive(sessionId);
    if (!session) return { status: 'blocked', reason: 'session_not_active' };
    const record = session.requests.get(validId(requestId, 'requestId'));
    if (!record) return { status: 'blocked', reason: 'request_not_found' };
    if (record.status !== 'running') return { status: 'blocked', reason: 'request_not_running' };
    record.controller.abort();
    record.status = 'cancelled';
    record.endedAt = this.now();
    session.lastActivityAt = record.endedAt;
    return { status: 'cancelled' };
  }

  closeSession(sessionId, status = 'closed') {
    if (!['closed', 'cancelled'].includes(status)) throw new Error('status must be closed or cancelled');
    const id = validId(sessionId, 'sessionId');
    const session = this.sessions.get(id);
    if (!session || session.status !== 'active') return { status: 'not_active' };
    for (const record of session.requests.values()) {
      if (record.status === 'running') {
        record.controller.abort();
        record.status = 'cancelled';
        record.endedAt = this.now();
      }
    }
    session.status = status;
    session.lastActivityAt = this.now();
    return { status };
  }

  _getActive(sessionId) {
    let id;
    try { id = validId(sessionId, 'sessionId'); } catch { return undefined; }
    const session = this.sessions.get(id);
    if (!session || session.status !== 'active') return undefined;
    if (this.now() - session.lastActivityAt >= this.ttlMs) {
      for (const record of session.requests.values()) {
        if (record.status === 'running') {
          record.controller.abort();
          record.status = 'cancelled';
          record.endedAt = this.now();
        }
      }
      session.status = 'expired';
      return undefined;
    }
    return session;
  }

  _expireStale() {
    for (const session of this.sessions.values()) this._getActive(session.id);
  }
}

module.exports = { RuntimeSessionLifecycle, SAFE_ROLES, REQUEST_STATES };
