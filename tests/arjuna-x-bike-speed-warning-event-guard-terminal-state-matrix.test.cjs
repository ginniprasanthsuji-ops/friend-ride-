'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { BikeSpeedWarningEventGuard } = require('../qa/arjuna-x-bike-speed-warning-event-guard.cjs');

for (const terminalState of ['completed', 'cancelled', 'failed']) {
  test(`Phase 10 guard: ${terminalState} terminal state releases only that ride cooldown`, () => {
    const guard = new BikeSpeedWarningEventGuard({ cooldownMs: 60_000 });
    assert.equal(guard.evaluate({ rideId: 'ride-A', eventId: 'A-1', nowMs: 100 }).status, 'proposal_accepted');
    assert.equal(guard.evaluate({ rideId: 'ride-B', eventId: 'B-1', nowMs: 100 }).status, 'proposal_accepted');
    assert.deepEqual(guard.terminateRide({ rideId: 'ride-A', terminalState }), {
      status: 'reset', rideId: 'ride-A', terminalState, sideEffects: false,
    });
    assert.equal(guard.evaluate({ rideId: 'ride-A', eventId: 'A-2', nowMs: 101 }).status, 'proposal_accepted');
    assert.deepEqual(guard.evaluate({ rideId: 'ride-B', eventId: 'B-2', nowMs: 101 }), {
      status: 'suppressed', reason: 'ride_cooldown', sideEffects: false,
    });
  });
}

test('Phase 10 guard: terminal reset of untracked ride is a no-op', () => {
  const guard = new BikeSpeedWarningEventGuard({ cooldownMs: 60_000 });
  assert.deepEqual(guard.terminateRide({ rideId: 'unknown-ride', terminalState: 'completed' }), {
    status: 'ignored', reason: 'ride_not_tracked', sideEffects: false,
  });
});
