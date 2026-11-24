'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { BikeSpeedWarningEventGuard } = require('../qa/arjuna-x-bike-speed-warning-event-guard.cjs');

test('Phase 10 guard: canonical ride ID terminal reset releases capacity and preserves replay history', () => {
  const guard = new BikeSpeedWarningEventGuard({ cooldownMs: 0, maxRides: 1, maxEvents: 3 });
  assert.equal(guard.evaluate({ rideId: ' ride-A ', eventId: 'evt-A', nowMs: 1 }).status, 'proposal_accepted');
  assert.deepEqual(guard.evaluate({ rideId: 'ride-A', eventId: 'evt-A', nowMs: 2 }), {
    status: 'blocked', reason: 'duplicate_event_id', sideEffects: false
  });
  assert.deepEqual(guard.terminateRide({ rideId: ' ride-A ', terminalState: 'completed' }), {
    status: 'reset', rideId: 'ride-A', terminalState: 'completed', sideEffects: false
  });
  assert.deepEqual(guard.evaluate({ rideId: 'ride-B', eventId: 'evt-B', nowMs: 3 }), {
    status: 'proposal_accepted', rideId: 'ride-B', eventId: 'evt-B', cooldownMs: 0, sideEffects: false
  });
  assert.deepEqual(guard.evaluate({ rideId: ' ride-A ', eventId: 'evt-A', nowMs: 4 }), {
    status: 'blocked', reason: 'duplicate_event_id', sideEffects: false
  });
});
