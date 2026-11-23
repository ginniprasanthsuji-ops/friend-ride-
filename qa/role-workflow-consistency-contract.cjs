// Phase 8.11 — Role-based workflow consistency contract (read-only QA guard)
'use strict';

const ROLES = Object.freeze(['customer', 'driver', 'partner', 'admin']);

const ACTIONS = Object.freeze({
  ride: ['request', 'view_own', 'accept_assigned', 'update_assigned_status', 'admin_review'],
  marketplace: ['browse', 'checkout', 'manage_own_store', 'manage_own_catalog', 'admin_review'],
  orders: ['view_own', 'update_assigned', 'cancel_own', 'admin_review'],
  services: ['request', 'view_own', 'fulfil_assigned', 'admin_review'],
  tasko_laundry: ['request', 'view_own', 'fulfil_assigned', 'manage_provider_service', 'admin_review'],
  education: ['browse', 'enroll_own', 'manage_own_class', 'admin_review'],
  admin: ['dashboard_view', 'support_review', 'system_config_review']
});

const MATRIX = Object.freeze({
  customer: Object.freeze({
    ride: ['request', 'view_own'],
    marketplace: ['browse', 'checkout'],
    orders: ['view_own', 'cancel_own'],
    services: ['request', 'view_own'],
    tasko_laundry: ['request', 'view_own'],
    education: ['browse', 'enroll_own']
  }),
  driver: Object.freeze({
    ride: ['view_own', 'accept_assigned', 'update_assigned_status'],
    orders: ['view_own', 'update_assigned'],
    services: ['view_own', 'fulfil_assigned'],
    tasko_laundry: ['view_own', 'fulfil_assigned']
  }),
  partner: Object.freeze({
    marketplace: ['browse', 'manage_own_store', 'manage_own_catalog'],
    orders: ['view_own', 'update_assigned'],
    services: ['view_own', 'fulfil_assigned'],
    tasko_laundry: ['view_own', 'fulfil_assigned', 'manage_provider_service'],
    education: ['browse', 'manage_own_class']
  }),
  admin: Object.freeze({
    ride: ['admin_review'],
    marketplace: ['admin_review'],
    orders: ['admin_review'],
    services: ['admin_review'],
    tasko_laundry: ['admin_review'],
    education: ['admin_review'],
    admin: ['dashboard_view', 'support_review', 'system_config_review']
  })
});

function normalizeRole(role) {
  return typeof role === 'string' ? role.trim().toLowerCase() : '';
}

function isAllowed(role, moduleName, action) {
  const r = normalizeRole(role);
  if (!ROLES.includes(r) || !Object.hasOwn(MATRIX, r)) return false;
  const moduleActions = MATRIX[r][moduleName];
  return Array.isArray(moduleActions) && moduleActions.includes(action);
}

function checkRequest(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { allowed: false, reason: 'invalid_request' };
  }
  const role = normalizeRole(input.role);
  if (!ROLES.includes(role)) return { allowed: false, reason: 'unknown_role' };
  if (!Object.hasOwn(ACTIONS, input.module)) return { allowed: false, reason: 'unknown_module' };
  if (!ACTIONS[input.module].includes(input.action)) return { allowed: false, reason: 'unknown_action' };
  if (!isAllowed(role, input.module, input.action)) return { allowed: false, reason: 'role_action_denied' };
  if (input.action === 'checkout' && input.module === 'marketplace' && input.confirmed !== true) {
    return { allowed: false, reason: 'confirmation_required' };
  }
  if (input.action === 'request' && ['ride', 'services', 'tasko_laundry'].includes(input.module) && input.confirmed !== true) {
    return { allowed: false, reason: 'confirmation_required' };
  }
  if (input.action === 'cancel_own' && input.confirmed !== true) {
    return { allowed: false, reason: 'confirmation_required' };
  }
  return { allowed: true, reason: 'contract_allowlisted', execution: 'none' };
}

module.exports = { ROLES, ACTIONS, MATRIX, normalizeRole, isAllowed, checkRequest };
