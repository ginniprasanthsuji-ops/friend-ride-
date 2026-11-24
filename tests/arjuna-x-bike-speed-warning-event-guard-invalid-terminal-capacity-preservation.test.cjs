'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { BikeSpeedWarningEventGuard } = require('../qa/arjuna-x-bike-speed-warning-event-guard.cjs');

test('Phase 10 guard: invalid terminal reset preserves cooldown, ride capacity, and event capacity', () => {
  for (const invalidTerminalState of ['', 'unknown', 'in-progress', null, undefined]) {
    const guard = new BikeSpeedWarningEventGuard({ maxEvents: 2, maxRides: 1, cooldownMs: 60_000 });
    assert.equal(guard.evaluate({ rideId: 'ride-1', eventId: 'event-1', nowMs: 100 }).status, 'proposal_accepted');
    assert.deepEqual(guard.terminateRide({ rideId: 'ride-1', terminalState: invalidTerminalState }), {
      status: 'blocked', reason: 'invalid_terminal_context', sideEffects: false,
    });
    assert.deepEqual(guard.evaluate({ rideId: 'ride-1', eventId: 'event-2', nowMs: 101 }), {
      status: 'suppressed', reason: 'ride_cooldown', sideEffects: false,
    });
    assert.deepEqual(guard.evaluate({ rideId: 'ride-2', eventId: 'event-3', nowMs: 102 }), {
      status: 'blocked', reason: 'event_capacity_reached', sideEffects: false,
    });
    assert.deepEqual(guard.evaluate({ rideId: 'ride-2', eventId: 'event-1', nowMs: 102 }), {
      status: 'blocked', reason: 'duplicate_event_id', sideEffects: false,
    });
  }
});
