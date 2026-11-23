'use strict';

/** Location UI adapter policy. No GPS, geocoding, maps or DOM calls here. */
const FIELDS=new Set(['pickup','drop']);

function locationInputAction(field, source, payload={}) {
 if(!FIELDS.has(field)) return {allowed:false,reason:'field_not_allowlisted'};
 if(source==='manual') {
   const label=typeof payload.label==='string'?payload.label.trim():'';
   if(label.length<2) return {allowed:false,reason:'manual_label_required'};
   return {allowed:true,action:{type:'location_candidate',field,source:'manual',label,coordinates:null,confirmed:false}};
 }
 if(source==='device') {
   if(payload.userGesture!==true||payload.foreground!==true) return {allowed:false,reason:'foreground_gesture_required'};
   const lat=payload.latitude,lon=payload.longitude;
   if(typeof lat!=='number'||typeof lon!=='number'||!Number.isFinite(lat)||!Number.isFinite(lon)||lat < -90||lat>90||lon < -180||lon>180) return {allowed:false,reason:'coordinates_invalid'};
   return {allowed:true,action:{type:'location_candidate',field,source:'device',label:payload.label||'',coordinates:{latitude:lat,longitude:lon},confirmed:false,permissionScope:'foreground_once'}};
 }
 return {allowed:false,reason:'source_not_allowlisted'};
}

function confirmLocationCandidate(candidate, explicitUserConfirmation) {
 if(!candidate||candidate.type!=='location_candidate')return {allowed:false,reason:'candidate_required'};
 if(candidate.confirmed===true)return {allowed:false,reason:'already_confirmed'};
 if(explicitUserConfirmation!==true)return {allowed:false,reason:'explicit_confirmation_required'};
 if(candidate.source==='manual' && (!candidate.label||candidate.label.trim().length<2))return {allowed:false,reason:'manual_label_required'};
 if(candidate.source==='device' && !candidate.coordinates)return {allowed:false,reason:'coordinates_required'};
 return {allowed:true,candidate:{...candidate,confirmed:true}};
}

function requireLocationFallback(preferredSource) {
 if(preferredSource==='device') return {primary:'device_gps',fallback:'manual_text_or_map_pin',gpsRequired:false};
 return {primary:'manual_text_or_map_pin',fallback:'device_gps_on_user_request',gpsRequired:false};
}

module.exports={locationInputAction,confirmLocationCandidate,requireLocationFallback,FIELDS};
