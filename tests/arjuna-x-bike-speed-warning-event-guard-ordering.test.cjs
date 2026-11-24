'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { BikeSpeedWarningEventGuard } = require('../qa/arjuna-x-bike-speed-warning-event-guard.cjs');

test('Phase 10 warning guard: interleaved rides keep independent cooldown clocks', () => {
  const guard = new BikeSpeedWarningEventGuard({ cooldownMs: 60_000 });
  assert.equal(guard.evaluate({ rideId: 'ride-A', eventId: 'A-1', nowMs: 100_000 }).status, 'proposal_accepted');
  assert.equal(guard.evaluate({ rideId: 'ride-B', eventId: 'B-1', nowMs: 10_000 }).status, 'proposal_accepted');
  assert.equal(guard.evaluate({ rideId: 'ride-A', eventId: 'A-2', nowMs: 120_000 }).status, 'suppressed');
  assert.equal(guard.evaluate({ rideId: 'ride-B', eventId: 'B-2', nowMs: 70_000 }).status, 'proposal_accepted');
  assert.equal(guard.evaluate({ rideId: 'ride-A', eventId: 'A-3', nowMs: 160_000 }).status, 'proposal_accepted');
});

test('Phase 10 warning guard: reset of one ride does not clear another ride cooldown', () => {
  const guard = new BikeSpeedWarningEventGuard({ cooldownMs: 60_000 });
  assert.equal(guard.evaluate({ rideId: 'ride-A', eventId: 'A-1', nowMs: 1_000 }).status, 'proposal_accepted');
  assert.equal(guard.evaluate({ rideId: 'ride-B', eventId: 'B-1', nowMs: 1_000 }).status, 'proposal_accepted');
  assert.equal(guard.terminateRide({ rideId: 'ride-A', terminalState: 'cancelled' }).status, 'reset');
  assert.equal(guard.evaluate({ rideId: 'ride-A', eventId: 'A-2', nowMs: 2_000 }).status, 'proposal_accepted');
  assert.deepEqual(guard.evaluate({ rideId: 'ride-B', eventId: 'B-2', nowMs: 2_000 }), { status: 'suppressed', reason: 'ride_cooldown', sideEffects: false });
});

test('Phase 10 warning guard: replay remains blocked after suppression and after ride reset', () => {
  const guard = new BikeSpeedWarningEventGuard({ cooldownMs: 60_000 });
  assert.equal(guard.evaluate({ rideId: 'ride-A', eventId: 'A-1', nowMs: 1_000 }).status, 'proposal_accepted');
  assert.equal(guard.evaluate({ rideId: 'ride-A', eventId: 'A-2', nowMs: 2_000 }).status, 'suppressed');
  assert.deepEqual(guard.evaluate({ rideId: 'ride-A', eventId: 'A-2', nowMs: 70_000 }), { status: 'blocked', reason: 'duplicate_event_id', sideEffects: false });
  assert.equal(guard.terminateRide({ rideId: 'ride-A', terminalState: 'failed' }).status, 'reset');
  assert.deepEqual(guard.evaluate({ rideId: 'ride-A', eventId: 'A-1', nowMs: 71_000 }), { status: 'blocked', reason: 'duplicate_event_id', sideEffects: false });
});

test('Phase 10 warning guard: stale timestamp remains blocked after terminal reset is scoped', () => {
  const guard = new BikeSpeedWarningEventGuard({ cooldownMs: 60_000 });
  assert.equal(guard.evaluate({ rideId: 'ride-A', eventId: 'A-1', nowMs: 10_000 }).status, 'proposal_accepted');
  assert.equal(guard.evaluate({ rideId: 'ride-B', eventId: 'B-1', nowMs: 5_000 }).status, 'proposal_accepted');
  assert.deepEqual(guard.evaluate({ rideId: 'ride-A', eventId: 'A-2', nowMs: 9_999 }), { status: 'blocked', reason: 'stale_event_time', sideEffects: false });
  assert.equal(guard.terminateRide({ rideId: 'ride-A', terminalState: 'completed' }).status, 'reset');
  assert.equal(guard.evaluate({ rideId: 'ride-A', eventId: 'A-3', nowMs: 10_000 }).status, 'proposal_accepted');
  assert.deepEqual(guard.evaluate({ rideId: 'ride-B', eventId: 'B-2', nowMs: 4_999 }), { status: 'blocked', reason: 'stale_event_time', sideEffects: false });
});
