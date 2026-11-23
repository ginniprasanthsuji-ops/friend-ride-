'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const a=require('../qa/arjuna-ui-adapter-contract.cjs');

test('navigation intent maps only to allowlisted UI targets',()=>{
 assert.equal(a.mapIntentToUiAction({type:'navigate',target:'ride'}).type,'navigation_request');
 assert.equal(a.mapIntentToUiAction({type:'navigate',target:'admin'}).reason,'target_not_allowlisted');
});

test('ride selection mapping remains reviewable and allowlisted',()=>{
 assert.equal(a.mapIntentToUiAction({type:'select_ride_type',rideType:'car'}).requiresUserReview,true);
 assert.equal(a.mapIntentToUiAction({type:'select_ride_type',rideType:'truck'}).reason,'ride_type_not_allowlisted');
});

test('booking review is request-only and requires later UI confirmation',()=>{
 const mapped=a.mapIntentToUiAction({type:'review_booking'});
 assert.equal(mapped.execution,'none');
 assert.equal(mapped.requiresExplicitUiConfirmation,true);
 const gated=a.applyUiActionGate(mapped,{uiAvailable:true});
 assert.equal(gated.execution,'not_performed');
 assert.equal(gated.requiresExplicitUiConfirmation,true);
});

test('navigation gate needs UI availability and does not execute',()=>{
 const mapped=a.mapIntentToUiAction({type:'navigate',target:'orders'});
 assert.equal(a.applyUiActionGate(mapped,{uiAvailable:false}).reason,'ui_not_available');
 const result=a.applyUiActionGate(mapped,{uiAvailable:true});
 assert.equal(result.allowed,true);
 assert.equal(result.execution,'not_performed');
});

test('ride selection gate requires explicit confirmation',()=>{
 const mapped=a.mapIntentToUiAction({type:'select_ride_type',rideType:'auto'});
 assert.equal(a.applyUiActionGate(mapped,{uiAvailable:true,userConfirmed:false}).reason,'selection_confirmation_required');
 assert.equal(a.applyUiActionGate(mapped,{uiAvailable:true,userConfirmed:true}).allowed,true);
});

test('blocked voice action can only display a safe notice',()=>{
 const mapped=a.mapIntentToUiAction({type:'blocked',reason:'voice_payment_blocked'});
 const result=a.applyUiActionGate(mapped,{uiAvailable:true});
 assert.deepEqual(result.action,{type:'show_blocked_notice',reason:'voice_payment_blocked'});
 assert.equal(result.execution,'not_performed');
});
