// Phase 8.13 — Data integrity & duplicate prevention contract (QA only)
'use strict';
const LIMITS = Object.freeze({ notes:240, currency:'INR', maxItems:100 });
function validId(value){return typeof value==='string' && value.trim().length>0 && value.trim().length<=128;}
function validMoney(value){return typeof value==='number' && Number.isFinite(value) && value>=0;}
function validateMoneyRecord(record){
  if(!record || typeof record!=='object') return {valid:false,reason:'invalid_record'};
  if(record.currency!==LIMITS.currency) return {valid:false,reason:'currency_mismatch'};
  if(!validMoney(record.total)) return {valid:false,reason:'invalid_total'};
  if(record.subtotal!==undefined && !validMoney(record.subtotal)) return {valid:false,reason:'invalid_subtotal'};
  if(record.fee!==undefined && !validMoney(record.fee)) return {valid:false,reason:'invalid_fee'};
  if(record.subtotal!==undefined && record.fee!==undefined && Math.abs(record.total-(record.subtotal+record.fee))>0.01) return {valid:false,reason:'total_mismatch'};
  return {valid:true,reason:'money_record_valid'};
}
function duplicateKey(type, fields){
  if(!validId(type) || !fields || typeof fields!=='object') return null;
  const required=['actor_id','operation','target_id','idempotency_key'];
  if(required.some(k=>!validId(fields[k]))) return null;
  return [type,...required.map(k=>fields[k].trim())].join('|');
}
function isDuplicate(existingKeys,key){return Array.isArray(existingKeys)&&typeof key==='string'&&existingKeys.includes(key);}
function checkSubmission(input, existingKeys=[]){
  if(!input||typeof input!=='object') return {allowed:false,reason:'invalid_input'};
  if(input.confirmed!==true) return {allowed:false,reason:'confirmation_required'};
  if(input.submitting===true) return {allowed:false,reason:'submission_in_progress'};
  const key=duplicateKey(input.type,input);
  if(!key) return {allowed:false,reason:'missing_idempotency_fields'};
  if(isDuplicate(existingKeys,key)) return {allowed:false,reason:'duplicate_submission'};
  return {allowed:true,reason:'integrity_valid',execution:'none',key};
}
function validateOwnership(record, expected){
  if(!record||!expected||typeof expected!=='object') return {valid:false,reason:'invalid_input'};
  for(const field of ['actor_id','store_id','customer_id']){
    if(expected[field]!==undefined && record[field]!==expected[field]) return {valid:false,reason:'ownership_mismatch',field};
  }
  return {valid:true,reason:'ownership_valid'};
}
function validateWorkflowFreshness(record,expectedVersion){
  if(!record||!Number.isInteger(record.version)||!Number.isInteger(expectedVersion)) return {valid:false,reason:'invalid_version'};
  if(record.version!==expectedVersion) return {valid:false,reason:'stale_state'};
  return {valid:true,reason:'version_current'};
}
function validateLineItems(items){
  if(!Array.isArray(items)||items.length===0) return {valid:false,reason:'empty_items'};
  if(items.length>LIMITS.maxItems) return {valid:false,reason:'too_many_items'};
  const seen=new Set();
  for(const item of items){
    if(!item||!validId(item.item_id)||!validId(item.store_id)||!validMoney(item.quantity)||item.quantity<=0||!validMoney(item.unit_price)) return {valid:false,reason:'invalid_item'};
    const k=item.store_id+'|'+item.item_id;
    if(seen.has(k)) return {valid:false,reason:'duplicate_line_item'};
    seen.add(k);
  }
  return {valid:true,reason:'items_valid'};
}
module.exports={LIMITS,validId,validMoney,validateMoneyRecord,duplicateKey,isDuplicate,checkSubmission,validateOwnership,validateWorkflowFreshness,validateLineItems};
