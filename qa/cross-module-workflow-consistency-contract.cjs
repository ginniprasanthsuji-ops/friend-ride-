// Phase 8.12 — Cross-module workflow consistency contract (read-only QA)
'use strict';

const MODULES = Object.freeze(['ride', 'marketplace', 'orders', 'services', 'tasko_laundry', 'education']);
const STATUS = Object.freeze({
  ride: ['draft', 'review', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled'],
  marketplace: ['cart', 'review', 'confirmed', 'processing', 'completed', 'cancelled'],
  orders: ['created', 'confirmed', 'processing', 'assigned', 'completed', 'cancelled'],
  services: ['requested', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled'],
  tasko_laundry: ['requested', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled'],
  education: ['browse', 'enrollment_review', 'enrolled', 'active', 'completed', 'cancelled']
});
const TRANSITIONS = Object.freeze({
  ride: { draft:['review','cancelled'], review:['confirmed','cancelled'], confirmed:['assigned','cancelled'], assigned:['in_progress','cancelled'], in_progress:['completed','cancelled'] },
  marketplace: { cart:['review','cancelled'], review:['confirmed','cancelled'], confirmed:['processing','cancelled'], processing:['completed','cancelled'] },
  orders: { created:['confirmed','cancelled'], confirmed:['processing','assigned','cancelled'], processing:['assigned','completed','cancelled'], assigned:['completed','cancelled'] },
  services: { requested:['confirmed','cancelled'], confirmed:['assigned','cancelled'], assigned:['in_progress','cancelled'], in_progress:['completed','cancelled'] },
  tasko_laundry: { requested:['confirmed','cancelled'], confirmed:['assigned','cancelled'], assigned:['in_progress','cancelled'], in_progress:['completed','cancelled'] },
  education: { browse:['enrollment_review'], enrollment_review:['enrolled','cancelled'], enrolled:['active','cancelled'], active:['completed','cancelled'] }
});
const REQUIRED_LINKS = Object.freeze({
  marketplace_order: ['store_id', 'customer_id', 'order_id'],
  ride: ['ride_id', 'customer_id', 'pickup_confirmed', 'drop_confirmed'],
  service: ['request_id', 'customer_id', 'category'],
  tasko_laundry: ['request_id', 'customer_id', 'service_type'],
  education: ['enrollment_id', 'student_id', 'course_id']
});

function validModule(moduleName) { return MODULES.includes(moduleName); }
function validStatus(moduleName, status) {
  return validModule(moduleName) && STATUS[moduleName].includes(status);
}
function canTransition(moduleName, from, to) {
  if (!validModule(moduleName) || !validStatus(moduleName, from) || !validStatus(moduleName, to)) return false;
  return Array.isArray(TRANSITIONS[moduleName][from]) && TRANSITIONS[moduleName][from].includes(to);
}
function checkOwnership(record, actorId, ownerField='customer_id') {
  if (!record || typeof record !== 'object' || !actorId || typeof actorId !== 'string') return false;
  return typeof record[ownerField] === 'string' && record[ownerField] === actorId;
}
function checkCrossModuleRecord(kind, record) {
  const required = REQUIRED_LINKS[kind];
  if (!required || !record || typeof record !== 'object') return {valid:false, reason:'invalid_kind_or_record'};
  for (const field of required) {
    if (!(field in record) || record[field] === null || record[field] === '') return {valid:false, reason:'missing_required_link', field};
  }
  if (kind === 'ride' && (record.pickup_confirmed !== true || record.drop_confirmed !== true)) return {valid:false, reason:'locations_not_confirmed'};
  if (kind === 'ride' && record.pickup_id && record.drop_id && record.pickup_id === record.drop_id) return {valid:false, reason:'pickup_drop_same'};
  if (kind === 'marketplace_order' && record.store_id !== record.order_store_id) return {valid:false, reason:'store_order_mismatch'};
  return {valid:true, reason:'contract_valid', execution:'none'};
}
function checkWorkflowConsistency(input) {
  if (!input || typeof input !== 'object') return {consistent:false, reason:'invalid_input'};
  const {moduleName, currentStatus, nextStatus, role, action, confirmed} = input;
  if (!validModule(moduleName)) return {consistent:false, reason:'unknown_module'};
  if (!validStatus(moduleName, currentStatus) || !validStatus(moduleName, nextStatus)) return {consistent:false, reason:'invalid_status'};
  if (!canTransition(moduleName, currentStatus, nextStatus)) return {consistent:false, reason:'transition_not_allowed'};
  if (['confirmed','completed','cancelled'].includes(nextStatus) && confirmed !== true) return {consistent:false, reason:'confirmation_required'};
  if (role && action && input.roleContractAllowed !== true) return {consistent:false, reason:'role_contract_not_confirmed'};
  return {consistent:true, reason:'contract_consistent', execution:'none'};
}
module.exports = { MODULES, STATUS, TRANSITIONS, REQUIRED_LINKS, validModule, validStatus, canTransition, checkOwnership, checkCrossModuleRecord, checkWorkflowConsistency };
