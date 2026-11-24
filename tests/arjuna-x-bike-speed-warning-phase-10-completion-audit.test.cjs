'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateBikeSpeedWarning } = require('../qa/arjuna-x-bike-speed-warning.cjs');
const { BikeSpeedWarningEventGuard } = require('../qa/arjuna-x-bike-speed-warning-event-guard.cjs');

test('Phase 10 completion audit: policy proposal is guarded, blocked GPS never reaches guard, replay stays blocked', () => {
  const guard = new BikeSpeedWarningEventGuard({ cooldownMs: 60_000, maxEvents: 4, maxRides: 2 });
  const base = { rideType: 'bike', speedKmh: 61, accuracyMeters: 5, sampleAgeMs: 500, nowMs: 1000 };
  const proposal = evaluateBikeSpeedWarning(base);
  assert.equal(proposal.status, 'warning_proposal');
  assert.equal(proposal.sideEffects, false);
  const accepted = guard.evaluate({ rideId: 'ride-final', eventId: 'evt-final', nowMs: base.nowMs });
  assert.equal(accepted.status, 'proposal_accepted');
  assert.equal(accepted.sideEffects, false);

  const stale = evaluateBikeSpeedWarning({ ...base, sampleAgeMs: 10_001, nowMs: 2000 });
  assert.equal(stale.status, 'blocked');
  assert.deepEqual(stale.recipients, []);
  assert.equal(stale.sideEffects, false);
  // No guard call is made for a blocked policy result; event capacity/history remain unchanged.
  assert.equal(guard.seenEventIds.size, 1);

  assert.deepEqual(guard.evaluate({ rideId: 'ride-final', eventId: 'evt-final', nowMs: 3000 }), {
    status: 'blocked', reason: 'duplicate_event_id', sideEffects: false
  });
  assert.equal(guard.seenEventIds.size, 1);
  assert.equal(guard.lastProposalAtByRide.get('ride-final'), 1000);
});
