'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { BikeSpeedWarningEventGuard } = require('../qa/arjuna-x-bike-speed-warning-event-guard.cjs');

test('Phase 10 guard: terminal reset frees ride slot but keeps replay IDs and event capacity', () => {
  const guard = new BikeSpeedWarningEventGuard({ maxEvents: 2, maxRides: 1, cooldownMs: 0 });
  assert.equal(guard.evaluate({ rideId: 'ride-1', eventId: 'event-1', nowMs: 1 }).status, 'proposal_accepted');
  assert.equal(guard.terminateRide({ rideId: 'ride-1', terminalState: 'completed' }).status, 'reset');
  assert.equal(guard.evaluate({ rideId: 'ride-2', eventId: 'event-2', nowMs: 2 }).status, 'proposal_accepted', 'ride slot is released');
  assert.deepEqual(guard.evaluate({ rideId: 'ride-3', eventId: 'event-3', nowMs: 3 }), { status: 'blocked', reason: 'event_capacity_reached', sideEffects: false });
  assert.deepEqual(guard.evaluate({ rideId: 'ride-2', eventId: 'event-1', nowMs: 4 }), { status: 'blocked', reason: 'duplicate_event_id', sideEffects: false });
});

test('Phase 10 guard: zero cooldown allows sequential distinct events while duplicate IDs stay blocked', () => {
  const guard = new BikeSpeedWarningEventGuard({ cooldownMs: 0 });
  assert.equal(guard.evaluate({ rideId: 'ride-1', eventId: 'event-1', nowMs: 10 }).status, 'proposal_accepted');
  assert.equal(guard.evaluate({ rideId: 'ride-1', eventId: 'event-2', nowMs: 10 }).status, 'proposal_accepted');
  assert.deepEqual(guard.evaluate({ rideId: 'ride-1', eventId: 'event-2', nowMs: 11 }), { status: 'blocked', reason: 'duplicate_event_id', sideEffects: false });
});

test('Phase 10 guard: whitespace-only event ID and ride ID fail closed', () => {
  const guard = new BikeSpeedWarningEventGuard();
  assert.deepEqual(guard.evaluate({ rideId: '   ', eventId: 'event-1', nowMs: 10 }), { status: 'blocked', reason: 'invalid_event_context', sideEffects: false });
  assert.deepEqual(guard.evaluate({ rideId: 'ride-1', eventId: '   ', nowMs: 10 }), { status: 'blocked', reason: 'invalid_event_context', sideEffects: false });
});
