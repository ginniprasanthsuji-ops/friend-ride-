'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateBikeSpeedWarning, WARNING_COOLDOWN_MS } = require('../qa/arjuna-x-bike-speed-warning.cjs');

test('Phase 10 final timestamp audit: clock rollback and ancient warning timestamp fail safe', () => {
  const rollback = evaluateBikeSpeedWarning({
    rideType: 'bike', speedKmh: 75, accuracyMeters: 5, sampleAgeMs: 100,
    nowMs: 9_000, lastWarningAtMs: 10_000
  });
  assert.equal(rollback.status, 'warning_suppressed');
  assert.equal(rollback.reason, 'cooldown');
  assert.deepEqual(rollback.recipients, []);
  assert.equal(rollback.sideEffects, false);

  const elapsed = evaluateBikeSpeedWarning({
    rideType: 'bike', speedKmh: 75, accuracyMeters: 5, sampleAgeMs: 100,
    nowMs: 1_000_000, lastWarningAtMs: 1_000_000 - WARNING_COOLDOWN_MS - 1
  });
  assert.equal(elapsed.status, 'warning_proposal');
  assert.deepEqual(elapsed.recipients, ['driver', 'customer']);
  assert.equal(elapsed.sideEffects, false);
});
