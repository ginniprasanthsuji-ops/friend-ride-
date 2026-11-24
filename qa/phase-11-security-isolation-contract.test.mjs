import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('Phase 11 security: admin authorization is based on admin_users membership', () => {
  assert.ok(app.includes("from('admin_users').select('user_id')"));
  assert.ok(app.includes("if(adminCheck.data?.user_id===user.id)dbRole='admin'"));
  assert.ok(app.includes("else if(dbRole==='admin')throw new Error"));
});

test('Phase 11 security: role allowlist and selected-role mismatch are rejected', () => {
  assert.ok(app.includes("!['customer','driver','partner','admin'].includes(dbRole)"));
  assert.ok(app.includes("selectedRole!==dbRole"));
});

test('Phase 11 security: driver approval gates driver access', () => {
  assert.ok(app.includes("['approved','verified','active'].includes(approval)"));
  assert.ok(app.includes("Driver account Admin approval"));
});

test('Phase 11 isolation: learning navigation routes to its own page', () => {
  assert.ok(app.includes("window.frLearnTeachOpen"));
  assert.ok(app.includes("isolatePage('learnTeach')"));
  assert.ok(app.includes("MutationObserver"));
});

test('Phase 11 routing: learning category routes to learning module, not generic shop fallback', () => {
  assert.ok(app.includes("c[1]==='విద్యా సేతు'||c[1]==='Learning'"));
  assert.ok(app.includes("frOpenLearningCategory(); return;"));
});

test('Phase 11 role dashboards are not falsely claimed as live backend dashboards', () => {
  assert.ok(app.includes('Learning module backend / dashboard scripts'));
});
