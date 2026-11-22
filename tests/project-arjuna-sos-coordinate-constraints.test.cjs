const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Project Arjuna SOS coordinates have DB-level bounds and must be paired', () => {
  const migration = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'migrations', '202611220006_arjuna_qa_sos_coordinate_constraints.sql'), 'utf8');
  assert.match(migration, /latitude\s*>=\s*-90\s+and\s+latitude\s*<=\s*90/i);
  assert.match(migration, /longitude\s*>=\s*-180\s+and\s+longitude\s*<=\s*180/i);
  assert.match(migration, /latitude is null and longitude is null/i);
  assert.match(migration, /latitude is not null and longitude is not null/i);
  assert.match(migration, /QA-only/i);
  assert.match(migration, /not applied to production/i);
});
