'use strict';

/**
 * Pure ride-draft safety contract. Does not call booking/payment APIs.
 */
const VALID_TYPES = new Set(['bike','auto','car']);
const VALID_STAGES = new Set(['draft','review','confirmed']);

function createRideDraft() {
  return { rideType:null, pickup:null, drop:null, fareQuote:null, stage:'draft' };
}

function setRideType(draft, rideType) {
  if (!VALID_TYPES.has(rideType)) return { ok:false, reason:'invalid_ride_type' };
  const d = draft && typeof draft === 'object' ? draft : createRideDraft();
  if (d.stage !== 'draft') return { ok:false, reason:'draft_locked' };
  return { ok:true, draft:{...d, rideType} };
}

function attachConfirmedLocations(draft, locations) {
  if (!draft || draft.stage !== 'draft') return { ok:false, reason:'draft_locked' };
  if (!locations || !locations.pickup || !locations.drop) return { ok:false, reason:'locations_required' };
  if (locations.pickup.confirmed !== true || locations.drop.confirmed !== true) return { ok:false, reason:'locations_unconfirmed' };
  if (locations.pickup.latitude === locations.drop.latitude && locations.pickup.longitude === locations.drop.longitude) return { ok:false, reason:'locations_must_differ' };
  return { ok:true, draft:{...draft, pickup:locations.pickup, drop:locations.drop} };
}

function attachFareQuote(draft, quote) {
  if (!draft || draft.stage !== 'draft') return { ok:false, reason:'draft_locked' };
  if (!quote || typeof quote !== 'object') return { ok:false, reason:'quote_required' };
  const amount = Number(quote.amount);
  if (!Number.isFinite(amount) || amount < 0) return { ok:false, reason:'invalid_quote_amount' };
  if (typeof quote.currency !== 'string' || quote.currency.trim().toUpperCase() !== 'INR') return { ok:false, reason:'unsupported_currency' };
  if (!quote.source || quote.source !== 'mock_or_existing_app_quote') return { ok:false, reason:'quote_source_not_approved' };
  return { ok:true, draft:{...draft, fareQuote:{amount,currency:'INR',source:quote.source}} };
}

function validateForReview(draft) {
  if (!draft || !VALID_TYPES.has(draft.rideType)) return { ok:false, reason:'ride_type_required' };
  if (!draft.pickup || !draft.drop) return { ok:false, reason:'locations_required' };
  if (draft.pickup.confirmed !== true || draft.drop.confirmed !== true) return { ok:false, reason:'locations_unconfirmed' };
  if (draft.pickup.latitude === draft.drop.latitude && draft.pickup.longitude === draft.drop.longitude) return { ok:false, reason:'locations_must_differ' };
  if (!draft.fareQuote) return { ok:false, reason:'fare_quote_required' };
  return { ok:true };
}

function openReview(draft) {
  const validation = validateForReview(draft);
  if (!validation.ok) return validation;
  if (draft.stage !== 'draft') return { ok:false, reason:'invalid_stage_transition' };
  return { ok:true, draft:{...draft, stage:'review'} };
}

function confirmBookingFromUI(draft, explicitUserAction) {
  if (!draft || draft.stage !== 'review') return { ok:false, reason:'review_stage_required' };
  if (explicitUserAction !== true) return { ok:false, reason:'explicit_ui_confirmation_required' };
  return { ok:true, action:{type:'booking_confirmation_requested', draft:{...draft, stage:'confirmed'}, source:'in_app_ui'} };
}

function executeBookingFromVoice() {
  return { ok:false, reason:'voice_booking_execution_disabled' };
}

module.exports = { createRideDraft, setRideType, attachConfirmedLocations, attachFareQuote, validateForReview, openReview, confirmBookingFromUI, executeBookingFromVoice, VALID_TYPES, VALID_STAGES };
