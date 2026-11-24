'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { BikeSpeedWarningEventGuard } = require('../qa/arjuna-x-bike-speed-warning-event-guard.cjs');

test('Phase 10 guard: unsafe cooldown and capacity integers are rejected', () => {
  assert.throws(() => new BikeSpeedWarningEventGuard({ cooldownMs: Number.MAX_SAFE_INTEGER + 1 }), {
    name: 'TypeError', message: 'invalid_cooldown'
  });
  assert.throws(() => new BikeSpeedWarningEventGuard({ cooldownMs: -1 }), {
    name: 'TypeError', message: 'invalid_cooldown'
  });
  assert.throws(() => new BikeSpeedWarningEventGuard({ maxEvents: Number.MAX_SAFE_INTEGER + 1 }), {
    name: 'TypeError', message: 'invalid_max_events'
  });
  assert.throws(() => new BikeSpeedWarningEventGuard({ maxRides: Number.MAX_SAFE_INTEGER + 1 }), {
    name: 'TypeError', message: 'invalid_max_rides'
  });
});

test('Phase 10 guard: valid zero cooldown and minimum positive capacities are accepted', () => {
  const guard = new BikeSpeedWarningEventGuard({ cooldownMs: 0, maxEvents: 1, maxRides: 1 });
  assert.deepEqual(guard.evaluate({ rideId: 'ride-1', eventId: 'event-1', nowMs: 0 }), {
    status: 'proposal_accepted', rideId: 'ride-1', eventId: 'event-1', cooldownMs: 0, sideEffects: false
  });
  assert.deepEqual(guard.evaluate({ rideId: 'ride-1', eventId: 'event-2', nowMs: 0 }), {
    status: 'blocked', reason: 'event_capacity_reached', sideEffects: false
  });
});
