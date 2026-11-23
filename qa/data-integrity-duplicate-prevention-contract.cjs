// Phase 8.13 — Data integrity & duplicate prevention QA contract (non-production).
'use strict';

const ID_FIELDS = ['ride_id', 'order_id', 'request_id', 'enrollment_id', 'payment_id'];
const OWNER_FIELDS = ['customer_id', 'user_id', 'student_id'];

function nonEmpty(value) { return typeof value === 'string' && value.trim().length > 0; }
function validId(value) { return nonEmpty(value); }
function validMoney(value) { return Number.isFinite(value) && value >= 0; }
function validTotal(total, itemsTotal, fees = 0, discount = 0) {
  if (![total, itemsTotal, fees, discount].every(validMoney)) return false;
  return Math.abs(total - (itemsTotal + fees - discount)) < 0.005;
}
function checkDuplicate(records, candidate, idField) {
  if (!Array.isArray(records) || !candidate || !nonEmpty(idField)) return { duplicate: false, reason: 'invalid_input' };
  if (!validId(candidate[idField])) return { duplicate: false, reason: 'missing_identifier' };
  const match = records.find(r => r && r[idField] === candidate[idField]);
  return match ? { duplicate: true, reason: 'duplicate_identifier', existing: match } : { duplicate: false, reason: null };
}
function checkIdempotency(keys, key) {
  if (!Array.isArray(keys) || !nonEmpty(key)) return { allowed: false, reason: 'invalid_idempotency_key' };
  return keys.includes(key) ? { allowed: false, reason: 'repeated_submission' } : { allowed: true, reason: null };
}
function checkOwnership(record, expectedOwnerId, ownerField = 'customer_id') {
  return !!record && nonEmpty(expectedOwnerId) && record[ownerField] === expectedOwnerId;
}
function checkStoreOrderMatch(order) {
  return !!order && nonEmpty(order.store_id) && nonEmpty(order.order_store_id) && order.store_id === order.order_store_id;
}
function checkWorkflowFreshness(currentState, expectedState) {
  if (!nonEmpty(currentState) || !nonEmpty(expectedState)) return { fresh: false, reason: 'missing_state' };
  return currentState === expectedState ? { fresh: true, reason: null } : { fresh: false, reason: 'stale_state' };
}
function checkCreatePayload(kind, payload) {
  if (!nonEmpty(kind) || !payload || typeof payload !== 'object') return { valid: false, reason: 'invalid_payload' };
  if (ID_FIELDS.some(f => payload[f] !== undefined && !validId(payload[f]))) return { valid: false, reason: 'invalid_identifier' };
  if (OWNER_FIELDS.some(f => payload[f] !== undefined && !validId(payload[f]))) return { valid: false, reason: 'invalid_owner' };
  if (payload.total !== undefined && !validMoney(payload.total)) return { valid: false, reason: 'invalid_total' };
  if (payload.total !== undefined && payload.items_total !== undefined && !validTotal(payload.total, payload.items_total, payload.fees || 0, payload.discount || 0)) return { valid: false, reason: 'total_mismatch' };
  if (kind === 'marketplace_order' && !checkStoreOrderMatch(payload)) return { valid: false, reason: 'store_order_mismatch' };
  return { valid: true, reason: null };
}
module.exports = { ID_FIELDS, validId, validMoney, validTotal, checkDuplicate, checkIdempotency, checkOwnership, checkStoreOrderMatch, checkWorkflowFreshness, checkCreatePayload };
