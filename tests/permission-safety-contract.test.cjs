'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const p=require('../qa/permission-safety-contract.cjs');

test('permission asks require foreground and a user gesture',()=>{
 assert.equal(p.permissionRequest('microphone',{foreground:true,userGesture:true,purpose:'voice_command'}).allowed,true);
 assert.equal(p.permissionRequest('location',{foreground:true,userGesture:true,purpose:'pickup_drop_selection'}).allowed,true);
 assert.equal(p.permissionRequest('microphone',{foreground:false,userGesture:true,purpose:'voice_command'}).reason,'foreground_required');
 assert.equal(p.permissionRequest('location',{foreground:true,userGesture:false,purpose:'pickup_drop_selection'}).reason,'user_gesture_required');
});

test('permission purposes are narrowly scoped and allowlisted',()=>{
 assert.equal(p.permissionRequest('microphone',{foreground:true,userGesture:true,purpose:'background_recording'}).allowed,false);
 assert.equal(p.permissionRequest('camera',{foreground:true,userGesture:true,purpose:'kyc'}).reason,'permission_not_allowlisted');
});

test('background permission use is denied',()=>{
 assert.equal(p.backgroundPermissionUse('location').allowed,false);
 assert.equal(p.backgroundPermissionUse('microphone').allowed,false);
});

test('voice cannot perform high-impact actions',()=>{
 for(const action of ['payment','cancel_ride','submit_booking','share_location'])
  assert.equal(p.authorizeHighImpact(action,{source:'voice',userGesture:true,explicitConfirmation:true,destinationApproved:true}).allowed,false);
});

test('high-impact action requires UI, gesture and explicit confirmation',()=>{
 assert.equal(p.authorizeHighImpact('payment',{source:'in_app_ui',userGesture:true,explicitConfirmation:true}).allowed,true);
 assert.equal(p.authorizeHighImpact('payment',{source:'in_app_ui',userGesture:true,explicitConfirmation:false}).reason,'explicit_confirmation_required');
 assert.equal(p.authorizeHighImpact('cancel_ride',{source:'unknown',userGesture:true,explicitConfirmation:true}).reason,'ui_source_required');
});

test('sharing location requires approved destination and never executes here',()=>{
 assert.equal(p.authorizeHighImpact('share_location',{source:'in_app_ui',userGesture:true,explicitConfirmation:true}).reason,'destination_approval_required');
 const result=p.authorizeHighImpact('share_location',{source:'in_app_ui',userGesture:true,explicitConfirmation:true,destinationApproved:true});
 assert.equal(result.allowed,true);
 assert.equal(result.execution,'not_performed');
 assert.equal(result.requiresBackendAuthorization,true);
});
