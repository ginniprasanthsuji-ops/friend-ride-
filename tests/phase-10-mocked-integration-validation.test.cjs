'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateRuntimeRequest } = require('../qa/arjuna-x-runtime-policy.cjs');
const { RuntimeSessionLifecycle } = require('../qa/arjuna-x-runtime-lifecycle.cjs');
const { decideRetry } = require('../qa/arjuna-x-retry-policy.cjs');
const { decideRecovery } = require('../qa/arjuna-x-recovery-policy.cjs');
const { createCorrelationContext, sanitizeDiagnosticEvent } = require('../qa/arjuna-x-diagnostics-context.cjs');

function mockAdapter(outcome) {
  const calls = [];
  return {
    calls,
    async invoke(input) {
      calls.push(input);
      if (outcome === 'transient') throw Object.assign(new Error('mock transient'), { code: 'NETWORK_UNAVAILABLE' });
      if (outcome === 'mutation-timeout') throw Object.assign(new Error('mock timeout'), { code: 'PAYMENT' });
      return { ok: true, value: 'mock-only' };
    }
  };
}

test('Phase 10 mocked integration validation: policy, lifecycle, context, diagnostics connect', async () => {
  const life = new RuntimeSessionLifecycle({ ttlMs: 60000, maxSessions: 4, maxRequestsPerSession: 4 });
  life.openSession('s-int-1', 'customer');
  const request = life.beginRequest('s-int-1', 'r-int-1');
  assert.equal(request.status, 'started');

  const context = createCorrelationContext({ correlationId: 'c-int-1', requestId: 'r-int-1', sessionId: 's-int-1', role: 'customer' });
  const proposal = evaluateRuntimeRequest({ sessionId: 's-int-1', role: 'customer', permissions: [], correlationId: 'c-int-1', intent: { type: 'navigate', target: 'ride' } });
  assert.equal(proposal.status, 'proposal');
  assert.equal(proposal.sideEffects, false);
  const event = sanitizeDiagnosticEvent({ type: 'request_started', context, fields: { module: 'runtime', operation: 'mock', role: 'customer', status: 'started' } });
  assert.equal(event.accepted, true);
  assert.equal(life.finishRequest('s-int-1', 'r-int-1').status, 'completed');
  assert.equal(life.snapshot('s-int-1').requests[0].status, 'completed');
});

test('Phase 10 mocked integration validation: transient idempotent error chooses bounded retry only', async () => {
  const adapter = mockAdapter('transient');
  let error;
  try { await adapter.invoke({ idempotent: true, action: 'read-only-mock' }); } catch (e) { error = e; }
  const decision = decideRetry({ attempt: 1, maxAttempts: 3, idempotent: true, errorCode: error.code });
  assert.equal(decision.retry, true);
  assert.equal(decision.nextAttempt, 2);
  assert.equal(decision.delayMs, 250);
  assert.equal(adapter.calls.length, 1, 'policy only decides; it does not auto-retry');
});

test('Phase 10 mocked integration validation: non-idempotent payment timeout blocks replay', async () => {
  const adapter = mockAdapter('mutation-timeout');
  let error;
  try { await adapter.invoke({ idempotent: false, action: 'payment-mock' }); } catch (e) { error = e; }
  const retry = decideRetry({ attempt: 1, idempotent: false, errorCode: error.code });
  const recovery = decideRecovery({ errorCode: error.code, sideEffectCommitted: true });
  assert.equal(retry.retry, false);
  assert.equal(recovery.recover, false);
  assert.equal(recovery.reconcileRequired, true);
  assert.equal(adapter.calls.length, 1);
});

test('Phase 10 mocked integration validation: blocked intent remains side-effect-free and diagnostic is sanitized', () => {
  const blocked = evaluateRuntimeRequest({ sessionId: 's-int-2', role: 'customer', permissions: [], correlationId: 'c-int-2', intent: { type: 'pay', amount: 1000 } });
  assert.equal(blocked.status, 'blocked');
  assert.equal(blocked.sideEffects, false);
  const context = createCorrelationContext({ correlationId: 'c-int-2', requestId: 'r-int-2', sessionId: 's-int-2', role: 'customer' });
  const event = sanitizeDiagnosticEvent({ type: 'policy_blocked', context, fields: { errorCode: 'POLICY_BLOCKED', prompt: 'private prompt', token: 'secret-token', address: 'private address' } });
  assert.equal(event.accepted, true);
  assert.deepEqual(event.event.fields, { errorCode: 'POLICY_BLOCKED' });
  assert.equal(JSON.stringify(event).includes('private prompt'), false);
  assert.equal(JSON.stringify(event).includes('secret-token'), false);
  assert.equal(JSON.stringify(event).includes('private address'), false);
});

test('Phase 10 mocked integration validation: session mismatch and invalid context fail closed', () => {
  const blocked = evaluateRuntimeRequest({ sessionId: 's-one', role: 'customer', permissions: [], intent: { type: 'navigate', target: 'home' } });
  assert.equal(blocked.status, 'proposal');
  const context = createCorrelationContext({ correlationId: 'c-mismatch', requestId: 'r-mismatch', sessionId: 's-two', role: 'driver' });
  const diagnostic = sanitizeDiagnosticEvent({ type: 'request_started', context, fields: { role: 'driver' } });
  assert.equal(diagnostic.accepted, true);
  assert.equal(context.sessionId, 's-two');
  assert.equal(context.role, 'driver');
  assert.throws(() => createCorrelationContext({ correlationId: 'bad id', requestId: 'r', sessionId: 's', role: 'customer' }));
});

test('Phase 10 integration matrix: role restrictions and confirmation gate', () => {
  const driverRide = evaluateRuntimeRequest({ sessionId: 's-role', role: 'driver', permissions: [], intent: { type: 'select_ride', rideType: 'bike' } });
  assert.equal(driverRide.status, 'blocked');
  assert.equal(driverRide.sideEffects, false);

  const customerRide = evaluateRuntimeRequest({ sessionId: 's-role', role: 'customer', permissions: [], intent: { type: 'select_ride', rideType: 'auto' } });
  assert.equal(customerRide.status, 'proposal');
  assert.equal(customerRide.sideEffects, false);

  const bookingReview = evaluateRuntimeRequest({ sessionId: 's-role', role: 'customer', permissions: [], intent: { type: 'review_booking', requiresConfirmation: true, execution: 'none' } });
  assert.equal(bookingReview.status, 'confirmation_required');
  assert.equal(bookingReview.confirmation, 'explicit_in_app');
  assert.equal(bookingReview.sideEffects, false);
});

test('Phase 10 integration matrix: session isolation guard rejects mismatched sessions', () => {
  const { assertSessionIsolation } = require('../qa/arjuna-x-runtime-policy.cjs');
  assert.deepEqual(assertSessionIsolation('session-A', 'session-A'), { status: 'ok', sideEffects: false });
  const mismatch = assertSessionIsolation('session-A', 'session-B');
  assert.equal(mismatch.status, 'blocked');
  assert.equal(mismatch.reason, 'session_mismatch');
  assert.equal(mismatch.sideEffects, false);
});

test('Phase 10 integration matrix: session close aborts running request and prevents late completion', () => {
  const life = new RuntimeSessionLifecycle({ ttlMs: 60000, maxSessions: 2, maxRequestsPerSession: 2 });
  life.openSession('s-close', 'customer');
  const started = life.beginRequest('s-close', 'r-close');
  assert.equal(started.status, 'started');
  assert.equal(started.signal.aborted, false);
  assert.equal(life.closeSession('s-close').status, 'closed');
  assert.equal(started.signal.aborted, true);
  assert.equal(life.finishRequest('s-close', 'r-close').status, 'blocked');
  assert.equal(life.beginRequest('s-close', 'r-late').status, 'blocked');
});

test('Phase 10 cross-module workflow matrix: navigation, ride selection, booking review, unknown intent', () => {
  const navigation = evaluateRuntimeRequest({ sessionId: 's-matrix', role: 'customer', permissions: [], intent: { type: 'navigate', target: 'orders' } });
  assert.equal(navigation.status, 'proposal');
  assert.equal(navigation.action.target, 'orders');
  assert.equal(navigation.sideEffects, false);

  const ride = evaluateRuntimeRequest({ sessionId: 's-matrix', role: 'customer', permissions: [], intent: { type: 'select_ride', rideType: 'car' } });
  assert.equal(ride.status, 'proposal');
  assert.equal(ride.action.rideType, 'car');
  assert.equal(ride.sideEffects, false);

  const review = evaluateRuntimeRequest({ sessionId: 's-matrix', role: 'customer', permissions: [], intent: { type: 'review_booking', requiresConfirmation: true, execution: 'none' } });
  assert.equal(review.status, 'confirmation_required');
  assert.equal(review.sideEffects, false);

  const unknown = evaluateRuntimeRequest({ sessionId: 's-matrix', role: 'customer', permissions: [], intent: { type: 'unknown', payload: 'ignored' } });
  assert.equal(unknown.status, 'blocked');
  assert.equal(unknown.sideEffects, false);
});

test('Phase 10 recovery matrix: completed operations, confirmation, and unknown errors fail closed', () => {
  const completed = decideRecovery({ errorCode: 'TIMEOUT', operationCompleted: true });
  assert.equal(completed.recover, false);
  assert.equal(completed.fallback, 'return_completion_status');
  assert.equal(completed.reconcileRequired, false);

  const confirmed = decideRecovery({ errorCode: 'NETWORK_UNAVAILABLE', userConfirmed: true });
  assert.equal(confirmed.recover, false);
  assert.equal(confirmed.reason, 'confirmation_does_not_authorize_automatic_replay');

  const unknown = decideRecovery({ errorCode: 'UNRECOGNIZED_ERROR' });
  assert.equal(unknown.recover, true);
  assert.equal(unknown.fallback, 'return_generic_failure');
});

test('Phase 10 retry matrix: attempt ceiling and unknown errors deny retries', () => {
  const ceiling = decideRetry({ attempt: 3, maxAttempts: 3, idempotent: true, errorCode: 'TIMEOUT' });
  assert.equal(ceiling.retry, false);
  assert.equal(ceiling.reason, 'attempt_limit_reached');

  const unknown = decideRetry({ attempt: 1, maxAttempts: 3, idempotent: true, errorCode: 'UNRECOGNIZED_ERROR' });
  assert.equal(unknown.retry, false);
  assert.equal(unknown.reason, 'unknown_error_fail_closed');
});

test('Phase 10 role/session binding matrix: session role is authoritative and mismatched request is blocked', () => {
  const life = new RuntimeSessionLifecycle({ ttlMs: 60000, maxSessions: 3, maxRequestsPerSession: 3 });
  life.openSession('s-customer-bound', 'customer');
  const session = life.snapshot('s-customer-bound');
  assert.equal(session.role, 'customer');

  const driverIntent = evaluateRuntimeRequest({ sessionId: session.sessionId, role: 'driver', permissions: [], intent: { type: 'select_ride', rideType: 'bike' } });
  assert.equal(driverIntent.status, 'blocked');
  assert.equal(driverIntent.sideEffects, false);

  const binding = require('../qa/arjuna-x-runtime-policy.cjs').assertSessionIsolation(session.sessionId, 'different-session');
  assert.equal(binding.status, 'blocked');
  assert.equal(binding.sideEffects, false);
});

test('Phase 10 diagnostics boundary matrix: event allowlist, context validation, field filtering', () => {
  const context = createCorrelationContext({ correlationId: 'c-safe', requestId: 'r-safe', sessionId: 's-safe', role: 'unknown-role' });
  assert.equal(context.role, 'unknown');

  const deniedType = sanitizeDiagnosticEvent({ type: 'raw_prompt_dump', context, fields: { status: 'ok' } });
  assert.equal(deniedType.accepted, false);
  assert.equal(deniedType.reason, 'event_type_not_allowlisted');

  const missingContext = sanitizeDiagnosticEvent({ type: 'request_started', fields: { status: 'ok' } });
  assert.equal(missingContext.accepted, false);
  assert.equal(missingContext.reason, 'missing_context');

  const safe = sanitizeDiagnosticEvent({ type: 'request_completed', context, fields: {
    module: 'runtime', status: 'completed', attempt: 2, durationMs: 50,
    errorCode: 'TIMEOUT', prompt: 'should-not-log', token: 'should-not-log',
    negativeDuration: -5, oversized: 'x'.repeat(100)
  } });
  assert.equal(safe.accepted, true);
  assert.deepEqual(safe.event.fields, { module: 'runtime', status: 'completed', attempt: 2, durationMs: 50, errorCode: 'TIMEOUT' });
  assert.equal(JSON.stringify(safe).includes('should-not-log'), false);
});

test('Phase 10 failure-path integration: blocked policy request is marked failed with sanitized diagnostic', () => {
  const life = new RuntimeSessionLifecycle({ ttlMs: 60000, maxSessions: 2, maxRequestsPerSession: 2 });
  life.openSession('s-fail', 'customer');
  const started = life.beginRequest('s-fail', 'r-blocked');
  assert.equal(started.status, 'started');

  const decision = evaluateRuntimeRequest({ sessionId: 's-fail', role: 'customer', permissions: [], correlationId: 'c-blocked', intent: { type: 'pay', amount: 500 } });
  assert.equal(decision.status, 'blocked');
  assert.equal(decision.sideEffects, false);
  assert.equal(life.finishRequest('s-fail', 'r-blocked', 'failed').status, 'failed');

  const ctx = createCorrelationContext({ correlationId: 'c-blocked', requestId: 'r-blocked', sessionId: 's-fail', role: 'customer' });
  const event = sanitizeDiagnosticEvent({ type: 'policy_blocked', context: ctx, fields: { module: 'runtime', operation: 'policy', status: 'blocked', errorCode: 'POLICY_BLOCKED', amount: 500 } });
  assert.equal(event.accepted, true);
  assert.deepEqual(event.event.fields, { module: 'runtime', operation: 'policy', status: 'blocked', errorCode: 'POLICY_BLOCKED' });
});

test('Phase 10 timeout integration: lifecycle cancellation, recovery decision, and diagnostic correlate', () => {
  const life = new RuntimeSessionLifecycle({ ttlMs: 60000, maxSessions: 2, maxRequestsPerSession: 2 });
  life.openSession('s-timeout', 'customer');
  const started = life.beginRequest('s-timeout', 'r-timeout');
  assert.equal(started.status, 'started');
  assert.equal(life.timeoutRequest('s-timeout', 'r-timeout').status, 'timed_out');
  assert.equal(started.signal.aborted, true);

  const recovery = decideRecovery({ errorCode: 'TIMEOUT', operationCompleted: false, sideEffectCommitted: false });
  assert.equal(recovery.recover, true);
  assert.equal(recovery.fallback, 'return_timeout_status');

  const ctx = createCorrelationContext({ correlationId: 'c-timeout', requestId: 'r-timeout', sessionId: 's-timeout', role: 'customer' });
  const diagnostic = sanitizeDiagnosticEvent({ type: 'request_timed_out', context: ctx, fields: { module: 'runtime', operation: 'mock-read', status: 'timed_out', durationMs: 120 } });
  assert.equal(diagnostic.accepted, true);
  assert.equal(diagnostic.event.context.requestId, 'r-timeout');
});

test('Phase 10 capacity integration: duplicate request and request cap are rejected without creating extra work', () => {
  const life = new RuntimeSessionLifecycle({ ttlMs: 60000, maxSessions: 1, maxRequestsPerSession: 1 });
  life.openSession('s-cap', 'partner');
  assert.equal(life.beginRequest('s-cap', 'r-one').status, 'started');
  assert.equal(life.beginRequest('s-cap', 'r-one').status, 'duplicate');
  assert.equal(life.beginRequest('s-cap', 'r-two').status, 'blocked');
  assert.equal(life.snapshot('s-cap').requestCount, 1);
});

test('Phase 10 TTL integration: expired session blocks request and aborts active signal', () => {
  let now = 1000;
  const life = new RuntimeSessionLifecycle({ ttlMs: 50, maxSessions: 2, maxRequestsPerSession: 2, now: () => now });
  life.openSession('s-ttl', 'driver');
  const started = life.beginRequest('s-ttl', 'r-active');
  now = 1051;
  assert.equal(life.beginRequest('s-ttl', 'r-new').status, 'blocked');
  assert.equal(started.signal.aborted, true);
  assert.equal(life.snapshot('s-ttl'), undefined);
});

test('Phase 10 session-bound contract: lifecycle source is authoritative and caller snapshot is rejected', () => {
  const { evaluateSessionBoundRequest } = require('../qa/arjuna-x-session-bound-runtime.cjs');
  const life = new RuntimeSessionLifecycle({ ttlMs: 60000, maxSessions: 2, maxRequestsPerSession: 2 });
  life.openSession('s-bound-role', 'customer');

  const customerRequest = evaluateSessionBoundRequest({
    lifecycle: life, sessionId: 's-bound-role', requestSessionId: 's-bound-role',
    intent: { type: 'select_ride', rideType: 'auto' }
  });
  assert.equal(customerRequest.status, 'proposal');
  assert.equal(customerRequest.action.rideType, 'auto');
  assert.equal(customerRequest.sideEffects, false);

  const forgedSnapshot = evaluateSessionBoundRequest({
    sessionSnapshot: { sessionId: 's-bound-role', status: 'active', role: 'admin' },
    requestSessionId: 's-bound-role', intent: { type: 'navigate', target: 'home' }
  });
  assert.equal(forgedSnapshot.status, 'blocked');
  assert.equal(forgedSnapshot.reason, 'invalid_lifecycle_source');

  const mismatch = evaluateSessionBoundRequest({
    lifecycle: life, sessionId: 's-bound-role', requestSessionId: 's-other',
    intent: { type: 'navigate', target: 'home' }
  });
  assert.equal(mismatch.status, 'blocked');
  assert.equal(mismatch.reason, 'session_mismatch');
  assert.equal(mismatch.sideEffects, false);

  life.closeSession('s-bound-role');
  const inactive = evaluateSessionBoundRequest({
    lifecycle: life, sessionId: 's-bound-role', requestSessionId: 's-bound-role',
    intent: { type: 'navigate', target: 'home' }
  });
  assert.equal(inactive.status, 'blocked');
  assert.equal(inactive.reason, 'session_not_active');
});

test('Phase 10 session-bound role matrix: customer-only ride selection enforced for all roles', () => {
  const { evaluateSessionBoundRequest } = require('../qa/arjuna-x-session-bound-runtime.cjs');
  for (const role of ['customer', 'driver', 'partner', 'admin']) {
    const life = new RuntimeSessionLifecycle({ ttlMs: 60000, maxSessions: 2, maxRequestsPerSession: 2 });
    life.openSession('s-role-' + role, role);
    const ride = evaluateSessionBoundRequest({
      lifecycle: life, sessionId: 's-role-' + role, requestSessionId: 's-role-' + role,
      intent: { type: 'select_ride', rideType: 'bike' }
    });
    if (role === 'customer') {
      assert.equal(ride.status, 'proposal');
      assert.equal(ride.sideEffects, false);
    } else {
      assert.equal(ride.status, 'blocked');
      assert.equal(ride.sideEffects, false);
    }
    const navigation = evaluateSessionBoundRequest({
      lifecycle: life, sessionId: 's-role-' + role, requestSessionId: 's-role-' + role,
      intent: { type: 'navigate', target: 'profile' }
    });
    assert.equal(navigation.status, 'proposal');
    assert.equal(navigation.sideEffects, false);
  }
});


test('Phase 10 bike safety integration: speed warning policy is bike-only and notification remains a proposal', () => {
  const { evaluateBikeSpeedWarning } = require('../qa/arjuna-x-bike-speed-warning.cjs');
  const overLimit = evaluateBikeSpeedWarning({ rideType: 'bike', speedKmh: 55, accuracyMeters: 4, sampleAgeMs: 1000, nowMs: 5000 });
  assert.equal(overLimit.status, 'warning_proposal');
  assert.deepEqual(overLimit.recipients, ['driver', 'customer']);
  assert.equal(overLimit.sideEffects, false, 'mock policy must not send notifications');

  for (const rideType of ['auto', 'car', 'delivery']) {
    const excluded = evaluateBikeSpeedWarning({ rideType, speedKmh: 80, accuracyMeters: 4, sampleAgeMs: 1000, nowMs: 5000 });
    assert.equal(excluded.status, 'ignored');
    assert.deepEqual(excluded.recipients, []);
    assert.equal(excluded.sideEffects, false);
  }
});

test('Phase 10 bike safety integration: threshold, cooldown, and unreliable GPS are fail-safe', () => {
  const { evaluateBikeSpeedWarning } = require('../qa/arjuna-x-bike-speed-warning.cjs');
  const threshold = evaluateBikeSpeedWarning({ rideType: 'bike', speedKmh: 50, accuracyMeters: 3, nowMs: 6000 });
  assert.equal(threshold.status, 'within_limit');

  const cooldown = evaluateBikeSpeedWarning({ rideType: 'bike', speedKmh: 67, accuracyMeters: 3, sampleAgeMs: 1000, nowMs: 50000, lastWarningAtMs: 10000 });
  assert.equal(cooldown.status, 'warning_suppressed');
  assert.equal(cooldown.sideEffects, false);

  const unreliable = evaluateBikeSpeedWarning({ rideType: 'bike', speedKmh: 90, accuracyMeters: 40, sampleAgeMs: 1000, nowMs: 6000 });
  assert.equal(unreliable.status, 'blocked');
  assert.equal(unreliable.reason, 'gps_sample_unreliable');
  assert.deepEqual(unreliable.recipients, []);
});
