// Phase 8.14 — Error handling, recovery & offline readiness contract (QA only)
'use strict';
const RETRYABLE = Object.freeze(['network_error','timeout','server_5xx','rate_limited','offline']);
const NON_RETRYABLE = Object.freeze(['validation_error','permission_denied','not_found','payment_declined','cancelled']);
function classifyError(input){
 if(!input||typeof input!=='object') return {category:'unknown',retryable:false};
 const code=String(input.code||input.type||'unknown').toLowerCase();
 if(RETRYABLE.includes(code)) return {category:code,retryable:true};
 if(NON_RETRYABLE.includes(code)) return {category:code,retryable:false};
 return {category:'unknown',retryable:false};
}
function recoveryDecision(input){
 const c=classifyError(input);
 if(!c.retryable) return {retry:false,reason:c.category};
 if(input&&input.online===false) return {retry:false,reason:'offline_wait_for_reconnect'};
 if(input&&input.retryCount>=3) return {retry:false,reason:'retry_limit'};
 if(input&&input.duplicateRisk===true) return {retry:false,reason:'duplicate_risk_requires_reconciliation'};
 return {retry:true,reason:'safe_retry_candidate',delayMs:[1000,2000,4000][Math.max(0,Math.min(2,Number(input.retryCount)||0))]};
}
function offlineReadiness(input){
 if(!input||typeof input!=='object') return {ready:false,reason:'invalid_input'};
 if(input.online!==true) return {ready:false,reason:'offline'};
 if(input.stale===true) return {ready:false,reason:'stale_data'};
 if(input.authenticated!==true) return {ready:false,reason:'auth_required'};
 return {ready:true,reason:'online_fresh_authenticated'};
}
function checkReconnect(input){
 if(!input||typeof input!=='object') return {ok:false,reason:'invalid_input'};
 if(input.online!==true) return {ok:false,reason:'still_offline'};
 if(input.pendingMutation===true) return {ok:false,reason:'pending_mutation_needs_reconciliation'};
 if(input.sessionValid!==true) return {ok:false,reason:'session_refresh_required'};
 return {ok:true,reason:'reconnected_safe',execution:'none'};
}
function validateRetry(input){
 if(!input||typeof input!=='object') return {valid:false,reason:'invalid_input'};
 if(!input.idempotencyKey) return {valid:false,reason:'missing_idempotency_key'};
 if(input.originalOperationId!==input.retryOperationId) return {valid:false,reason:'operation_id_mismatch'};
 if(input.retryCount>3) return {valid:false,reason:'retry_limit'};
 return {valid:true,reason:'retry_contract_valid',execution:'none'};
}
function fallbackPolicy(feature){
 const policies={catalog:'cached_read_only_if_fresh',location:'manual_entry_only',ride_booking:'block_until_online_and_confirmed',payment:'never_retry_automatically',otp:'user_initiated_retry_only',orders:'show_status_and_reconcile_before_retry'};
 return policies[feature]||'safe_block_and_show_recovery';
}
module.exports={RETRYABLE,NON_RETRYABLE,classifyError,recoveryDecision,offlineReadiness,checkReconnect,validateRetry,fallbackPolicy};
