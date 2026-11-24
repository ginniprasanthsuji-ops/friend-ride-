'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { BikeSpeedWarningEventGuard } = require('../qa/arjuna-x-bike-speed-warning-event-guard.cjs');

test('Phase 10 guard: event IDs are global across rides while cooldown clocks remain ride-isolated', () => {
  const guard = new BikeSpeedWarningEventGuard({ cooldownMs: 60_000 });

  assert.deepEqual(
    guard.evaluate({ rideId: 'ride-A', eventId: 'shared-event', nowMs: 10_000 }),
    { status: 'proposal_accepted', rideId: 'ride-A', eventId: 'shared-event', cooldownMs: 60_000, sideEffects: false }
  );

  // A globally reused event ID is blocked even when presented for a different ride.
  assert.deepEqual(
    guard.evaluate({ rideId: 'ride-B', eventId: 'shared-event', nowMs: 10_000 }),
    { status: 'blocked', reason: 'duplicate_event_id', sideEffects: false }
  );

  // The duplicate attempt does not poison ride-B's cooldown state or its fresh ID.
  assert.deepEqual(
    guard.evaluate({ rideId: 'ride-B', eventId: 'ride-B-fresh', nowMs: 10_000 }),
    { status: 'proposal_accepted', rideId: 'ride-B', eventId: 'ride-B-fresh', cooldownMs: 60_000, sideEffects: false }
  );

  // Ride A's cooldown remains independent of ride B's accepted proposal.
  assert.deepEqual(
    guard.evaluate({ rideId: 'ride-A', eventId: 'ride-A-next', nowMs: 10_001 }),
    { status: 'suppressed', reason: 'ride_cooldown', sideEffects: false }
  );
});
