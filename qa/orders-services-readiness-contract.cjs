'use strict';

const ORDER_STATUSES = new Set(['pending', 'accepted', 'preparing', 'ready', 'picked_up', 'in_transit', 'delivered', 'cancelled']);
const SERVICE_STATUSES = new Set(['requested', 'quoted', 'accepted', 'in_progress', 'completed', 'cancelled']);
const ORDER_TRANSITIONS = {
  pending: ['accepted', 'cancelled'],
  accepted: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['picked_up', 'cancelled'],
  picked_up: ['in_transit', 'delivered'],
  in_transit: ['delivered'],
  delivered: [],
  cancelled: []
};
const SERVICE_TRANSITIONS = {
  requested: ['quoted', 'cancelled'],
  quoted: ['accepted', 'cancelled'],
  accepted: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: []
};

function checkStatusTransition(domain, from, to, options = {}) {
  const transitions = domain === 'order' ? ORDER_TRANSITIONS : domain === 'service' ? SERVICE_TRANSITIONS : null;
  const statuses = domain === 'order' ? ORDER_STATUSES : domain === 'service' ? SERVICE_STATUSES : null;
  if (!transitions || !statuses) return { allowed: false, reason: 'unsupported_domain' };
  if (!statuses.has(from) || !statuses.has(to)) return { allowed: false, reason: 'unknown_status' };
  if (from === to) return { allowed: false, reason: 'no_change' };
  if (!transitions[from].includes(to)) return { allowed: false, reason: 'invalid_transition' };
  if (to === 'cancelled' && options.explicitUiConfirmation !== true) {
    return { allowed: false, reason: 'cancellation_requires_explicit_ui_confirmation' };
  }
  return { allowed: true, reason: 'transition_allowed_for_ui_review', execution: 'not_performed' };
}

function validateOrderSummary(order) {
  if (!order || typeof order !== 'object') return { valid: false, reason: 'missing_order' };
  if (typeof order.orderId !== 'string' || !order.orderId.trim()) return { valid: false, reason: 'missing_order_id' };
  if (!ORDER_STATUSES.has(order.status)) return { valid: false, reason: 'invalid_status' };
  if (order.total == null || !Number.isFinite(Number(order.total)) || Number(order.total) < 0) return { valid: false, reason: 'invalid_total' };
  if (order.currency !== 'INR') return { valid: false, reason: 'unsupported_currency' };
  return { valid: true, reason: 'summary_valid_read_only' };
}

function validateServiceRequestSummary(service) {
  if (!service || typeof service !== 'object') return { valid: false, reason: 'missing_service' };
  if (typeof service.requestId !== 'string' || !service.requestId.trim()) return { valid: false, reason: 'missing_request_id' };
  if (!SERVICE_STATUSES.has(service.status)) return { valid: false, reason: 'invalid_status' };
  if (typeof service.category !== 'string' || !service.category.trim()) return { valid: false, reason: 'missing_category' };
  return { valid: true, reason: 'summary_valid_read_only' };
}

module.exports = { ORDER_STATUSES, SERVICE_STATUSES, checkStatusTransition, validateOrderSummary, validateServiceRequestSummary };
