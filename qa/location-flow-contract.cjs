'use strict';

/**
 * ARJUNA X location-flow contract. Pure validation; does not request device GPS,
 * call geocoders, send/share coordinates, or mutate booking state.
 */
const LOCATION_FIELDS = new Set(['pickup','drop']);
const LOCATION_SOURCES = new Set(['manual','device']);

function normalizeLocationCandidate(candidate) {
  if (!candidate || typeof candidate !== 'object') return { ok:false, reason:'missing_location' };
  const lat = Number(candidate.latitude);
  const lng = Number(candidate.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return { ok:false, reason:'invalid_coordinates' };
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return { ok:false, reason:'coordinates_out_of_range' };
  const label = typeof candidate.label === 'string' ? candidate.label.trim() : '';
  if (!label) return { ok:false, reason:'label_required' };
  const source = candidate.source;
  if (!LOCATION_SOURCES.has(source)) return { ok:false, reason:'invalid_source' };
  return { ok:true, location:{ latitude:lat, longitude:lng, label, source, confirmed:false } };
}

function confirmLocation(location, userConfirmed) {
  if (!location || location.confirmed !== false || userConfirmed !== true) return { ok:false, reason:'explicit_confirmation_required' };
  return { ok:true, location:{ ...location, confirmed:true } };
}

function setRideLocation(draft, field, candidate, userConfirmed) {
  if (!LOCATION_FIELDS.has(field)) return { ok:false, reason:'invalid_location_field' };
  const normalized = normalizeLocationCandidate(candidate);
  if (!normalized.ok) return normalized;
  const confirmed = confirmLocation(normalized.location, userConfirmed);
  if (!confirmed.ok) return confirmed;
  const current = draft && typeof draft === 'object' ? draft : {};
  return { ok:true, draft:{ ...current, [field]:confirmed.location } };
}

function validateRideLocations(draft) {
  if (!draft || !draft.pickup || !draft.drop) return { ok:false, reason:'pickup_and_drop_required' };
  for (const field of ['pickup','drop']) {
    const location = draft[field];
    if (location.confirmed !== true) return { ok:false, reason:'both_locations_must_be_confirmed' };
    if (!Number.isFinite(location.latitude) || !Number.isFinite(location.longitude)) return { ok:false, reason:'invalid_coordinates' };
  }
  if (draft.pickup.latitude === draft.drop.latitude && draft.pickup.longitude === draft.drop.longitude) {
    return { ok:false, reason:'pickup_drop_must_differ' };
  }
  return { ok:true };
}

module.exports = { normalizeLocationCandidate, confirmLocation, setRideLocation, validateRideLocations, LOCATION_FIELDS, LOCATION_SOURCES };
