const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const source = readFileSync(join(__dirname, '..', 'index.html'), 'utf8');

test('core showPage returns denial before activating any protected route', () => {
  const start = source.indexOf('function showPage(id){');
  const end = source.indexOf('\n}', start);
  assert.ok(start >= 0 && end > start, 'core showPage exists');
  const body = source.slice(start, end);
  for (const guard of [
    'dashboardRole&&(!currentUser||role!==dashboardRole)',
    "id==='frDriverSubscription'&&(!currentUser||role!=='driver')",
    "isAdminRoute&&(!currentUser||role!=='admin')",
    "isPartnerRoute&&(!currentUser||(role!=='partner'&&role!=='admin'))",
    "isPartnerAdminShared&&(!currentUser||(role!=='partner'&&role!=='admin'))",
  ]) assert.ok(body.includes(guard), 'guard present: '+guard);
  assert.ok(body.indexOf('return false;') < body.indexOf("document.querySelectorAll('.page')"),
    'denials happen before page activation');
  assert.ok(body.indexOf('return true;') > body.indexOf('frRefreshDiagnosticsVisibility'),
    'success is returned only after route side effects');
});

test('showPage wrappers preserve a denied route result and do not force the page active', () => {
  assert.match(source, /const result=frOriginalShowPage\(id\);if\(result===false\)return false;/);
  assert.match(source, /showMessage\('Partner Approval[^']*'\);\s*return false;/);
  assert.match(source, /if\(out!==false\)\{document\.querySelectorAll\('main \.page'\)/);
  assert.match(source, /if\(result!==false\)isolatePage\(id\);/);
});
