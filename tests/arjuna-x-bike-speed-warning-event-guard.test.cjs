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

test('Phase 10 warning-event guard: capacity limits fail closed and do not grow unbounded', () => {
  const eventLimited = new BikeSpeedWarningEventGuard({ maxEvents: 1, maxRides: 2 });
  assert.equal(eventLimited.evaluate({ rideId: 'ride-1', eventId: 'evt-1', nowMs: 1 }).status, 'proposal_accepted');
  assert.deepEqual(eventLimited.evaluate({ rideId: 'ride-1', eventId: 'evt-2', nowMs: 60_001 }), { status: 'blocked', reason: 'event_capacity_reached', sideEffects: false });

  const rideLimited = new BikeSpeedWarningEventGuard({ maxEvents: 5, maxRides: 1 });
  assert.equal(rideLimited.evaluate({ rideId: 'ride-1', eventId: 'evt-1', nowMs: 1 }).status, 'proposal_accepted');
  assert.deepEqual(rideLimited.evaluate({ rideId: 'ride-2', eventId: 'evt-2', nowMs: 1 }), { status: 'blocked', reason: 'ride_capacity_reached', sideEffects: false });
});

test('Phase 10 warning-event guard: invalid capacity configuration throws', () => {
  assert.throws(() => new BikeSpeedWarningEventGuard({ maxEvents: 0 }), /invalid_max_events/);
  assert.throws(() => new BikeSpeedWarningEventGuard({ maxRides: -1 }), /invalid_max_rides/);
});

test('Phase 10 warning-event guard: stale timestamp is rejected without advancing state', () => {
  const guard = new BikeSpeedWarningEventGuard();
  assert.equal(guard.evaluate({ rideId: 'ride-1', eventId: 'evt-1', nowMs: 20_000 }).status, 'proposal_accepted');
  assert.deepEqual(guard.evaluate({ rideId: 'ride-1', eventId: 'evt-2', nowMs: 19_999 }), { status: 'blocked', reason: 'stale_event_time', sideEffects: false });
  assert.equal(guard.evaluate({ rideId: 'ride-1', eventId: 'evt-3', nowMs: 80_000 }).status, 'proposal_accepted');
});

test('Phase 10 warning-event guard: terminal ride state clears cooldown only, not replay history', () => {
  const guard = new BikeSpeedWarningEventGuard({ cooldownMs: 60_000, maxEvents: 10, maxRides: 1 });
  assert.equal(guard.evaluate({ rideId: 'ride-1', eventId: 'evt-1', nowMs: 1000 }).status, 'proposal_accepted');
  assert.deepEqual(guard.terminateRide({ rideId: 'ride-1', terminalState: 'completed' }), { status: 'reset', rideId: 'ride-1', terminalState: 'completed', sideEffects: false });
  assert.equal(guard.evaluate({ rideId: 'ride-1', eventId: 'evt-2', nowMs: 2000 }).status, 'proposal_accepted', 'terminal reset removes cooldown');
  assert.deepEqual(guard.evaluate({ rideId: 'ride-1', eventId: 'evt-1', nowMs: 2001 }), { status: 'blocked', reason: 'duplicate_event_id', sideEffects: false });
});

test('Phase 10 warning-event guard: terminal reset rejects unknown states and invalid IDs', () => {
  const guard = new BikeSpeedWarningEventGuard();
  assert.deepEqual(guard.terminateRide({ rideId: 'ride', terminalState: 'active' }), { status: 'blocked', reason: 'invalid_terminal_context', sideEffects: false });
  assert.deepEqual(guard.terminateRide({ rideId: '', terminalState: 'cancelled' }), { status: 'blocked', reason: 'invalid_terminal_context', sideEffects: false });
});
