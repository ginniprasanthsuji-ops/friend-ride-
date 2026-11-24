import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const packageJson = await readFile(new URL('../package.json', import.meta.url), 'utf8');
const testFile = await readFile(new URL('./phase-11-security-isolation-contract.test.mjs', import.meta.url), 'utf8');
const app = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const playwrightConfig = await readFile(new URL('../playwright.config.cjs', import.meta.url), 'utf8');
const preflight = await readFile(new URL('../scripts/qa-local-preflight.cjs', import.meta.url), 'utf8');
const workflow = await readFile(new URL('../.github/workflows/friend-ride-regression.yml', import.meta.url), 'utf8');
const registrationSpec = await readFile(new URL('./phase-11-registration-isolation.spec.js', import.meta.url), 'utf8');
const pageIsolationSpec = await readFile(new URL('./phase-11-page-isolation.spec.js', import.meta.url), 'utf8');
const localFixture = await readFile(new URL('./local-only-fixture.cjs', import.meta.url), 'utf8');

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


test('Phase 11 QA safety: Playwright discovery is limited to browser spec files', () => {
  assert.ok(playwrightConfig.includes("testMatch: ['**/*.spec.js', '**/*.spec.cjs', '**/*.spec.ts']"));
  assert.ok(!playwrightConfig.includes('**/*.test.mjs'));
});

test('Phase 11 QA safety: browser tests are restricted to localhost/loopback', () => {
  assert.ok(playwrightConfig.includes("new Set(['localhost', '127.0.0.1', '::1', '[::1]'])"));
  assert.ok(preflight.includes('only localhost/loopback URLs are allowed'));
  assert.ok(preflight.includes('FRIEND_RIDE_BASE_URL must be explicitly set'));
});

test('Phase 11 CI: workflow runs contracts and browser tests against local server', () => {
  assert.ok(workflow.includes('node --test qa/phase-11-security-isolation-contract.test.mjs'));
  assert.ok(workflow.includes('FRIEND_RIDE_BASE_URL: http://127.0.0.1:4173/'));
  assert.ok(workflow.includes('run: npm test'));
});


test('Phase 11 browser specs use the Tier-A local-only network fixture', () => {
  assert.ok(registrationSpec.includes("require('./local-only-fixture.cjs')"));
  assert.ok(pageIsolationSpec.includes("require('./local-only-fixture.cjs')"));
  assert.ok(localFixture.includes("requestUrl.origin === localOrigin"));
  assert.ok(localFixture.includes("route.abort('blockedbyclient')"));
});


test('Phase 11 QA safety: browser service workers are blocked to prevent bypassing request interception', () => {
  assert.ok(playwrightConfig.includes("serviceWorkers: 'block'"));
});


test('Phase 11 QA safety: preflight redirect handling does not follow external redirects', () => {
  assert.ok(preflight.includes("redirect: 'manual'"));
  assert.ok(preflight.includes("new Set(['localhost', '127.0.0.1', '::1', '[::1]'])"));
});


test('Phase 11 browser regression specs contain the intended 5 isolation scenarios', () => {
  assert.ok(registrationSpec.includes('Customer registration shows customer-only photo'));
  assert.ok(registrationSpec.includes('Driver registration exposes required driver document controls only'));
  assert.ok(registrationSpec.includes('Partner registration exposes partner controls'));
  assert.ok(registrationSpec.includes('Admin registration mode does not expose customer, driver, or partner registration fields'));
  assert.ok(pageIsolationSpec.includes('showPage leaves exactly one active page and marks other pages hidden/inert'));
});


test('Phase 11 CI: preflight is run through npm test only, not duplicated as a workflow step', () => {
  assert.ok(workflow.includes('run: npm test'));
  assert.ok(!workflow.includes('run: node scripts/qa-local-preflight.cjs'));
});


test('Phase 11 CI: regression reports upload even when the job fails', () => {
  assert.ok(workflow.includes('if: always()'));
  assert.ok(workflow.includes('playwright-report/'));
  assert.ok(workflow.includes('test-results/'));
  assert.ok(workflow.includes('if-no-files-found: ignore'));
});


test('Phase 11 CI: regression artifacts have bounded retention', () => {
  assert.ok(workflow.includes('retention-days: 7'));
});


test('Phase 11 browser coverage count is fixed at four registration plus one page-isolation scenario', () => {
  assert.equal((registrationSpec.match(/\btest\(/g) || []).length, 4);
  assert.equal((pageIsolationSpec.match(/\btest\(/g) || []).length, 1);
});


test('Phase 11 local-only fixture records and blocks every non-local origin', () => {
  assert.ok(localFixture.includes('const blockedOrigins = []'));
  assert.ok(localFixture.includes('blockedOrigins.push(requestUrl.origin)'));
  assert.ok(localFixture.includes("route.abort('blockedbyclient')"));
  assert.ok(localFixture.includes('page.__frBlockedOrigins = blockedOrigins'));
});


test('Phase 11 CI: workflow supports branch push, manual dispatch, and scheduled regression', () => {
  assert.ok(workflow.includes('arjuna-x/phase-7-ai-intelligence-safety'));
  assert.ok(workflow.includes('workflow_dispatch:'));
  assert.ok(workflow.includes('schedule:'));
  assert.ok(workflow.includes("cron: '17 2 * * *'"));
});


test('Phase 11 CI: regression job has bounded execution and pinned Node major', () => {
  assert.ok(workflow.includes('timeout-minutes: 15'));
  assert.ok(workflow.includes('node-version: 22'));
});


test('Phase 11 QA entry point requires local preflight before browser tests', () => {
  assert.ok(testFile.includes("const packageJson = await readFile(new URL('../package.json', import.meta.url), 'utf8')"));
  const scripts = JSON.parse(packageJson).scripts;
  assert.ok(scripts.test.startsWith('node scripts/qa-local-preflight.cjs && playwright test'));
});


test('Phase 11 preflight rejects hosted URLs and never follows redirects', () => {
  assert.ok(preflight.includes("const hosts = new Set(['localhost', '127.0.0.1', '::1', '[::1]'])"));
  assert.ok(preflight.includes("redirect: 'manual'"));
  assert.ok(preflight.includes('only localhost/loopback URLs are allowed'));
  assert.ok(preflight.includes('process.exit(2)'));
});
