'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateHelmetVerification } = require('../qa/arjuna-x-helmet-verification.cjs');

test('helmet gate applies only to bike rides', () => {
  for (const rideType of ['auto', 'car', 'delivery']) {
    const result = evaluateHelmetVerification({ rideType, rideId: 'r1', permission: 'denied' });
    assert.equal(result.status, 'not_required');
    assert.equal(result.allowStart, true);
    assert.equal(result.sideEffects, false);
  }
});

test('camera permission denied blocks bike start', () => {
  const result = evaluateHelmetVerification({ rideType: 'bike', rideId: 'bike-1', permission: 'denied', captureChecked: true, verificationRideId: 'bike-1' });
  assert.equal(result.status, 'blocked');
  assert.equal(result.reason, 'camera_permission_required');
  assert.equal(result.allowStart, false);
});

test('granted permission alone is insufficient: manual capture/check required', () => {
  const result = evaluateHelmetVerification({ rideType: 'bike', rideId: 'bike-2', permission: 'granted' });
  assert.equal(result.status, 'pending_manual_check');
  assert.equal(result.allowStart, false);
});

test('manual check is bound to the exact ride session', () => {
  const result = evaluateHelmetVerification({ rideType: 'bike', rideId: 'bike-A', permission: 'granted', captureChecked: true, verificationRideId: 'bike-B' });
  assert.equal(result.status, 'blocked');
  assert.equal(result.reason, 'ride_session_mismatch');
  assert.equal(result.allowStart, false);
});

test('verified manual check allows start only for its ride', () => {
  const result = evaluateHelmetVerification({ rideType: 'bike', rideId: 'bike-A', permission: 'granted', captureChecked: true, verificationRideId: 'bike-A' });
  assert.equal(result.status, 'verified');
  assert.equal(result.allowStart, true);
  assert.equal(result.method, 'manual_user_check');
  assert.equal(result.sideEffects, false);
});

test('completed or cancelled ride resets verification; missing binding fails closed', () => {
  assert.equal(evaluateHelmetVerification({ rideType: 'bike', rideId: 'bike-A', permission: 'granted', captureChecked: true, verificationRideId: 'bike-A', rideStatus: 'completed' }).status, 'reset');
  assert.equal(evaluateHelmetVerification({ rideType: 'bike', permission: 'granted', captureChecked: true }).reason, 'missing_ride_binding');
});
