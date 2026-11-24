'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { BikeSpeedWarningEventGuard } = require('../qa/arjuna-x-bike-speed-warning-event-guard.cjs');

test('Phase 10 guard: stale timestamp rejection does not reserve event ID; valid retry can recover', () => {
  const guard = new BikeSpeedWarningEventGuard({ cooldownMs: 60_000 });
  assert.equal(guard.evaluate({ rideId: 'ride-1', eventId: 'base-event', nowMs: 100_000 }).status, 'proposal_accepted');

  assert.deepEqual(guard.evaluate({ rideId: 'ride-1', eventId: 'retryable-stale', nowMs: 99_999 }), {
    status: 'blocked', reason: 'stale_event_time', sideEffects: false,
  });

  assert.deepEqual(guard.evaluate({ rideId: 'ride-1', eventId: 'retryable-stale', nowMs: 160_000 }), {
    status: 'proposal_accepted', rideId: 'ride-1', eventId: 'retryable-stale', cooldownMs: 60_000, sideEffects: false,
  });
});
