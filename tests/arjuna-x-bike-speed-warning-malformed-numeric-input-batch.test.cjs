'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateBikeSpeedWarning } = require('../qa/arjuna-x-bike-speed-warning.cjs');

test('Phase 10 malformed numeric GPS and time inputs fail closed in a deterministic batch', () => {
  const invalidValues = [NaN, Infinity, -Infinity, null, '51', undefined];
  for (const speedKmh of invalidValues) {
    const result = evaluateBikeSpeedWarning({
      rideType: 'bike', speedKmh, accuracyMeters: 5, sampleAgeMs: 100, nowMs: 1000
    });
    assert.equal(result.status, 'blocked', `speed invalid value: ${String(speedKmh)}`);
    assert.equal(result.reason, 'invalid_gps_sample');
    assert.deepEqual(result.recipients, []);
    assert.equal(result.sideEffects, false);
  }

  for (const accuracyMeters of [NaN, Infinity, -Infinity, null, '5', undefined, -1]) {
    const result = evaluateBikeSpeedWarning({
      rideType: 'bike', speedKmh: 51, accuracyMeters, sampleAgeMs: 100, nowMs: 1000
    });
    assert.equal(result.status, 'blocked', `accuracy invalid value: ${String(accuracyMeters)}`);
    assert.equal(result.reason, 'invalid_gps_sample');
    assert.deepEqual(result.recipients, []);
    assert.equal(result.sideEffects, false);
  }

  for (const sampleAgeMs of [NaN, Infinity, -Infinity, null, '100', undefined]) {
    const result = evaluateBikeSpeedWarning({
      rideType: 'bike', speedKmh: 51, accuracyMeters: 5, sampleAgeMs, nowMs: 1000
    });
    assert.equal(result.status, 'blocked', `sample age invalid value: ${String(sampleAgeMs)}`);
    assert.equal(result.reason, 'invalid_gps_sample');
    assert.deepEqual(result.recipients, []);
    assert.equal(result.sideEffects, false);
  }

  for (const nowMs of [NaN, Infinity, -Infinity, null, '1000', undefined, -1]) {
    const result = evaluateBikeSpeedWarning({
      rideType: 'bike', speedKmh: 51, accuracyMeters: 5, sampleAgeMs: 100, nowMs
    });
    assert.equal(result.status, 'blocked', `now invalid value: ${String(nowMs)}`);
    assert.equal(result.reason, 'invalid_gps_sample');
    assert.deepEqual(result.recipients, []);
    assert.equal(result.sideEffects, false);
  }

  for (const lastWarningAtMs of [NaN, Infinity, -Infinity, null, '1000', -1]) {
    const result = evaluateBikeSpeedWarning({
      rideType: 'bike', speedKmh: 51, accuracyMeters: 5, sampleAgeMs: 100,
      nowMs: 2000, lastWarningAtMs
    });
    assert.equal(result.status, 'blocked', `last warning invalid value: ${String(lastWarningAtMs)}`);
    assert.equal(result.reason, 'invalid_gps_sample');
    assert.deepEqual(result.recipients, []);
    assert.equal(result.sideEffects, false);
  }
});
