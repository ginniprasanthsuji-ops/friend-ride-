'use strict';

/**
 * QA-only manual helmet verification gate.
 * No camera API, image processing, storage, ride mutation or external action.
 */
function evaluateHelmetVerification({ rideType, rideId, permission, captureChecked = false, verificationRideId, rideStatus = 'pending' } = {}) {
  if (rideType !== 'bike') return { status: 'not_required', reason: 'ride_type_not_bike', allowStart: true, sideEffects: false };
  if (!rideId || typeof rideId !== 'string') return { status: 'blocked', reason: 'missing_ride_binding', allowStart: false, sideEffects: false };
  if (rideStatus === 'completed' || rideStatus === 'cancelled') return { status: 'reset', reason: 'ride_terminal', allowStart: false, sideEffects: false };
  if (permission !== 'granted') return { status: 'blocked', reason: 'camera_permission_required', allowStart: false, sideEffects: false };
  if (!captureChecked) return { status: 'pending_manual_check', reason: 'manual_capture_check_required', allowStart: false, sideEffects: false };
  if (verificationRideId !== rideId) return { status: 'blocked', reason: 'ride_session_mismatch', allowStart: false, sideEffects: false };
  return { status: 'verified', allowStart: true, rideId, method: 'manual_user_check', sideEffects: false };
}

module.exports = { evaluateHelmetVerification };
