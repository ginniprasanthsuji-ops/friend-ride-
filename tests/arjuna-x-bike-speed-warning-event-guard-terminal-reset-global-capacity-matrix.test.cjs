'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { BikeSpeedWarningEventGuard } = require('../qa/arjuna-x-bike-speed-warning-event-guard.cjs');

test('Phase 10 guard: terminal resets never release global event capacity or replay history', () => {
  for (const terminalState of ['completed', 'cancelled', 'failed']) {
    const guard = new BikeSpeedWarningEventGuard({ cooldownMs: 60_000, maxEvents: 2, maxRides: 1 });
    const rideId = `ride-${terminalState}`;
    const acceptedId = `accepted-${terminalState}`;
    const suppressedId = `suppressed-${terminalState}`;

    assert.equal(guard.evaluate({ rideId, eventId: acceptedId, nowMs: 10 }).status, 'proposal_accepted');
    assert.deepEqual(guard.evaluate({ rideId, eventId: suppressedId, nowMs: 11 }), {
      status: 'suppressed', reason: 'ride_cooldown', sideEffects: false
    });
    assert.deepEqual(guard.terminateRide({ rideId, terminalState }), {
      status: 'reset', rideId, terminalState, sideEffects: false
    });
    assert.deepEqual(guard.evaluate({ rideId, eventId: suppressedId, nowMs: 1 }), {
      status: 'blocked', reason: 'duplicate_event_id', sideEffects: false
    });
    assert.deepEqual(guard.evaluate({ rideId, eventId: `fresh-${terminalState}`, nowMs: 1 }), {
      status: 'blocked', reason: 'event_capacity_reached', sideEffects: false
    });
  }
});
