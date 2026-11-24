'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { BikeSpeedWarningEventGuard } = require('../qa/arjuna-x-bike-speed-warning-event-guard.cjs');

test('Phase 10 guard: max timestamp reset recovery is isolated across rides and preserves replay history', () => {
  const guard = new BikeSpeedWarningEventGuard({ cooldownMs: 0, maxEvents: 5, maxRides: 2 });

  assert.equal(guard.evaluate({ rideId: 'ride-a', eventId: 'a-max', nowMs: Number.MAX_SAFE_INTEGER }).status, 'proposal_accepted');
  assert.equal(guard.evaluate({ rideId: 'ride-b', eventId: 'b-10', nowMs: 10 }).status, 'proposal_accepted');

  assert.deepEqual(guard.terminateRide({ rideId: 'ride-a', terminalState: 'cancelled' }), {
    status: 'reset', rideId: 'ride-a', terminalState: 'cancelled', sideEffects: false
  });
  assert.equal(guard.evaluate({ rideId: 'ride-a', eventId: 'a-after-reset', nowMs: 0 }).status, 'proposal_accepted');

  assert.deepEqual(guard.evaluate({ rideId: 'ride-b', eventId: 'b-stale', nowMs: 9 }), {
    status: 'blocked', reason: 'stale_event_time', sideEffects: false
  });
  assert.deepEqual(guard.evaluate({ rideId: 'ride-b', eventId: 'a-max', nowMs: 11 }), {
    status: 'blocked', reason: 'duplicate_event', sideEffects: false
  });
});
