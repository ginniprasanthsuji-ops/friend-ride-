'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { BikeSpeedWarningEventGuard } = require('../qa/arjuna-x-bike-speed-warning-event-guard.cjs');

test('Phase 10 final guard audit: terminal reset clears cooldown only, rejects invalid terminal and preserves dedupe', () => {
  const guard = new BikeSpeedWarningEventGuard({ cooldownMs: 60_000, maxEvents: 5, maxRides: 1 });
  assert.equal(guard.evaluate({ rideId: 'ride-X', eventId: 'event-X', nowMs: 100 }).status, 'proposal_accepted');
  assert.deepEqual(guard.evaluate({ rideId: 'ride-X', eventId: 'event-Y', nowMs: 200 }), {
    status: 'suppressed', reason: 'ride_cooldown', sideEffects: false
  });

  assert.deepEqual(guard.terminateRide({ rideId: 'ride-X', terminalState: 'unknown' }), {
    status: 'blocked', reason: 'invalid_terminal_context', sideEffects: false
  });
  assert.equal(guard.evaluate({ rideId: 'ride-X', eventId: 'event-Z', nowMs: 300 }).status, 'suppressed');

  assert.deepEqual(guard.terminateRide({ rideId: ' ride-X ', terminalState: 'cancelled' }), {
    status: 'reset', rideId: 'ride-X', terminalState: 'cancelled', sideEffects: false
  });
  assert.equal(guard.evaluate({ rideId: 'ride-X', eventId: 'event-W', nowMs: 301 }).status, 'proposal_accepted');
  assert.deepEqual(guard.evaluate({ rideId: 'ride-X', eventId: 'event-X', nowMs: 302 }), {
    status: 'blocked', reason: 'duplicate_event_id', sideEffects: false
  });
  assert.deepEqual(guard.evaluate({ rideId: 'ride-X', eventId: 'event-Z', nowMs: 303 }), {
    status: 'blocked', reason: 'duplicate_event_id', sideEffects: false
  });
  assert.equal(guard.seenEventIds.has('event-X'), true);
  assert.equal(guard.lastProposalAtByRide.has('ride-X'), true);
});
