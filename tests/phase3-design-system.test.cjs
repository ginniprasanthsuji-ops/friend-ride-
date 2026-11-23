const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const design = fs.readFileSync(path.join(root, 'styles', 'friendride-phase3-design-system.css'), 'utf8');
const learning = fs.readFileSync(path.join(root, 'learn-teach.css'), 'utf8');

test('Phase 3 design system exposes Navy/Orange/White token contract', () => {
  for (const token of ['--fr-navy:', '--fr-orange:', '--fr-surface:', '--fr-ink:', '--fr-border:']) {
    assert.ok(design.includes(token), `missing design token: ${token}`);
  }
});

test('Phase 3 design system includes safe-area and reduced-motion safeguards', () => {
  assert.match(design, /env\(safe-area-inset-top\)/);
  assert.match(design, /env\(safe-area-inset-bottom\)/);
  assert.match(design, /prefers-reduced-motion\s*:\s*reduce/);
});

test('Learning module imports shared design system and keeps scoped accessibility styles', () => {
  assert.match(learning, /@import\s+url\(['"]\.\/styles\/friendride-phase3-design-system\.css['"]\)/);
  assert.match(learning, /\.lt-shell[^\n]*focus-visible|\.lt-shell a:focus-visible/);
  assert.match(learning, /forced-colors\s*:\s*active/);
  assert.match(learning, /prefers-reduced-motion\s*:\s*reduce/);
});

test('Phase 3 responsive and touch-target CSS contract remains present', () => {
  assert.match(design, /max-width\s*:\s*380px/);
  assert.match(design, /safe-area-inset-bottom/);
  assert.match(learning, /max-width\s*:\s*340px/);
  assert.match(learning, /min-height\s*:\s*44px/);
  assert.match(learning, /min-height\s*:\s*42px/);
});

test('Phase 3 palette and shared component selectors keep intended values', () => {
  assert.match(design, /--fr-navy\s*:\s*#071c46/i);
  assert.match(design, /--fr-orange\s*:\s*#ff6b00/i);
  assert.match(design, /--fr-surface\s*:\s*#ffffff/i);
  for (const selector of ['.topbar', '.hero', '.btn', '.bottom', '.card', ':focus-visible']) {
    assert.ok(design.includes(selector), `missing shared selector contract: ${selector}`);
  }
});
