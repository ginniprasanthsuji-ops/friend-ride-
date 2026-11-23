'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const l=require('../qa/location-ui-adapter-contract.cjs');

test('manual pickup/drop text can be used without GPS',()=>{
 const r=l.locationInputAction('pickup','manual',{label:'Tekkali bus stand'});
 assert.equal(r.allowed,true);
 assert.equal(r.action.coordinates,null);
 assert.equal(r.action.confirmed,false);
});

test('manual input requires a useful label and allowlisted field',()=>{
 assert.equal(l.locationInputAction('pickup','manual',{label:'x'}).reason,'manual_label_required');
 assert.equal(l.locationInputAction('admin','manual',{label:'Test'}).reason,'field_not_allowlisted');
});

test('device GPS candidate requires foreground and user gesture',()=>{
 assert.equal(l.locationInputAction('drop','device',{latitude:17.7,longitude:83.3,userGesture:true,foreground:true}).allowed,true);
 assert.equal(l.locationInputAction('drop','device',{latitude:17.7,longitude:83.3,userGesture:false,foreground:true}).reason,'foreground_gesture_required');
});

test('invalid GPS values rejected',()=>{
 for(const values of [{latitude:91,longitude:1},{latitude:1,longitude:181},{latitude:NaN,longitude:2},{latitude:'1',longitude:2}])
  assert.equal(l.locationInputAction('pickup','device',{...values,userGesture:true,foreground:true}).reason,'coordinates_invalid');
});

test('location cannot be confirmed without explicit confirmation',()=>{
 const candidate=l.locationInputAction('pickup','manual',{label:'Main Market'}).action;
 assert.equal(l.confirmLocationCandidate(candidate,false).reason,'explicit_confirmation_required');
 assert.equal(l.confirmLocationCandidate(candidate,true).candidate.confirmed,true);
});

test('confirmation requires appropriate candidate data and prevents repeat',()=>{
 const noCoords={type:'location_candidate',field:'drop',source:'device',confirmed:false};
 assert.equal(l.confirmLocationCandidate(noCoords,true).reason,'coordinates_required');
 const confirmed=l.confirmLocationCandidate(l.locationInputAction('drop','manual',{label:'Railway Station'}).action,true).candidate;
 assert.equal(l.confirmLocationCandidate(confirmed,true).reason,'already_confirmed');
});

test('GPS selection retains a manual fallback and is never required',()=>{
 assert.deepEqual(l.requireLocationFallback('device'),{primary:'device_gps',fallback:'manual_text_or_map_pin',gpsRequired:false});
 assert.deepEqual(l.requireLocationFallback('manual'),{primary:'manual_text_or_map_pin',fallback:'device_gps_on_user_request',gpsRequired:false});
});
