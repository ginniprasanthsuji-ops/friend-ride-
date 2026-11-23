'use strict';

const assert = require('node:assert/strict');
const { validateStoreProfile, validateCatalogItem, validateCheckoutReview, checkStoreOrderOwnership } = require('../qa/store-marketplace-readiness-contract.cjs');

assert.equal(validateStoreProfile({storeId:'ST1',name:'Test Store',category:'chicken_shop',ownerRole:'partner'}).valid, true);
assert.equal(validateStoreProfile({storeId:'ST2',name:'Electrical Shop',category:'electrical'}).valid, true);
assert.equal(validateStoreProfile({storeId:'ST3',name:'Invalid',category:'unknown'}).reason, 'unsupported_store_category');
assert.equal(validateStoreProfile({storeId:'',name:'Store',category:'grocery'}).reason, 'missing_store_id');
assert.equal(validateStoreProfile({storeId:'ST4',name:'Store',category:'grocery',ownerRole:'customer'}).reason, 'invalid_partner_role');

assert.equal(validateCatalogItem({itemId:'I1',storeId:'ST1',name:'Item',price:0,currency:'INR'}).valid, true);
assert.equal(validateCatalogItem({itemId:'I2',storeId:'ST1',name:'Item',price:-5,currency:'INR'}).reason, 'invalid_price');
assert.equal(validateCatalogItem({itemId:'I3',storeId:'ST1',name:'Item',price:100,currency:'USD'}).reason, 'unsupported_currency');
assert.equal(validateCatalogItem({itemId:'I4',storeId:'',name:'Item',price:10,currency:'INR'}).reason, 'missing_store_id');

const validItem={itemId:'I1',storeId:'ST1',name:'Item',price:10,currency:'INR'};
assert.equal(validateCheckoutReview({state:'review',items:[validItem],explicitUiConfirmation:true}).valid, true);
assert.equal(validateCheckoutReview({state:'review',items:[validItem],explicitUiConfirmation:false}).reason, 'explicit_confirmation_required');
assert.equal(validateCheckoutReview({state:'cart',items:[validItem],explicitUiConfirmation:true}).reason, 'checkout_not_in_review');
assert.equal(validateCheckoutReview({state:'review',items:[],explicitUiConfirmation:true}).reason, 'empty_cart');
assert.equal(validateCheckoutReview({state:'review',items:[{...validItem,price:-1}],explicitUiConfirmation:true}).reason, 'invalid_cart_item');

assert.equal(checkStoreOrderOwnership({storeId:'ST1'},'ST1').valid, true);
assert.equal(checkStoreOrderOwnership({storeId:'ST2'},'ST1').reason, 'store_ownership_mismatch');
assert.equal(checkStoreOrderOwnership({storeId:'ST1'},'').reason, 'missing_expected_store_id');

console.log('Store/Marketplace readiness contract assertions defined; not executed in this environment.');
