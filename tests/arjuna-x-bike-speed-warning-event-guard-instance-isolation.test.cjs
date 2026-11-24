'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { BikeSpeedWarningEventGuard, DEFAULT_COOLDOWN_MS, DEFAULT_MAX_EVENTS, DEFAULT_MAX_RIDES } = require('../qa/arjuna-x-bike-speed-warning-event-guard.cjs');

test('Phase 10 guard: instances do not share event replay or ride cooldown state', () => {
  const first = new BikeSpeedWarningEventGuard();
  const second = new BikeSpeedWarningEventGuard();

  assert.equal(first.evaluate({ rideId: 'ride-1', eventId: 'shared-event', nowMs: 100 }).status, 'proposal_accepted');
  assert.equal(second.evaluate({ rideId: 'ride-1', eventId: 'shared-event', nowMs: 100 }).status, 'proposal_accepted');
  assert.deepEqual(first.evaluate({ rideId: 'ride-1', eventId: 'second-event', nowMs: 101 }), {
    status: 'suppressed', reason: 'ride_cooldown', sideEffects: false
  });
  assert.deepEqual(second.evaluate({ rideId: 'ride-1', eventId: 'second-event', nowMs: 101 }), {
    status: 'suppressed', reason: 'ride_cooldown', sideEffects: false
  });
});

test('Phase 10 guard: documented defaults are stable and apply per instance', () => {
  const guard = new BikeSpeedWarningEventGuard();
  assert.equal(guard.cooldownMs, DEFAULT_COOLDOWN_MS);
  assert.equal(guard.maxEvents, DEFAULT_MAX_EVENTS);
  assert.equal(guard.maxRides, DEFAULT_MAX_RIDES);
  assert.equal(DEFAULT_COOLDOWN_MS, 60_000);
  assert.equal(DEFAULT_MAX_EVENTS, 10_000);
  assert.equal(DEFAULT_MAX_RIDES, 1_000);
});
