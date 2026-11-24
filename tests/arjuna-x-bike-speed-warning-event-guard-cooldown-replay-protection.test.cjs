'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { BikeSpeedWarningEventGuard } = require('../qa/arjuna-x-bike-speed-warning-event-guard.cjs');

test('Phase 10 guard: cooldown-suppressed event ID cannot replay after cooldown; fresh ID is allowed', () => {
  const guard = new BikeSpeedWarningEventGuard({ cooldownMs: 60_000 });
  assert.equal(guard.evaluate({ rideId: 'ride-1', eventId: 'initial', nowMs: 10_000 }).status, 'proposal_accepted');
  assert.deepEqual(guard.evaluate({ rideId: 'ride-1', eventId: 'suppressed-event', nowMs: 10_001 }), { status: 'suppressed', reason: 'ride_cooldown', sideEffects: false });
  assert.deepEqual(guard.evaluate({ rideId: 'ride-1', eventId: 'suppressed-event', nowMs: 70_000 }), { status: 'blocked', reason: 'duplicate_event_id', sideEffects: false });
  assert.deepEqual(guard.evaluate({ rideId: 'ride-1', eventId: 'fresh-event', nowMs: 70_000 }), { status: 'proposal_accepted', rideId: 'ride-1', eventId: 'fresh-event', cooldownMs: 60_000, sideEffects: false });
});
