'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateBikeSpeedWarning, WARNING_COOLDOWN_MS, MAX_GPS_ACCURACY_METERS, MAX_SAMPLE_AGE_MS } = require('../qa/arjuna-x-bike-speed-warning.cjs');

test('Phase 10 batch: GPS quality and cooldown edges fail closed or accept deterministically', () => {
  const acceptedEdges = [
    { accuracyMeters: 0, sampleAgeMs: 0 },
    { accuracyMeters: MAX_GPS_ACCURACY_METERS, sampleAgeMs: MAX_SAMPLE_AGE_MS }
  ];
  for (const edge of acceptedEdges) {
    const result = evaluateBikeSpeedWarning({ rideType: 'bike', speedKmh: 51, nowMs: 1000, ...edge });
    assert.equal(result.status, 'warning_proposal');
    assert.equal(result.sideEffects, false);
  }

  const rejectedEdges = [
    { accuracyMeters: MAX_GPS_ACCURACY_METERS + Number.EPSILON * 100, sampleAgeMs: 0 },
    { accuracyMeters: 5, sampleAgeMs: MAX_SAMPLE_AGE_MS + 1 },
    { accuracyMeters: 5, sampleAgeMs: -1 }
  ];
  for (const edge of rejectedEdges) {
    const result = evaluateBikeSpeedWarning({ rideType: 'bike', speedKmh: 51, nowMs: 1000, ...edge });
    assert.equal(result.status, 'blocked');
    assert.equal(result.reason, 'gps_sample_unreliable');
    assert.deepEqual(result.recipients, []);
    assert.equal(result.sideEffects, false);
  }

  const cooldownBefore = evaluateBikeSpeedWarning({
    rideType: 'bike', speedKmh: 51, accuracyMeters: 5, nowMs: 60_999, lastWarningAtMs: 1000
  });
  const cooldownExact = evaluateBikeSpeedWarning({
    rideType: 'bike', speedKmh: 51, accuracyMeters: 5, nowMs: 61_000, lastWarningAtMs: 1000
  });
  assert.equal(cooldownBefore.status, 'warning_suppressed');
  assert.equal(cooldownBefore.sideEffects, false);
  assert.equal(cooldownExact.status, 'warning_proposal');
  assert.equal(cooldownExact.cooldownMs, WARNING_COOLDOWN_MS);
  assert.equal(cooldownExact.sideEffects, false);
});
