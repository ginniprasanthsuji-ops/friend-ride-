const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('index.html', 'utf8');

test('Phase 12: shimmer placeholder is opt-in and defined', () => {
  assert.match(html, /\\.fr12-skeleton\\s*\\{[^}]*animation:\\s*fr12-shimmer/i);
  assert.match(html, /@keyframes\\s+fr12-shimmer\\s*\\{/i);
  assert.match(html, /\\.fr12-skeleton\\s*\\{[^}]*pointer-events:\\s*none/i);
});

test('Phase 12: reduced motion disables shimmer and entry motion', () => {
  assert.match(html, /@media\\s*\\(prefers-reduced-motion:\\s*reduce\\)[\\s\\S]{0,500}fr12-skeleton[\\s\\S]*animation:\\s*none\\s*!important/i);
  assert.match(html, /@media\\s*\\(prefers-reduced-motion:\\s*reduce\\)[\\s\\S]*?\\.page\\.active[\\s\\S]*?animation:\\s*none\\s*!important/i);
});

test('Phase 12: shimmer is applied only to selected loading placeholders', () => {
  assert.match(html, /Orders loading…[^<]*<\/div>/);
  assert.match(html, /fr12-skeleton[^>]*role="status"[^>]*aria-label="Loading partner orders"/);
  assert.match(html, /fr12-skeleton[^>]*aria-label="Loading store catalogue"/);
  assert.match(html, /fr12-skeleton[^>]*aria-label="Loading customer shop orders"/);
});

test('Phase 12: selected loading placeholders have empty and error replacements', () => {
  const partner = html.slice(html.indexOf('async function loadPartnerOrders'), html.indexOf('async function loadPartnerOrders') + 4000);
  const catalogue = html.slice(html.indexOf('async function renderCustomerCatalogue'), html.indexOf('async function renderCustomerCatalogue') + 3500);
  const orders = html.slice(html.indexOf('async function frLoadCustomerMarketOrders'), html.indexOf('async function frLoadCustomerMarketOrders') + 4000);
  assert.match(partner, /empty-state[\s\S]*catch\(e\)[\s\S]*Orders load కాలేదు/);
  assert.match(catalogue, /market-empty[\s\S]*catch\(e\)[\s\S]*Catalogue Load కాలేదు/);
  assert.match(orders, /empty-state[\s\S]*catch\(e\)[\s\S]*Shop Orders load కాలేదు/);
});

test('Phase 12: shimmer covers additional non-interactive loading surfaces', () => {
  assert.match(html, /frHomepageRatingsList[^\n]*fr12-skeleton/);
  assert.match(html, /frAdminSupportList[^\n]*fr12-skeleton/);
  assert.match(html, /Loading driver KYC documents/);
  assert.match(html, /Loading partner applications/);
  assert.match(html, /Loading approved stores/);
  assert.match(html, /Loading store payment details/);
});

test('Phase 12: card motion is opt-in to reduce global animation churn', () => {
  assert.match(html, /\.fr12-animate-card\s*\{\s*animation:\s*fr12-card-enter/i);
  assert.doesNotMatch(html, /(^|\n)\.card\s*\{\s*animation:\s*fr12-card-enter/i);
  assert.match(html, /prefers-reduced-motion:\s*reduce[\s\S]*?\.fr12-animate-card[\s\S]*?animation:\s*none/i);
});


test('Phase 12: customer platform charge is 2.5% capped at ₹25', () => {
  assert.match(html, /function frPlatformChargePaise\(orderAmountPaise\)[\s\S]*?Math\.min\(2500,Math\.round\(amount\*0\.025\)\)/);
  assert.match(html, /Platform Charge \(2\.5%, max ₹25\)/);
  assert.match(html, /frPlatformChargePreview/);
  assert.match(html, /Final platform charge is calculated after Partner price confirmation/);
});


test('Phase 12: platform charge math examples and cap are exact', () => {
  const vm = require('node:vm');
  const start = html.indexOf('function frPlatformChargePaise(');
  const end = html.indexOf('function renderMarketCart()', start);
  assert.ok(start >= 0 && end > start, 'platform fee helper should exist before cart renderer');
  const sandbox = {};
  vm.runInNewContext(html.slice(start, end), sandbox);
  const fee = sandbox.frPlatformChargePaise;
  assert.equal(fee(10000), 250); // ₹100 -> ₹2.50
  assert.equal(fee(50000), 1250); // ₹500 -> ₹12.50
  assert.equal(fee(100000), 2500); // ₹1,000 -> ₹25 cap
  assert.equal(fee(200000), 2500); // ₹2,000 -> cap
  assert.equal(fee(300000), 2500); // ₹3,000 -> cap
  assert.equal(fee(-10000), 0); // no negative subtotal
});


test('Phase 12: estimated payable includes subtotal and capped platform charge', () => {
  assert.match(html, /Estimated Payable \(Subtotal \+ Platform Charge\)/);
  assert.match(html, /frEstimatedPayable/);
  assert.match(html, /frCartSubtotal\+frPlatformChargeRupees\(frCartSubtotal\)/);
  assert.match(html, /frEstimatedPayable[^\n]*₹0\.00/);
});


test('Phase 12: quote acceptance displays subtotal and capped platform fee preview before accept', () => {
  assert.match(html, /async function frCustomerAcceptQuote[\s\S]*?Platform charge preview \(2\.5%, capped at ₹25\)/);
  assert.match(html, /actual payment collection is not yet integrated/);
  assert.match(html, /if\(!confirm\('Accept Partner quote\?/);
});
