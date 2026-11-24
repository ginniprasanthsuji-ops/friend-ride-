const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const css = (html.match(/<style[^>]*>([\\s\\S]*?)<\\/style>/i) || [])[1] || '';

test('Phase 12 motion layer provides lightweight page/card/modal entry transitions', () => {
  assert.match(css, /fr12-page-enter/);
  assert.match(css, /fr12-card-enter/);
  assert.match(css, /fr12-modal-enter/);
  assert.match(css, /\\.page\\.active\\s*\\{[^}]*animation:/);
  assert.match(css, /\\.modal\\.show\\s+\\.modalbox\\s*\\{[^}]*animation:/);
});

test('Phase 12 motion layer provides touch feedback without requiring JS dependencies', () => {
  assert.match(css, /button:active/);
  assert.match(css, /\\.btn:active/);
  assert.match(css, /transform:\s*scale\\(\\.975\\)/);
});

test('Phase 12 loading shimmer is CSS-only and reduced-motion disables animation', () => {
  assert.match(css, /fr12-skeleton/);
  assert.match(css, /fr12-shimmer/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /animation:\s*none!important/);
  assert.match(css, /transition:\s*none!important/);
});
