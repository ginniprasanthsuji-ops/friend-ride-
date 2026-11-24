'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { BikeSpeedWarningEventGuard } = require('../qa/arjuna-x-bike-speed-warning-event-guard.cjs');

test('Phase 10 guard: ride-capacity rejection does not reserve event ID and can recover after terminal reset', () => {
  const guard = new BikeSpeedWarningEventGuard({ maxEvents: 3, maxRides: 1, cooldownMs: 0 });

  assert.deepEqual(guard.evaluate({ rideId: 'ride-1', eventId: 'event-1', nowMs: 1 }), {
    status: 'proposal_accepted', rideId: 'ride-1', eventId: 'event-1', cooldownMs: 0, sideEffects: false,
  });
  assert.deepEqual(guard.evaluate({ rideId: 'ride-2', eventId: 'recoverable-event', nowMs: 2 }), {
    status: 'blocked', reason: 'ride_capacity_reached', sideEffects: false,
  });

  assert.deepEqual(guard.terminateRide({ rideId: 'ride-1', terminalState: 'completed' }), {
    status: 'reset', rideId: 'ride-1', terminalState: 'completed', sideEffects: false,
  });

  assert.deepEqual(guard.evaluate({ rideId: 'ride-2', eventId: 'recoverable-event', nowMs: 3 }), {
    status: 'proposal_accepted', rideId: 'ride-2', eventId: 'recoverable-event', cooldownMs: 0, sideEffects: false,
  });
});
