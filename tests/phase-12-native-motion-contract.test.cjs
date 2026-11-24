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
  has('fr12-modal-enter');
  has('.page.active{animation:fr12-page-enter');
  has('.modal.show .modalbox{animation:fr12-modal-enter');
});

test('Phase 12 motion layer provides touch feedback', () => {
  has('button:active');
  has('.btn:active');
  has('transform:scale(.975)');
});

test('Phase 12 shimmer is CSS-only and reduced-motion disables motion', () => {
  has('fr12-skeleton');
  has('fr12-shimmer');
  has('prefers-reduced-motion:reduce');
  has('animation:none!important');
  has('transition:none!important');
});
