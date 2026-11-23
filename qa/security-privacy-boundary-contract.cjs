// Phase 8.15 — Security & privacy boundary contract (QA-only, no runtime integration)
'use strict';
const SENSITIVE_FIELDS=Object.freeze(['password','otp','token','access_token','refresh_token','authorization','payment_card','cvv','secret','private_key']);
const ROLE_RECORD_ACCESS=Object.freeze({
 customer:['own_customer_record','own_orders','own_ride','own_service_requests'],
 driver:['own_driver_profile','assigned_ride','assigned_order'],
 partner:['own_partner_profile','own_store','own_catalog','assigned_order'],
 admin:['admin_review_records']
});
const EXTERNAL_ACTIONS=Object.freeze(['send_sms','send_email','push_notification','payment_charge','payment_refund','external_geocode','external_api_call','background_location','background_microphone']);
function roleAllowedRecord(role,resource,ownershipVerified=false,assignmentVerified=false){
 if(!ROLE_RECORD_ACCESS[role]||!ROLE_RECORD_ACCESS[role].includes(resource)) return false;
 if(resource.startsWith('own_')) return ownershipVerified===true;
 if(['assigned_ride','assigned_order'].includes(resource)) return assignmentVerified===true;
 return role==='admin';
}
function checkSensitiveExposure(fields){
 if(!Array.isArray(fields)) return {safe:false,reason:'invalid_fields'};
 const leaks=fields.filter(f=>SENSITIVE_FIELDS.includes(String(f).toLowerCase()));
 return leaks.length?{safe:false,reason:'sensitive_field_exposure',fields:leaks}:{safe:true,reason:'no_sensitive_fields'};
}
function sanitizeLog(input){
 if(!input||typeof input!=='object') return {valid:false,reason:'invalid_input'};
 const allowed=['event','module','status','error_code','timestamp','request_id'];
 const output={};
 for(const k of allowed) if(input[k]!==undefined) output[k]=input[k];
 return {valid:true,record:output};
}
function externalActionDecision(action,approved=false){
 if(!EXTERNAL_ACTIONS.includes(action)) return {allowed:false,reason:'unknown_action'};
 if(approved!==true) return {allowed:false,reason:'explicit_approval_required'};
 return {allowed:true,reason:'approval_gate_only',execution:'none'};
}
function checkPermission(input){
 if(!input||typeof input!=='object') return {allowed:false,reason:'invalid_input'};
 if(input.authenticated!==true) return {allowed:false,reason:'authentication_required'};
 if(input.role!==input.requiredRole && input.requiredRole && input.role!=='admin') return {allowed:false,reason:'role_mismatch'};
 if(input.resource==='admin_data'&&input.role!=='admin') return {allowed:false,reason:'admin_only'};
 if(input.resource==='personal_record'&&input.ownershipVerified!==true) return {allowed:false,reason:'ownership_not_verified'};
 if(input.resource==='assigned_work'&&input.assignmentVerified!==true) return {allowed:false,reason:'assignment_not_verified'};
 return {allowed:true,reason:'contract_allowlisted',execution:'none'};
}
function externalRequestPolicy(input){
 if(!input||typeof input!=='object') return {allowed:false,reason:'invalid_input'};
 if(input.hostIsAllowlisted!==true) return {allowed:false,reason:'host_not_allowlisted'};
 if(input.method==='POST'||input.method==='PUT'||input.method==='PATCH'||input.method==='DELETE') return {allowed:false,reason:'mutating_external_request_blocked'};
 if(input.containsSensitiveData===true) return {allowed:false,reason:'sensitive_data_blocked'};
 return {allowed:true,reason:'read_only_allowlisted_request',execution:'none'};
}
module.exports={SENSITIVE_FIELDS,ROLE_RECORD_ACCESS,EXTERNAL_ACTIONS,roleAllowedRecord,checkSensitiveExposure,sanitizeLog,externalActionDecision,checkPermission,externalRequestPolicy};
