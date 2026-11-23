'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { validateReadiness, requestBookingSubmission, validPoint } = require('../qa/ride-booking-readiness-contract.cjs');

const good = { role:'customer', rideType:'auto', timeOption:'now',
 pickup:{label:'A',lat:17.7,lng:83.3,confirmed:true}, drop:{label:'B',lat:17.8,lng:83.4,confirmed:true},
 fareOffer:{amount:125,currency:'INR',source:'mock_or_existing_app_quote'}, trigger:'explicit_ui_gesture' };

test('confirmed distinct pickup/drop and approved quote are review-ready', () => { assert.deepEqual(validateReadiness(good), {ready:true,errors:[],action:'review_only'}); });
test('blocks invalid role, ride type, and unconfirmed locations', () => {
 assert.equal(validateReadiness({...good,role:'driver'}).ready,false);
 assert.equal(validateReadiness({...good,rideType:'helicopter'}).ready,false);
 assert.equal(validateReadiness({...good,pickup:{...good.pickup,confirmed:false}}).ready,false);
});
test('rejects identical pickup/drop and invalid fare', () => {
 assert.equal(validateReadiness({...good,drop:{...good.pickup}}).ready,false);
 assert.equal(validateReadiness({...good,fareOffer:{amount:0,currency:'INR',source:'mock_or_existing_app_quote'}}).ready,false);
 assert.equal(validateReadiness({...good,fareOffer:{amount:100,currency:'USD',source:'mock_or_existing_app_quote'}}).ready,false);
});
test('validates coordinate ranges and note length', () => {
 assert.equal(validPoint({label:'x',lat:91,lng:1,confirmed:true}),false);
 assert.equal(validateReadiness({...good,note:'x'.repeat(241)}).ready,false);
});
test('submission request requires explicit UI gesture and is duplicate guarded', () => {
 assert.equal(requestBookingSubmission({}, {...good,trigger:'voice'}).accepted,false);
 const first=requestBookingSubmission({},good);
 assert.equal(first.accepted,true);
 assert.equal(first.execution,'not_performed');
 assert.equal(requestBookingSubmission(first.state,good).reason,'duplicate_submission_blocked');
});
test('never executes backend booking or payment', () => {
 const result=requestBookingSubmission({},good);
 assert.equal(result.execution,'not_performed');
 assert.equal(result.backendAuthorizationRequired,true);
 assert.equal(result.payload.fareOffer.currency,'INR');
});
