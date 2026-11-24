'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateBikeSpeedWarning, SPEED_LIMIT_KMH, WARNING_COOLDOWN_MS } = require('../qa/arjuna-x-bike-speed-warning.cjs');

test('Phase 10 final safety audit matrix: threshold, warning proposal, recipients, Telugu payload, cooldown, GPS fail-closed', () => {
  const boundary = evaluateBikeSpeedWarning({ rideType: 'bike', speedKmh: SPEED_LIMIT_KMH, accuracyMeters: 20, sampleAgeMs: 10_000, nowMs: 1000 });
  assert.equal(boundary.status, 'within_limit');
  assert.equal(boundary.sideEffects, false);

  const warning = evaluateBikeSpeedWarning({ rideType: 'bike', speedKmh: SPEED_LIMIT_KMH + 0.001, accuracyMeters: 0, sampleAgeMs: 0, nowMs: 1001 });
  assert.equal(warning.status, 'warning_proposal');
  assert.deepEqual(warning.recipients, ['driver', 'customer']);
  assert.equal(warning.limitKmh, SPEED_LIMIT_KMH);
  assert.equal(warning.cooldownMs, WARNING_COOLDOWN_MS);
  assert.equal(warning.voiceAlertLocale, 'te-IN');
  assert.ok(warning.warningTextTelugu.length > 0);
  assert.ok(warning.voiceAlertTelugu.length > 0);
  assert.equal(warning.sideEffects, false);

  const cooldownBefore = evaluateBikeSpeedWarning({ rideType: 'bike', speedKmh: 60, accuracyMeters: 5, sampleAgeMs: 0, nowMs: 60_999, lastWarningAtMs: 1000 });
  assert.equal(cooldownBefore.status, 'warning_suppressed');
  assert.deepEqual(cooldownBefore.recipients, []);
  assert.equal(cooldownBefore.sideEffects, false);

  const cooldownBoundary = evaluateBikeSpeedWarning({ rideType: 'bike', speedKmh: 60, accuracyMeters: 5, sampleAgeMs: 0, nowMs: 61_000, lastWarningAtMs: 1000 });
  assert.equal(cooldownBoundary.status, 'warning_proposal');
  assert.equal(cooldownBoundary.sideEffects, false);

  const stale = evaluateBikeSpeedWarning({ rideType: 'bike', speedKmh: 80, accuracyMeters: 5, sampleAgeMs: 10_001, nowMs: 2000 });
  assert.equal(stale.status, 'blocked');
  assert.equal(stale.reason, 'gps_sample_unreliable');
  assert.deepEqual(stale.recipients, []);
  assert.equal(stale.sideEffects, false);
});
