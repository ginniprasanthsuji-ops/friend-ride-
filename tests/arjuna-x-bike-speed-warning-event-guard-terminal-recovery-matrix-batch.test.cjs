'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { BikeSpeedWarningEventGuard } = require('../qa/arjuna-x-bike-speed-warning-event-guard.cjs');

test('Phase 10 batch: ride-capacity rejected event IDs recover after every terminal state', () => {
  for (const terminalState of ['completed', 'cancelled', 'failed']) {
    const guard = new BikeSpeedWarningEventGuard({ maxEvents: 3, maxRides: 1, cooldownMs: 0 });
    assert.equal(guard.evaluate({ rideId: 'active-ride', eventId: 'active-event', nowMs: 1 }).status, 'proposal_accepted');

    assert.deepEqual(guard.evaluate({ rideId: 'blocked-ride', eventId: 'retry-event', nowMs: 2 }), {
      status: 'blocked', reason: 'ride_capacity_reached', sideEffects: false,
    });

    assert.deepEqual(guard.terminateRide({ rideId: 'active-ride', terminalState }), {
      status: 'reset', rideId: 'active-ride', terminalState, sideEffects: false,
    });

    assert.deepEqual(guard.evaluate({ rideId: 'blocked-ride', eventId: 'retry-event', nowMs: 3 }), {
      status: 'proposal_accepted', rideId: 'blocked-ride', eventId: 'retry-event', cooldownMs: 0, sideEffects: false,
    });
  }
});
