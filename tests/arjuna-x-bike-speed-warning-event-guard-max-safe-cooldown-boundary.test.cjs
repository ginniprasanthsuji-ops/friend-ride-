'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { BikeSpeedWarningEventGuard } = require('../qa/arjuna-x-bike-speed-warning-event-guard.cjs');

test('Phase 10 guard: maximum safe cooldown is handled at exact boundary', () => {
  const cooldownMs = Number.MAX_SAFE_INTEGER;
  const guard = new BikeSpeedWarningEventGuard({ cooldownMs, maxEvents: 3, maxRides: 1 });

  assert.equal(guard.evaluate({ rideId: 'ride-boundary', eventId: 'start', nowMs: 0 }).status, 'proposal_accepted');
  assert.deepEqual(guard.evaluate({ rideId: 'ride-boundary', eventId: 'before', nowMs: cooldownMs - 1 }), {
    status: 'suppressed', reason: 'ride_cooldown', sideEffects: false
  });
  assert.deepEqual(guard.evaluate({ rideId: 'ride-boundary', eventId: 'exact', nowMs: cooldownMs }), {
    status: 'proposal_accepted', rideId: 'ride-boundary', eventId: 'exact', cooldownMs, sideEffects: false
  });
});
