const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const design = fs.readFileSync(path.join(root, 'styles', 'friendride-phase3-design-system.css'), 'utf8');
const learning = fs.readFileSync(path.join(root, 'learn-teach.css'), 'utf8');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

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


test('Phase 3 shell is integrated behind an explicit root scope', () => {
  assert.match(index, /<body[^>]*class=["'][^"']*fr-phase3-shell/);
  assert.match(index, /href=["']\.\/styles\/friendride-phase3-design-system\.css["']/);
  assert.match(design, /\.fr-phase3-shell\{padding-bottom:calc\(82px/);
  assert.match(design, /\.fr-phase3-shell \*.*animation-duration/);
  assert.doesNotMatch(design, /\.fr-phase3-shell \.fr-phase3-shell/);
  for (const selector of ['.fr-phase3-shell .topbar', '.fr-phase3-shell .hero', '.fr-phase3-shell .btn', '.fr-phase3-shell .bottom', '.fr-phase3-shell main', '.fr-phase3-shell .card']) {
    assert.ok(design.includes(selector), `missing scoped shell selector: ${selector}`);
  }
});


test('Phase 3 shell-scoped supporting status and notice palette is present', () => {
  for (const selector of ['.fr-phase3-shell .notice', '.fr-phase3-shell .status', '.fr-phase3-shell .status.ok', '.fr-phase3-shell .tag', '.fr-phase3-shell .stock-mark.yes', '.fr-phase3-shell .stock-mark.no', '.fr-phase3-shell .fresh-mark', '.fr-phase3-shell a']) {
    assert.ok(design.includes(selector), `missing scoped supporting palette selector: ${selector}`);
  }
});


test('Phase 3 shell maps legacy theme tokens to the scoped palette', () => {
  for (const token of ['--purple:var(--fr-navy)', '--purple2:var(--fr-navy-2)', '--navy:var(--fr-navy)', '--bg:var(--fr-bg)', '--ink:var(--fr-ink)', '--muted:var(--fr-muted)', '--line:var(--fr-border)', '--orange:var(--fr-orange)']) {
    assert.ok(design.includes(token), `missing legacy token mapping: ${token}`);
  }
});


test('Phase 3 shell remaps audited hardcoded legacy purple components', () => {
  for (const selector of ['.fr-phase3-shell .drawer-head', '.fr-phase3-shell .market-category-row button.active', '.fr-phase3-shell .catalogue-category-pills button.active', '.fr-phase3-shell .market-price', '.fr-phase3-shell .fr-poster-ref', '.fr-phase3-shell .fr-premium-hero', '.fr-phase3-shell .fr-role-launcher']) {
    assert.ok(design.includes(selector), `missing audited palette override: ${selector}`);
  }
});


test('Phase 3 primary orange actions use navy foreground for contrast', () => {
  assert.match(design, /\.fr-phase3-shell \.btn, \.fr-phase3-shell \.top-action\{[^}]*color:var\(--fr-navy\)/);
  assert.match(design, /\.fr-phase3-shell \.home-banner\{[^}]*linear-gradient\(120deg,var\(--fr-navy\)/);
  assert.match(design, /\.fr-phase3-shell \.banner-cta\{[^}]*color:var\(--fr-navy\)/);
});


test('Phase 3 ride/map navigation accents are shell-scoped', () => {
  for (const selector of ['.fr-phase3-shell .pill', '.fr-phase3-shell .location-action', '.fr-phase3-shell .track-actions button', '.fr-phase3-shell #mapPlaceholder']) {
    assert.ok(design.includes(selector), `missing scoped ride/map accent: ${selector}`);
  }
});


test('Phase 3 role launcher uses scoped Navy/Orange/White palette', () => {
  for (const selector of ['.fr-phase3-shell .fr-role-card', '.fr-phase3-shell .fr-role-card b', '.fr-phase3-shell .fr-role-icon', '.fr-phase3-shell .fr-role-card.driver .fr-role-icon', '.fr-phase3-shell .fr-role-card.admin .fr-role-icon', '.fr-phase3-shell .fr-role-arrow']) {
    assert.ok(design.includes(selector), `missing role launcher palette selector: ${selector}`);
  }
});


test('Phase 3 component rules remain shell-scoped (root token block is the only global rule)', () => {
  const selectorLines = design.split(/\n/).map(line => line.trim()).filter(line => line.includes('{') && !line.startsWith('@') && !line.startsWith(':root') && !line.startsWith('/*') && !line.startsWith('*'));
  for (const selector of selectorLines) {
    assert.ok(selector.startsWith('.fr-phase3-shell'), `unexpected unscoped Phase 3 rule: ${selector}`);
  }
});
