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
