const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const styleStart = html.indexOf('<style');
const contentStart = html.indexOf('>', styleStart) + 1;
const styleEnd = html.indexOf('</style>', contentStart);
const css = html.slice(contentStart, styleEnd);

const has = (fragment) => assert.ok(css.includes(fragment), 'missing CSS contract: ' + fragment);

test('Phase 12 motion layer provides page/card/modal entry transitions', () => {
  has('fr12-page-enter');
  has('fr12-card-enter');
  assert.ok(/\.page\.active\s+\.card\{animation:fr12-card-enter/.test(css), 'card motion must be scoped to active page');
  has('fr12-modal-enter');
  has('fr12-drawer-enter');
  has('fr12-backdrop-fade');
  has('.page.active{animation:fr12-page-enter');
  has('.page.active .card{animation:fr12-card-enter');
  has('.modal.show .modalbox{animation:fr12-modal-enter');
});

test('Phase 12 motion layer provides touch feedback', () => {
  has('button:active');
  has('.btn:active');
  has('transform:scale(.975)');
  has('.bottom .active span{transition:background-color 160ms ease,transform 160ms ease}');
  has('.bottom .active span{transform:translateY(-1px)}');
  assert.ok(/\.bottom\s+\.active\s+span\{transform:translateY\(-1px\)\}/.test(css), 'active-span motion must be scoped to bottom navigation');
});

test('Phase 12 shimmer is CSS-only and reduced-motion disables motion', () => {
  has('fr12-skeleton');
  has('fr12-shimmer');
  has('prefers-reduced-motion:reduce');
  has('animation:none!important');
  has('transition:none!important');
  has('.drawer-backdrop.show,.drawer-backdrop.show .drawer{animation:none!important}');
});


test('Phase 12 motion uses short compositor-friendly opacity/transform transitions', () => {
  has('translate3d');
  has('opacity');
  has('180ms');
  has('220ms');
  assert.ok(!css.includes('fr12-page-enter 600ms'), 'page entry motion must remain short');
  assert.ok(!css.includes('fr12-card-enter 600ms'), 'card entry motion must remain short');
});

test('Phase 12 reduced-motion override covers drawer, button feedback, and skeleton shimmer', () => {
  has('.drawer-backdrop.show,.drawer-backdrop.show .drawer{animation:none!important}');
  has('button:active,.btn:active,[role="button"]:active,.bottom .active span{transform:none!important}');
  has('.page.active,.card,.modal.show .modalbox,.fr12-skeleton{animation:none!important}');
});
