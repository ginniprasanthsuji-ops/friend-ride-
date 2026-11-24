'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { BikeSpeedWarningEventGuard } = require('../qa/arjuna-x-bike-speed-warning-event-guard.cjs');

test('Phase 10 guard: repeated terminal reset is idempotent and does not affect another ride', () => {
  const guard = new BikeSpeedWarningEventGuard({ cooldownMs: 60_000, maxRides: 2 });
  assert.equal(guard.evaluate({ rideId: 'ride-1', eventId: 'event-1', nowMs: 100 }).status, 'proposal_accepted');
  assert.equal(guard.evaluate({ rideId: 'ride-2', eventId: 'event-2', nowMs: 100 }).status, 'proposal_accepted');

  assert.deepEqual(guard.terminateRide({ rideId: 'ride-1', terminalState: 'completed' }), {
    status: 'reset', rideId: 'ride-1', terminalState: 'completed', sideEffects: false,
  });
  assert.deepEqual(guard.terminateRide({ rideId: 'ride-1', terminalState: 'completed' }), {
    status: 'ignored', reason: 'ride_not_tracked', sideEffects: false,
  });

  assert.deepEqual(guard.evaluate({ rideId: 'ride-1', eventId: 'event-3', nowMs: 101 }), {
    status: 'proposal_accepted', rideId: 'ride-1', eventId: 'event-3', cooldownMs: 60_000, sideEffects: false,
  });
  assert.deepEqual(guard.evaluate({ rideId: 'ride-2', eventId: 'event-4', nowMs: 101 }), {
    status: 'suppressed', reason: 'ride_cooldown', sideEffects: false,
  });
});
