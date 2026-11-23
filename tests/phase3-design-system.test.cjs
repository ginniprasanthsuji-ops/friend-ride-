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
