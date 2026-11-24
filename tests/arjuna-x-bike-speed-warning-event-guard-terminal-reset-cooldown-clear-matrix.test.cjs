'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { BikeSpeedWarningEventGuard } = require('../qa/arjuna-x-bike-speed-warning-event-guard.cjs');

test('Phase 10 guard: terminal reset clears cooldown for same ride without clearing global replay protection', () => {
  for (const terminalState of ['completed', 'cancelled', 'failed']) {
    const guard = new BikeSpeedWarningEventGuard({ maxEvents: 3, maxRides: 1, cooldownMs: 60_000 });
    assert.equal(guard.evaluate({ rideId: 'ride-1', eventId: 'first-event', nowMs: 1_000 }).status, 'proposal_accepted');
    assert.deepEqual(guard.terminateRide({ rideId: 'ride-1', terminalState }), {
      status: 'reset', rideId: 'ride-1', terminalState, sideEffects: false,
    });
    assert.deepEqual(guard.evaluate({ rideId: 'ride-1', eventId: 'second-event', nowMs: 1_001 }), {
      status: 'proposal_accepted', rideId: 'ride-1', eventId: 'second-event', cooldownMs: 60_000, sideEffects: false,
    });
    assert.deepEqual(guard.evaluate({ rideId: 'ride-1', eventId: 'first-event', nowMs: 1_002 }), {
      status: 'blocked', reason: 'duplicate_event_id', sideEffects: false,
    });
  }
});
