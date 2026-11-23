'use strict';

const RIDE_TYPES = new Set(['bike', 'auto', 'car']);
const TIME_OPTIONS = new Set(['now', 'later']);

function validPoint(point) {
  if (!point || point.confirmed !== true || typeof point.label !== 'string' || !point.label.trim()) return false;
  const lat = Number(point.lat), lng = Number(point.lng);
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

function validateReadiness(input = {}) {
  const errors = [];
  if (input.role !== 'customer') errors.push('customer_role_required');
  if (!RIDE_TYPES.has(input.rideType)) errors.push('ride_type_invalid');
  if (!TIME_OPTIONS.has(input.timeOption)) errors.push('time_option_invalid');
  if (!validPoint(input.pickup)) errors.push('pickup_not_confirmed_or_invalid');
  if (!validPoint(input.drop)) errors.push('drop_not_confirmed_or_invalid');
  if (validPoint(input.pickup) && validPoint(input.drop) &&
      input.pickup.lat === input.drop.lat && input.pickup.lng === input.drop.lng) errors.push('pickup_drop_same');
  const fare = input.fareOffer;
  if (!fare || fare.currency !== 'INR' || !Number.isFinite(Number(fare.amount)) || Number(fare.amount) <= 0 ||
      fare.source !== 'mock_or_existing_app_quote') errors.push('fare_offer_invalid');
  if (input.note !== undefined && (typeof input.note !== 'string' || input.note.length > 240)) errors.push('note_invalid');
  return { ready: errors.length === 0, errors, action: errors.length ? 'blocked' : 'review_only' };
}

function requestBookingSubmission(state = {}, context = {}) {
  const check = validateReadiness(context);
  if (!check.ready) return { accepted: false, reason: 'readiness_failed', errors: check.errors, execution: 'not_performed' };
  if (context.trigger !== 'explicit_ui_gesture') return { accepted: false, reason: 'ui_confirmation_required', execution: 'not_performed' };
  if (state.submissionRequested === true) return { accepted: false, reason: 'duplicate_submission_blocked', execution: 'not_performed' };
  return { accepted: true, state: { submissionRequested: true, stage: 'submission_request_ready' },
    payload: { rideType: context.rideType, pickup: context.pickup, drop: context.drop, timeOption: context.timeOption,
      fareOffer: context.fareOffer, note: context.note || '' }, execution: 'not_performed', backendAuthorizationRequired: true };
}

module.exports = { RIDE_TYPES, TIME_OPTIONS, validPoint, validateReadiness, requestBookingSubmission };
