'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { BikeSpeedWarningEventGuard } = require('../qa/arjuna-x-bike-speed-warning-event-guard.cjs');

test('Phase 10 guard: stale retry recovery and capacity remain safe across terminal reset matrix', () => {
  for (const terminalState of ['completed', 'cancelled', 'failed']) {
    const guard = new BikeSpeedWarningEventGuard({ maxEvents: 2, maxRides: 1, cooldownMs: 60_000 });
    assert.equal(guard.evaluate({ rideId: 'ride-1', eventId: 'initial-event', nowMs: 100 }).status, 'proposal_accepted');
    assert.deepEqual(guard.evaluate({ rideId: 'ride-1', eventId: 'retry-event', nowMs: 99 }), {
      status: 'blocked', reason: 'stale_event_time', sideEffects: false,
    });
    assert.deepEqual(guard.terminateRide({ rideId: 'ride-1', terminalState }), {
      status: 'reset', rideId: 'ride-1', terminalState, sideEffects: false,
    });
    assert.deepEqual(guard.evaluate({ rideId: 'ride-2', eventId: 'retry-event', nowMs: 101 }), {
      status: 'proposal_accepted', rideId: 'ride-2', eventId: 'retry-event', cooldownMs: 60_000, sideEffects: false,
    });
    assert.deepEqual(guard.evaluate({ rideId: 'ride-3', eventId: 'third-event', nowMs: 102 }), {
      status: 'blocked', reason: 'event_capacity_reached', sideEffects: false,
    });
    assert.deepEqual(guard.evaluate({ rideId: 'ride-1', eventId: 'initial-event', nowMs: 103 }), {
      status: 'blocked', reason: 'duplicate_event_id', sideEffects: false,
    });
  }
});
