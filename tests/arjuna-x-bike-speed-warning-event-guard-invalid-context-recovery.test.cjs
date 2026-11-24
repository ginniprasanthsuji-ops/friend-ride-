'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { BikeSpeedWarningEventGuard } = require('../qa/arjuna-x-bike-speed-warning-event-guard.cjs');

test('Phase 10 guard: invalid context rejection does not consume event or ride capacity', () => {
  const guard = new BikeSpeedWarningEventGuard({ maxEvents: 1, maxRides: 1, cooldownMs: 0 });

  const invalidCases = [
    { rideId: '', eventId: 'recoverable-event', nowMs: 1 },
    { rideId: 'ride-1', eventId: '   ', nowMs: 1 },
    { rideId: 'ride-1', eventId: 'recoverable-event', nowMs: -1 },
    { rideId: 'ride-1', eventId: 'recoverable-event', nowMs: Number.NaN },
    { rideId: 'ride-1', eventId: 'recoverable-event', nowMs: 1.5 },
  ];

  for (const context of invalidCases) {
    assert.deepEqual(guard.evaluate(context), {
      status: 'blocked', reason: 'invalid_event_context', sideEffects: false,
    });
  }

  // After all malformed attempts, the same valid event ID and ride still have capacity.
  assert.deepEqual(guard.evaluate({ rideId: 'ride-1', eventId: 'recoverable-event', nowMs: 1 }), {
    status: 'proposal_accepted', rideId: 'ride-1', eventId: 'recoverable-event', cooldownMs: 0, sideEffects: false,
  });

  // Capacity is now genuinely consumed, so another ride/event is fail-closed.
  assert.deepEqual(guard.evaluate({ rideId: 'ride-2', eventId: 'second-event', nowMs: 2 }), {
    status: 'blocked', reason: 'event_capacity_reached', sideEffects: false,
  });
});
