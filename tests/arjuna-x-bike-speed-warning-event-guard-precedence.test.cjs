'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { BikeSpeedWarningEventGuard } = require('../qa/arjuna-x-bike-speed-warning-event-guard.cjs');

test('Phase 10 guard: invalid terminal request does not clear tracked cooldown', () => {
  const guard = new BikeSpeedWarningEventGuard({ cooldownMs: 60_000 });
  assert.equal(guard.evaluate({ rideId: 'ride-1', eventId: 'event-1', nowMs: 100 }).status, 'proposal_accepted');
  assert.deepEqual(guard.terminateRide({ rideId: 'ride-1', terminalState: 'unknown' }), { status: 'blocked', reason: 'invalid_terminal_context', sideEffects: false });
  assert.deepEqual(guard.evaluate({ rideId: 'ride-1', eventId: 'event-2', nowMs: 101 }), { status: 'suppressed', reason: 'ride_cooldown', sideEffects: false });
});

test('Phase 10 guard: duplicate event is rejected before ride capacity check', () => {
  const guard = new BikeSpeedWarningEventGuard({ maxEvents: 5, maxRides: 1, cooldownMs: 0 });
  assert.equal(guard.evaluate({ rideId: 'ride-1', eventId: 'event-1', nowMs: 1 }).status, 'proposal_accepted');
  assert.deepEqual(guard.evaluate({ rideId: 'ride-2', eventId: 'event-1', nowMs: 2 }), { status: 'blocked', reason: 'duplicate_event_id', sideEffects: false });
  assert.deepEqual(guard.evaluate({ rideId: 'ride-2', eventId: 'event-2', nowMs: 2 }), { status: 'blocked', reason: 'ride_capacity_reached', sideEffects: false });
});

test('Phase 10 guard: duplicate event ID remains rejected after event capacity is full', () => {
  const guard = new BikeSpeedWarningEventGuard({ maxEvents: 1, maxRides: 2, cooldownMs: 0 });
  assert.equal(guard.evaluate({ rideId: 'ride-1', eventId: 'event-1', nowMs: 1 }).status, 'proposal_accepted');
  assert.deepEqual(guard.evaluate({ rideId: 'ride-2', eventId: 'event-1', nowMs: 2 }), { status: 'blocked', reason: 'duplicate_event_id', sideEffects: false });
  assert.deepEqual(guard.evaluate({ rideId: 'ride-2', eventId: 'event-2', nowMs: 2 }), { status: 'blocked', reason: 'event_capacity_reached', sideEffects: false });
});

test('Phase 10 guard: stale timestamp rejection does not reserve ID; valid retry is cooldown-suppressed', () => {
  const guard = new BikeSpeedWarningEventGuard({ cooldownMs: 60_000 });
  assert.equal(guard.evaluate({ rideId: 'ride-1', eventId: 'event-1', nowMs: 100 }).status, 'proposal_accepted');
  assert.deepEqual(guard.evaluate({ rideId: 'ride-1', eventId: 'stale-event', nowMs: 99 }), { status: 'blocked', reason: 'stale_event_time', sideEffects: false });
  assert.deepEqual(guard.evaluate({ rideId: 'ride-1', eventId: 'stale-event', nowMs: 101 }), { status: 'blocked', reason: 'duplicate_event_id', sideEffects: false });
});
