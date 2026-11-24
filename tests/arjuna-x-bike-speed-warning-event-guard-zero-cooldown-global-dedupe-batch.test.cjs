'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { BikeSpeedWarningEventGuard } = require('../qa/arjuna-x-bike-speed-warning-event-guard.cjs');

test('Phase 10 batch: zero cooldown permits distinct events while global event IDs remain deduplicated', () => {
  const guard = new BikeSpeedWarningEventGuard({ cooldownMs: 0, maxEvents: 3, maxRides: 2 });
  const first = guard.evaluate({ rideId: 'ride-a', eventId: 'evt-a', nowMs: 10 });
  const second = guard.evaluate({ rideId: 'ride-a', eventId: 'evt-b', nowMs: 10 });
  assert.equal(first.status, 'proposal_accepted');
  assert.equal(second.status, 'proposal_accepted');
  assert.equal(second.cooldownMs, 0);
  assert.equal(second.sideEffects, false);

  const crossRideDuplicate = guard.evaluate({ rideId: 'ride-b', eventId: 'evt-a', nowMs: 11 });
  assert.deepEqual(crossRideDuplicate, { status: 'blocked', reason: 'duplicate_event_id', sideEffects: false });

  const third = guard.evaluate({ rideId: 'ride-b', eventId: 'evt-c', nowMs: 11 });
  assert.equal(third.status, 'proposal_accepted');
  assert.equal(third.sideEffects, false);

  const capacity = guard.evaluate({ rideId: 'ride-b', eventId: 'evt-d', nowMs: 12 });
  assert.deepEqual(capacity, { status: 'blocked', reason: 'event_capacity_reached', sideEffects: false });
});
