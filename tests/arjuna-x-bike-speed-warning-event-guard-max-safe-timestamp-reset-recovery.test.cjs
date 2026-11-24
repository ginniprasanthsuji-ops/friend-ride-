'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { BikeSpeedWarningEventGuard } = require('../qa/arjuna-x-bike-speed-warning-event-guard.cjs');

test('Phase 10 guard: maximum safe event timestamp blocks stale input until terminal reset', () => {
  const guard = new BikeSpeedWarningEventGuard({ cooldownMs: 0, maxEvents: 4, maxRides: 1 });

  assert.deepEqual(guard.evaluate({ rideId: 'ride-max-time', eventId: 'at-max', nowMs: Number.MAX_SAFE_INTEGER }), {
    status: 'proposal_accepted', rideId: 'ride-max-time', eventId: 'at-max', cooldownMs: 0, sideEffects: false
  });
  assert.deepEqual(guard.evaluate({ rideId: 'ride-max-time', eventId: 'stale-low', nowMs: Number.MAX_SAFE_INTEGER - 1 }), {
    status: 'blocked', reason: 'stale_event_time', sideEffects: false
  });
  assert.deepEqual(guard.terminateRide({ rideId: 'ride-max-time', terminalState: 'completed' }), {
    status: 'reset', rideId: 'ride-max-time', terminalState: 'completed', sideEffects: false
  });
  assert.deepEqual(guard.evaluate({ rideId: 'ride-max-time', eventId: 'after-reset', nowMs: 0 }), {
    status: 'proposal_accepted', rideId: 'ride-max-time', eventId: 'after-reset', cooldownMs: 0, sideEffects: false
  });
});
