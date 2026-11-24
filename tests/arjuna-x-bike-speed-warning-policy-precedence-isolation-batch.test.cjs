'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateBikeSpeedWarning } = require('../qa/arjuna-x-bike-speed-warning.cjs');

test('Phase 10 batch: policy precedence and non-bike isolation matrix', () => {
  const gpsBlockedBeforeSpeedDecision = evaluateBikeSpeedWarning({
    rideType: 'bike', speedKmh: 49, accuracyMeters: 21, sampleAgeMs: 0, nowMs: 5000
  });
  assert.equal(gpsBlockedBeforeSpeedDecision.status, 'blocked');
  assert.equal(gpsBlockedBeforeSpeedDecision.reason, 'gps_sample_unreliable');
  assert.deepEqual(gpsBlockedBeforeSpeedDecision.recipients, []);
  assert.equal(gpsBlockedBeforeSpeedDecision.sideEffects, false);

  const belowLimitIgnoresCooldown = evaluateBikeSpeedWarning({
    rideType: 'bike', speedKmh: 50, accuracyMeters: 5, sampleAgeMs: 0, nowMs: 50_000, lastWarningAtMs: 1_000
  });
  assert.equal(belowLimitIgnoresCooldown.status, 'within_limit');
  assert.equal(belowLimitIgnoresCooldown.sideEffects, false);

  for (const rideType of ['auto', 'car', 'delivery', 'unknown', null, undefined]) {
    const excluded = evaluateBikeSpeedWarning({
      rideType, speedKmh: 120, accuracyMeters: -1, sampleAgeMs: -99, nowMs: -1, lastWarningAtMs: Infinity
    });
    assert.equal(excluded.status, 'ignored');
    assert.equal(excluded.reason, 'ride_type_not_bike');
    assert.deepEqual(excluded.recipients, []);
    assert.equal(excluded.sideEffects, false);
  }
});
