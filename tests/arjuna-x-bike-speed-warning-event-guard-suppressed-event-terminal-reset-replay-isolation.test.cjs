'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { BikeSpeedWarningEventGuard } = require('../qa/arjuna-x-bike-speed-warning-event-guard.cjs');

test('Phase 10 guard: terminal reset releases ride cooldown but suppressed event replay remains blocked globally', () => {
  const guard = new BikeSpeedWarningEventGuard({ cooldownMs: 60_000, maxEvents: 4, maxRides: 2 });

  assert.equal(guard.evaluate({ rideId: 'ride-a', eventId: 'accepted-a', nowMs: 100 }).status, 'proposal_accepted');
  assert.deepEqual(guard.evaluate({ rideId: 'ride-a', eventId: 'suppressed-a', nowMs: 101 }), {
    status: 'suppressed', reason: 'ride_cooldown', sideEffects: false
  });

  assert.deepEqual(guard.terminateRide({ rideId: 'ride-a', terminalState: 'failed' }), {
    status: 'reset', rideId: 'ride-a', terminalState: 'failed', sideEffects: false
  });
  assert.deepEqual(guard.evaluate({ rideId: 'ride-a', eventId: 'suppressed-a', nowMs: 1 }), {
    status: 'blocked', reason: 'duplicate_event_id', sideEffects: false
  });
  assert.deepEqual(guard.evaluate({ rideId: 'ride-a', eventId: 'fresh-after-reset', nowMs: 1 }), {
    status: 'proposal_accepted', rideId: 'ride-a', eventId: 'fresh-after-reset', cooldownMs: 60_000, sideEffects: false
  });
  assert.deepEqual(guard.evaluate({ rideId: 'ride-b', eventId: 'ride-b-fresh', nowMs: 2 }), {
    status: 'proposal_accepted', rideId: 'ride-b', eventId: 'ride-b-fresh', cooldownMs: 60_000, sideEffects: false
  });
});
