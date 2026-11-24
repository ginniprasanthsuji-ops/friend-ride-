'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { BikeSpeedWarningEventGuard } = require('../qa/arjuna-x-bike-speed-warning-event-guard.cjs');

test('Phase 10 guard: whitespace variants cannot bypass canonical ride/event deduplication', () => {
  const guard = new BikeSpeedWarningEventGuard({ cooldownMs: 60_000 });
  assert.deepEqual(guard.evaluate({ rideId: ' ride-A ', eventId: ' event-1 ', nowMs: 5_000 }), {
    status: 'proposal_accepted', rideId: 'ride-A', eventId: 'event-1', cooldownMs: 60_000, sideEffects: false
  });
  assert.deepEqual(guard.evaluate({ rideId: 'ride-A', eventId: 'event-1', nowMs: 5_001 }), {
    status: 'blocked', reason: 'duplicate_event_id', sideEffects: false
  });
  assert.deepEqual(guard.evaluate({ rideId: 'ride-A', eventId: 'event-2', nowMs: 5_001 }), {
    status: 'suppressed', reason: 'ride_cooldown', sideEffects: false
  });
  assert.deepEqual(guard.evaluate({ rideId: 'ride-B', eventId: 'event-3', nowMs: 5_001 }), {
    status: 'proposal_accepted', rideId: 'ride-B', eventId: 'event-3', cooldownMs: 60_000, sideEffects: false
  });
});
