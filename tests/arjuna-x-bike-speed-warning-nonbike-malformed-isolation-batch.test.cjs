'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateBikeSpeedWarning } = require('../qa/arjuna-x-bike-speed-warning.cjs');

test('Phase 10 isolation batch: every non-bike ride type ignores even malformed speed/GPS data', () => {
  const rideTypes = ['auto', 'car', 'delivery', 'walk', 'unknown', '', null, undefined];
  for (const rideType of rideTypes) {
    const result = evaluateBikeSpeedWarning({
      rideType, speedKmh: NaN, accuracyMeters: Infinity, sampleAgeMs: -999, nowMs: -1
    });
    assert.equal(result.status, 'ignored', `ride type ${String(rideType)}`);
    assert.equal(result.reason, 'ride_type_not_bike');
    assert.deepEqual(result.recipients, []);
    assert.equal(result.sideEffects, false);
  }
});
