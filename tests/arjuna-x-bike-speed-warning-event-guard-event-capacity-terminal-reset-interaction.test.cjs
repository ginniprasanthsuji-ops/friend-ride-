'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { BikeSpeedWarningEventGuard } = require('../qa/arjuna-x-bike-speed-warning-event-guard.cjs');

test('Phase 10 guard: terminal reset releases ride capacity but never releases global event capacity', () => {
  const guard = new BikeSpeedWarningEventGuard({ cooldownMs: 0, maxEvents: 2, maxRides: 1 });

  assert.equal(guard.evaluate({ rideId: 'ride-1', eventId: 'event-1', nowMs: 1 }).status, 'proposal_accepted');
  assert.deepEqual(guard.evaluate({ rideId: 'ride-2', eventId: 'event-2', nowMs: 2 }), {
    status: 'blocked', reason: 'ride_capacity_reached', sideEffects: false
  });

  assert.deepEqual(guard.terminateRide({ rideId: 'ride-1', terminalState: 'completed' }), {
    status: 'reset', rideId: 'ride-1', terminalState: 'completed', sideEffects: false
  });
  assert.equal(guard.evaluate({ rideId: 'ride-2', eventId: 'event-2', nowMs: 3 }).status, 'proposal_accepted');

  assert.deepEqual(guard.evaluate({ rideId: 'ride-3', eventId: 'event-3', nowMs: 4 }), {
    status: 'blocked', reason: 'event_capacity_reached', sideEffects: false
  });
  assert.deepEqual(guard.terminateRide({ rideId: 'ride-2', terminalState: 'cancelled' }), {
    status: 'reset', rideId: 'ride-2', terminalState: 'cancelled', sideEffects: false
  });
  assert.deepEqual(guard.evaluate({ rideId: 'ride-3', eventId: 'event-3', nowMs: 5 }), {
    status: 'blocked', reason: 'event_capacity_reached', sideEffects: false
  });
});
