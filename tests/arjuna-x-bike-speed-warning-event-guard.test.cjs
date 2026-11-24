'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { BikeSpeedWarningEventGuard } = require('../qa/arjuna-x-bike-speed-warning-event-guard.cjs');

test('Phase 10 warning-event guard: duplicate event ID rejected', () => {
  const guard = new BikeSpeedWarningEventGuard();
  assert.equal(guard.evaluate({ rideId: 'ride-1', eventId: 'evt-1', nowMs: 1000 }).status, 'proposal_accepted');
  assert.deepEqual(guard.evaluate({ rideId: 'ride-1', eventId: 'evt-1', nowMs: 1001 }), { status: 'blocked', reason: 'duplicate_event_id', sideEffects: false });
});

test('Phase 10 warning-event guard: per-ride cooldown suppresses distinct duplicate alerts', () => {
  const guard = new BikeSpeedWarningEventGuard({ cooldownMs: 60_000 });
  assert.equal(guard.evaluate({ rideId: 'ride-1', eventId: 'evt-1', nowMs: 1000 }).status, 'proposal_accepted');
  assert.deepEqual(guard.evaluate({ rideId: 'ride-1', eventId: 'evt-2', nowMs: 59_999 }), { status: 'suppressed', reason: 'ride_cooldown', sideEffects: false });
  assert.equal(guard.evaluate({ rideId: 'ride-2', eventId: 'evt-3', nowMs: 59_999 }).status, 'proposal_accepted', 'cooldown is isolated per ride');
  assert.equal(guard.evaluate({ rideId: 'ride-1', eventId: 'evt-4', nowMs: 61_000 }).status, 'proposal_accepted', 'exact cooldown boundary is allowed');
});

test('Phase 10 warning-event guard: invalid IDs and time fail closed', () => {
  const guard = new BikeSpeedWarningEventGuard();
  assert.deepEqual(guard.evaluate({ rideId: '', eventId: 'evt', nowMs: 1 }), { status: 'blocked', reason: 'invalid_event_context', sideEffects: false });
  assert.deepEqual(guard.evaluate({ rideId: 'ride', eventId: 'evt', nowMs: -1 }), { status: 'blocked', reason: 'invalid_event_context', sideEffects: false });
  assert.deepEqual(guard.evaluate({ rideId: 'ride', eventId: 'evt', nowMs: 1.5 }), { status: 'blocked', reason: 'invalid_event_context', sideEffects: false });
});
