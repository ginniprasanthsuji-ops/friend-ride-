'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeLocationCandidate, confirmLocation, setRideLocation, validateRideLocations } = require('../qa/location-flow-contract.cjs');

const pickup = { latitude:17.6868, longitude:83.2185, label:'Pickup QA point', source:'manual' };
const drop = { latitude:17.72, longitude:83.3, label:'Drop QA point', source:'manual' };

test('valid candidate is normalized but not confirmed', () => {
  const result = normalizeLocationCandidate(pickup);
  assert.equal(result.ok,true);
  assert.equal(result.location.confirmed,false);
  assert.equal(result.location.source,'manual');
});

test('rejects invalid, missing and out-of-range coordinates', () => {
  assert.equal(normalizeLocationCandidate(null).ok,false);
  assert.equal(normalizeLocationCandidate({...pickup,latitude:91}).reason,'coordinates_out_of_range');
  assert.equal(normalizeLocationCandidate({...pickup,longitude:181}).reason,'coordinates_out_of_range');
  assert.equal(normalizeLocationCandidate({...pickup,latitude:'bad'}).reason,'invalid_coordinates');
  assert.equal(normalizeLocationCandidate({...pickup,label:'  '}).reason,'label_required');
  assert.equal(normalizeLocationCandidate({...pickup,source:'geocoder'}).reason,'invalid_source');
});

test('explicit confirmation required before setting pickup/drop', () => {
  assert.equal(confirmLocation(normalizeLocationCandidate(pickup).location,false).ok,false);
  const set = setRideLocation({},'pickup',pickup,true);
  assert.equal(set.ok,true);
  assert.equal(set.draft.pickup.confirmed,true);
});

test('field allowlist prevents unexpected state keys', () => {
  assert.equal(setRideLocation({},'admin',pickup,true).reason,'invalid_location_field');
});

test('ride location validation requires both confirmed and distinct points', () => {
  assert.equal(validateRideLocations({}).reason,'pickup_and_drop_required');
  const p = setRideLocation({},'pickup',pickup,true).draft;
  assert.equal(validateRideLocations(p).reason,'pickup_and_drop_required');
  const both = setRideLocation(p,'drop',drop,true).draft;
  assert.equal(validateRideLocations(both).ok,true);
  const same = setRideLocation(p,'drop',pickup,true).draft;
  assert.equal(validateRideLocations(same).reason,'pickup_drop_must_differ');
});

test('confirmation cannot be repeated on an already-confirmed location object', () => {
  const confirmed = setRideLocation({},'pickup',pickup,true).draft.pickup;
  assert.equal(confirmLocation(confirmed,true).ok,false);
});
