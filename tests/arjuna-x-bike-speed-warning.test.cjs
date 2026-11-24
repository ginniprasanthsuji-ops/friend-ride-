'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateBikeSpeedWarning, SPEED_LIMIT_KMH, WARNING_COOLDOWN_MS } = require('../qa/arjuna-x-bike-speed-warning.cjs');

test('Bike speed policy: 50 km/h is within the limit', () => {
  const result = evaluateBikeSpeedWarning({ rideType: 'bike', speedKmh: 50, accuracyMeters: 5, nowMs: 1000 });
  assert.equal(result.status, 'within_limit');
  assert.equal(result.sideEffects, false);
});

test('Bike speed policy: over 50 proposes warning to driver and customer', () => {
  const result = evaluateBikeSpeedWarning({ rideType: 'bike', speedKmh: 51, accuracyMeters: 5, nowMs: 1000 });
  assert.equal(result.status, 'warning_proposal');
  assert.deepEqual(result.recipients, ['driver', 'customer']);
  assert.equal(result.limitKmh, SPEED_LIMIT_KMH);
  assert.equal(result.sideEffects, false);
});

test('Bike speed policy: non-bike rides are excluded', () => {
  for (const rideType of ['auto', 'car', 'delivery']) {
    const result = evaluateBikeSpeedWarning({ rideType, speedKmh: 90, accuracyMeters: 5 });
    assert.equal(result.status, 'ignored');
    assert.deepEqual(result.recipients, []);
  }
});

test('Bike speed policy: cooldown prevents notification spam', () => {
  const result = evaluateBikeSpeedWarning({ rideType: 'bike', speedKmh: 62, accuracyMeters: 5, nowMs: 50_000, lastWarningAtMs: 1_000 });
  assert.equal(result.status, 'warning_suppressed');
  assert.equal(result.sideEffects, false);
  assert.equal(WARNING_COOLDOWN_MS, 60_000);
});

test('Bike speed policy: unreliable/stale GPS fails closed', () => {
  assert.equal(evaluateBikeSpeedWarning({ rideType: 'bike', speedKmh: 70, accuracyMeters: 40 }).reason, 'gps_sample_unreliable');
  assert.equal(evaluateBikeSpeedWarning({ rideType: 'bike', speedKmh: 70, accuracyMeters: 5, sampleAgeMs: 15_000 }).reason, 'gps_sample_unreliable');
  assert.equal(evaluateBikeSpeedWarning({ rideType: 'bike', speedKmh: NaN, accuracyMeters: 5 }).reason, 'invalid_gps_sample');
});


test('Bike speed policy: invalid speed, GPS accuracy, and time values fail closed', () => {
  const invalid = [
    { speedKmh: -1, accuracyMeters: 5, nowMs: 100 },
    { speedKmh: 55, accuracyMeters: -1, nowMs: 100 },
    { speedKmh: 55, accuracyMeters: 5, nowMs: NaN },
    { speedKmh: 55, accuracyMeters: 5, nowMs: -1 },
    { speedKmh: 55, accuracyMeters: 5, nowMs: 100, lastWarningAtMs: Infinity }
  ];
  for (const input of invalid) {
    const result = evaluateBikeSpeedWarning({ rideType: 'bike', ...input });
    assert.equal(result.status, 'blocked');
    assert.equal(result.reason, 'invalid_gps_sample');
    assert.deepEqual(result.recipients, []);
    assert.equal(result.sideEffects, false);
  }
});

test('Bike speed policy: exact GPS quality boundaries are accepted', () => {
  const result = evaluateBikeSpeedWarning({ rideType: 'bike', speedKmh: 51, accuracyMeters: 20, sampleAgeMs: 10000, nowMs: 10000 });
  assert.equal(result.status, 'warning_proposal');
  assert.equal(result.sideEffects, false);
});


test('Bike speed warning: Telugu alert copy and warning tone are proposed without playback/delivery side effects', () => {
  const result = evaluateBikeSpeedWarning({ rideType: 'bike', speedKmh: 58, accuracyMeters: 5, sampleAgeMs: 1000, nowMs: 2000 });
  assert.equal(result.status, 'warning_proposal');
  assert.equal(result.warningTextTelugu, 'హెచ్చరిక! వేగ పరిమితి దాటింది. దయచేసి వేగం తగ్గించండి.');
  assert.equal(result.warningToneKey, 'bike_speed_limit_warning');
  assert.deepEqual(result.recipients, ['driver', 'customer']);
  assert.equal(result.sideEffects, false, 'QA decision must not deliver notification or play tone');
});
