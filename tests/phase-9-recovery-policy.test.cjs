'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { decideRecovery } = require('../qa/arjuna-x-recovery-policy.cjs');

test('non-mutating transient failures receive safe fallbacks', () => {
  assert.deepEqual(decideRecovery({ errorCode: 'TIMEOUT' }), {
    recover: true, reason: 'safe_non_mutating_fallback', fallback: 'return_timeout_status', reconcileRequired: false
  });
  assert.equal(decideRecovery({ errorCode: 'NETWORK_UNAVAILABLE' }).fallback, 'return_unavailable_status');
});

test('unknown errors fail closed to generic failure', () => {
  assert.equal(decideRecovery({ errorCode: 'UNCLASSIFIED' }).fallback, 'return_generic_failure');
});

test('committed side effects require reconciliation and no replay', () => {
  const result = decideRecovery({ errorCode: 'TIMEOUT', sideEffectCommitted: true });
  assert.equal(result.recover, false);
  assert.equal(result.reconcileRequired, true);
  assert.equal(result.reason, 'side_effect_commit_requires_reconciliation');
});

test('external-effect actions cannot be auto-recovered or replayed', () => {
  for (const errorCode of ['PAYMENT', 'BOOKING_MUTATION', 'ORDER_MUTATION', 'GPS_ACTION', 'DEVICE_ACTION']) {
    const result = decideRecovery({ errorCode });
    assert.equal(result.recover, false, errorCode);
    assert.equal(result.reconcileRequired, true, errorCode);
  }
});

test('completed operations are not replayed', () => {
  const result = decideRecovery({ errorCode: 'TIMEOUT', operationCompleted: true });
  assert.equal(result.recover, false);
  assert.equal(result.fallback, 'return_completion_status');
});

test('invalid recovery context fails closed', () => {
  assert.equal(decideRecovery({ errorCode: 'TIMEOUT', userConfirmed: 'yes' }).recover, false);
  assert.equal(decideRecovery({ errorCode: 'TIMEOUT', userConfirmed: 'yes' }).reconcileRequired, true);
});
