'use strict';

const STORE_CATEGORIES = new Set([
  'chicken_shop', 'electrical', 'hardware', 'home_appliances', 'medical_store',
  'grocery', 'fashion', 'food', 'general_store'
]);
const PARTNER_ROLES = new Set(['partner', 'store_partner']);
const CHECKOUT_STATES = new Set(['cart', 'review', 'confirmed', 'cancelled']);

function validateStoreProfile(store) {
  if (!store || typeof store !== 'object') return { valid: false, reason: 'missing_store' };
  if (typeof store.storeId !== 'string' || !store.storeId.trim()) return { valid: false, reason: 'missing_store_id' };
  if (typeof store.name !== 'string' || !store.name.trim()) return { valid: false, reason: 'missing_store_name' };
  if (!STORE_CATEGORIES.has(store.category)) return { valid: false, reason: 'unsupported_store_category' };
  if (store.ownerRole && !PARTNER_ROLES.has(store.ownerRole)) return { valid: false, reason: 'invalid_partner_role' };
  return { valid: true, reason: 'store_profile_valid_read_only' };
}

function validateCatalogItem(item) {
  if (!item || typeof item !== 'object') return { valid: false, reason: 'missing_catalog_item' };
  if (typeof item.itemId !== 'string' || !item.itemId.trim()) return { valid: false, reason: 'missing_item_id' };
  if (typeof item.storeId !== 'string' || !item.storeId.trim()) return { valid: false, reason: 'missing_store_id' };
  if (typeof item.name !== 'string' || !item.name.trim()) return { valid: false, reason: 'missing_item_name' };
  if (item.price == null || !Number.isFinite(Number(item.price)) || Number(item.price) < 0) return { valid: false, reason: 'invalid_price' };
  if (item.currency !== 'INR') return { valid: false, reason: 'unsupported_currency' };
  return { valid: true, reason: 'catalog_item_valid_read_only' };
}

function validateCheckoutReview(checkout) {
  if (!checkout || typeof checkout !== 'object') return { valid: false, reason: 'missing_checkout' };
  if (!CHECKOUT_STATES.has(checkout.state)) return { valid: false, reason: 'invalid_checkout_state' };
  if (!Array.isArray(checkout.items) || checkout.items.length === 0) return { valid: false, reason: 'empty_cart' };
  if (checkout.items.some(item => !validateCatalogItem(item).valid)) return { valid: false, reason: 'invalid_cart_item' };
  if (checkout.state !== 'review') return { valid: false, reason: 'checkout_not_in_review' };
  if (checkout.explicitUiConfirmation !== true) return { valid: false, reason: 'explicit_confirmation_required' };
  return { valid: true, reason: 'checkout_review_ready_only', execution: 'not_performed' };
}

function checkStoreOrderOwnership(order, expectedStoreId) {
  if (!order || typeof order !== 'object') return { valid: false, reason: 'missing_order' };
  if (typeof expectedStoreId !== 'string' || !expectedStoreId.trim()) return { valid: false, reason: 'missing_expected_store_id' };
  if (order.storeId !== expectedStoreId) return { valid: false, reason: 'store_ownership_mismatch' };
  return { valid: true, reason: 'ownership_matches_read_only' };
}

module.exports = { STORE_CATEGORIES, validateStoreProfile, validateCatalogItem, validateCheckoutReview, checkStoreOrderOwnership };
