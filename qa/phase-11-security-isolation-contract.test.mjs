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

test('Phase 11 registration: role-specific fields are controlled and disabled when hidden', () => {
  assert.ok(app.includes("frSetRegistrationGroup('driverRegDocs',registering&&role==='driver')"));
  assert.ok(app.includes("frSetRegistrationGroup('partnerRegFields',registering&&role==='partner')"));
  assert.ok(app.includes("frSetRegistrationGroup('customerRegPhotoFields',registering&&role==='customer')"));
  assert.ok(app.includes("el.querySelectorAll('input,select,textarea,button').forEach(control=>{control.disabled=!visible;})"));
});

test('Phase 11 registration: common and role-specific fields are not exposed across roles', () => {
  assert.ok(app.includes("frSetRegistrationGroup('regAvatarFields',registering&&['customer','driver','partner'].includes(role))"));
  assert.ok(app.includes("frSetRegistrationGroup('driverExtraFields',registering&&role==='driver')"));
  assert.ok(app.includes("frSetRegistrationGroup('partnerExtraFields',registering&&role==='partner')"));
});

test('Phase 11 page isolation: active page is exclusive and hidden pages are inert', () => {
  assert.ok(app.includes("page.classList.toggle('active',isActive)"));
  assert.ok(app.includes("page.setAttribute('aria-hidden',isActive?'false':'true')"));
  assert.ok(app.includes("page.inert=!isActive"));
  assert.ok(app.includes("observer.observe(document.querySelector('main')||document.body"));
});
