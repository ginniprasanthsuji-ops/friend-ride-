'use strict';

/**
 * QA-only speed warning policy. GPS/device speed measurement and push delivery
 * are intentionally outside this pure decision module.
 */
const SPEED_LIMIT_KMH = 50;
const WARNING_COOLDOWN_MS = 60_000;
const MAX_GPS_ACCURACY_METERS = 20;
const MAX_SAMPLE_AGE_MS = 10_000;

function evaluateBikeSpeedWarning({ rideType, speedKmh, accuracyMeters, sampleAgeMs = 0, nowMs = 0, lastWarningAtMs = null } = {}) {
  if (rideType !== 'bike') return { status: 'ignored', reason: 'ride_type_not_bike', recipients: [], sideEffects: false };
  if (!Number.isFinite(speedKmh) || !Number.isFinite(accuracyMeters) || !Number.isFinite(sampleAgeMs)) {
    return { status: 'blocked', reason: 'invalid_gps_sample', recipients: [], sideEffects: false };
  }
  if (accuracyMeters > MAX_GPS_ACCURACY_METERS || sampleAgeMs < 0 || sampleAgeMs > MAX_SAMPLE_AGE_MS) {
    return { status: 'blocked', reason: 'gps_sample_unreliable', recipients: [], sideEffects: false };
  }
  if (speedKmh <= SPEED_LIMIT_KMH) return { status: 'within_limit', limitKmh: SPEED_LIMIT_KMH, recipients: [], sideEffects: false };
  if (lastWarningAtMs !== null && nowMs - lastWarningAtMs < WARNING_COOLDOWN_MS) {
    return { status: 'warning_suppressed', reason: 'cooldown', limitKmh: SPEED_LIMIT_KMH, recipients: [], sideEffects: false };
  }
  return {
    status: 'warning_proposal',
    reason: 'speed_limit_exceeded',
    limitKmh: SPEED_LIMIT_KMH,
    measuredSpeedKmh: speedKmh,
    recipients: ['driver', 'customer'],
    cooldownMs: WARNING_COOLDOWN_MS,
    sideEffects: false
  };
}

module.exports = { SPEED_LIMIT_KMH, WARNING_COOLDOWN_MS, MAX_GPS_ACCURACY_METERS, MAX_SAMPLE_AGE_MS, evaluateBikeSpeedWarning };
