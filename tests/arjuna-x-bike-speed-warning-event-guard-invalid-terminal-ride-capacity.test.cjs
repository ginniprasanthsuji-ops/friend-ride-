'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { BikeSpeedWarningEventGuard } = require('../qa/arjuna-x-bike-speed-warning-event-guard.cjs');

test('Phase 10 guard: invalid terminal reset cannot release ride capacity', () => {
  const guard = new BikeSpeedWarningEventGuard({ maxEvents: 5, maxRides: 1, cooldownMs: 0 });
  assert.equal(guard.evaluate({ rideId: 'ride-1', eventId: 'event-1', nowMs: 1 }).status, 'proposal_accepted');

  for (const invalidRideId of ['', '   ', null, undefined]) {
    assert.deepEqual(guard.terminateRide({ rideId: invalidRideId, terminalState: 'completed' }), {
      status: 'blocked', reason: 'invalid_terminal_context', sideEffects: false,
    });
  }
  assert.deepEqual(guard.terminateRide({ rideId: 'ride-1', terminalState: 'not-terminal' }), {
    status: 'blocked', reason: 'invalid_terminal_context', sideEffects: false,
  });

  assert.deepEqual(guard.evaluate({ rideId: 'ride-2', eventId: 'event-2', nowMs: 2 }), {
    status: 'blocked', reason: 'ride_capacity_reached', sideEffects: false,
  });
  assert.deepEqual(guard.evaluate({ rideId: 'ride-1', eventId: 'event-1', nowMs: 3 }), {
    status: 'blocked', reason: 'duplicate_event_id', sideEffects: false,
  });
});
