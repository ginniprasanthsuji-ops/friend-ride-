'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const api = require('../qa/ride-workflow-contract.cjs');

const locations = {
 pickup:{latitude:17.6,longitude:83.2,label:'QA pickup',source:'manual',confirmed:true},
 drop:{latitude:17.7,longitude:83.3,label:'QA drop',source:'manual',confirmed:true}
};
const quote = {amount:125,currency:'INR',source:'mock_or_existing_app_quote'};

function completeDraft(type='bike') {
 let d=api.createRideDraft();
 d=api.setRideType(d,type).draft;
 d=api.attachConfirmedLocations(d,locations).draft;
 d=api.attachFareQuote(d,quote).draft;
 return d;
}

test('ride draft defaults to draft and no side effects',()=> {
 const d=api.createRideDraft();
 assert.equal(d.stage,'draft');
 assert.equal(d.rideType,null);
 assert.equal(d.fareQuote,null);
});

test('only Bike Auto Car can be selected',()=> {
 for(const t of ['bike','auto','car']) assert.equal(api.setRideType(api.createRideDraft(),t).ok,true);
 for(const t of ['truck','bus','admin']) assert.equal(api.setRideType(api.createRideDraft(),t).ok,false);
});

test('review requires ride type, confirmed distinct locations and quote',()=> {
 assert.equal(api.openReview(api.createRideDraft()).reason,'ride_type_required');
 let d=api.setRideType(api.createRideDraft(),'auto').draft;
 assert.equal(api.openReview(d).reason,'locations_required');
 d=api.attachConfirmedLocations(d,{pickup:{...locations.pickup,confirmed:false},drop:locations.drop}).draft || d;
 assert.equal(api.attachConfirmedLocations(api.setRideType(api.createRideDraft(),'auto').draft,{pickup:{...locations.pickup,confirmed:false},drop:locations.drop}).reason,'locations_unconfirmed');
 d=completeDraft();
 assert.equal(api.validateForReview(d).ok,true);
 assert.equal(api.openReview(d).draft.stage,'review');
});

test('fare quote rejects invalid values, currencies and source',()=> {
 const d=api.createRideDraft();
 assert.equal(api.attachFareQuote(d,{amount:-1,currency:'INR',source:'mock_or_existing_app_quote'}).ok,false);
 assert.equal(api.attachFareQuote(d,{amount:99,currency:'USD',source:'mock_or_existing_app_quote'}).ok,false);
 assert.equal(api.attachFareQuote(d,{amount:99,currency:'INR',source:'external_unapproved'}).ok,false);
});

test('voice cannot execute booking; explicit UI confirmation required',()=> {
 assert.equal(api.executeBookingFromVoice().ok,false);
 const review=api.openReview(completeDraft()).draft;
 assert.equal(api.confirmBookingFromUI(review,false).reason,'explicit_ui_confirmation_required');
 assert.equal(api.confirmBookingFromUI(review,true).action.type,'booking_confirmation_requested');
});

test('draft is locked after review; stage transition cannot be bypassed',()=> {
 const review=api.openReview(completeDraft()).draft;
 assert.equal(api.setRideType(review,'car').reason,'draft_locked');
 assert.equal(api.openReview(review).reason,'invalid_stage_transition');
 assert.equal(api.confirmBookingFromUI(completeDraft(),true).reason,'review_stage_required');
});
