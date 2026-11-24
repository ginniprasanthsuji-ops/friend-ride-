'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const modules = [
  'qa/arjuna-x-runtime-lifecycle.cjs',
  'qa/arjuna-x-retry-policy.cjs',
  'qa/arjuna-x-recovery-policy.cjs',
  'qa/arjuna-x-diagnostics-context.cjs'
];

test('Phase 9 policy modules remain dependency-free and side-effect-free', () => {
  for (const relative of modules) {
    const source = fs.readFileSync(path.join(ROOT, relative), 'utf8');
    assert.doesNotMatch(source, /\\b(fetch|XMLHttpRequest|WebSocket)\\s*\\(/, relative + ' must not perform network calls');
    assert.doesNotMatch(source, /\\b(setTimeout|setInterval)\\s*\\(/, relative + ' must not schedule timers');
    assert.doesNotMatch(source, /\\b(console\\.(log|info|warn|error)|sendTelemetry|trackEvent)\\s*\\(/, relative + ' must not emit telemetry/log payloads');
    assert.doesNotMatch(source, /\\b(require|import)\\s*\\(?['"](?:https?:|node:https|axios|got|supabase|stripe|cashfree)/, relative + ' must not import external provider/network modules');
  }
});

test('Phase 9 test workflow includes the architecture safety audit', () => {
  const workflow = fs.readFileSync(path.join(ROOT, '.github/workflows/arjuna-x-qa-safety.yml'), 'utf8');
  assert.match(workflow, /phase-9-architecture-safety\.test\.cjs/);
});
