'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { BikeSpeedWarningEventGuard } = require('../qa/arjuna-x-bike-speed-warning-event-guard.cjs');

test('Phase 10 guard: cooldown suppresses before boundary and accepts exactly at boundary', () => {
  const guard = new BikeSpeedWarningEventGuard({ cooldownMs: 60_000 });
  assert.equal(guard.evaluate({ rideId: 'ride-1', eventId: 'event-1', nowMs: 100_000 }).status, 'proposal_accepted');
  assert.deepEqual(guard.evaluate({ rideId: 'ride-1', eventId: 'event-2', nowMs: 159_999 }), {
    status: 'suppressed', reason: 'ride_cooldown', sideEffects: false,
  });
  assert.deepEqual(guard.evaluate({ rideId: 'ride-1', eventId: 'event-3', nowMs: 160_000 }), {
    status: 'proposal_accepted', rideId: 'ride-1', eventId: 'event-3', cooldownMs: 60_000, sideEffects: false,
  });
});

test('Phase 10 guard: invalid timestamp does not reserve event ID or alter cooldown', () => {
  const guard = new BikeSpeedWarningEventGuard({ cooldownMs: 60_000 });
  assert.deepEqual(guard.evaluate({ rideId: 'ride-1', eventId: 'retryable-event', nowMs: -1 }), {
    status: 'blocked', reason: 'invalid_event_context', sideEffects: false,
  });
  assert.deepEqual(guard.evaluate({ rideId: 'ride-1', eventId: 'retryable-event', nowMs: 10 }), {
    status: 'proposal_accepted', rideId: 'ride-1', eventId: 'retryable-event', cooldownMs: 60_000, sideEffects: false,
  });
});
