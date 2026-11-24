'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { BikeSpeedWarningEventGuard } = require('../qa/arjuna-x-bike-speed-warning-event-guard.cjs');

test('Phase 10 guard: suppressed event replay stays blocked after every terminal state reset', () => {
  for (const terminalState of ['completed', 'cancelled', 'failed']) {
    const guard = new BikeSpeedWarningEventGuard({ cooldownMs: 60_000, maxEvents: 3, maxRides: 1 });
    const rideId = `ride-${terminalState}`;
    const replayId = `suppressed-${terminalState}`;

    assert.equal(guard.evaluate({ rideId, eventId: `accepted-${terminalState}`, nowMs: 5 }).status, 'proposal_accepted');
    assert.deepEqual(guard.evaluate({ rideId, eventId: replayId, nowMs: 6 }), {
      status: 'suppressed', reason: 'ride_cooldown', sideEffects: false
    });
    assert.deepEqual(guard.terminateRide({ rideId, terminalState }), {
      status: 'reset', rideId, terminalState, sideEffects: false
    });
    assert.deepEqual(guard.evaluate({ rideId, eventId: replayId, nowMs: 1 }), {
      status: 'blocked', reason: 'duplicate_event_id', sideEffects: false
    });
    assert.deepEqual(guard.evaluate({ rideId, eventId: `fresh-${terminalState}`, nowMs: 1 }), {
      status: 'proposal_accepted', rideId, eventId: `fresh-${terminalState}`, cooldownMs: 60_000, sideEffects: false
    });
  }
});
