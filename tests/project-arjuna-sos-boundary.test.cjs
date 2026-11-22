const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Project Arjuna SOS insert boundary only permits sender own SOS and ride participants', () => {
 const sql=fs.readFileSync(path.join(__dirname,'..','supabase','migrations','202611220017_arjuna_qa_sos_boundary.sql'),'utf8');
 assert.match(sql,/sender_id = auth\.uid\(\)/i);
 assert.match(sql,/r\\.customer_id\\s*=\\s*auth\\.uid\\(\\)\\s+or\\s+r\\.driver_id\\s*=\\s*auth\\.uid\\(\\)/i);
 assert.match(sql,/latitude between -90 and 90/i);
 assert.match(sql,/longitude between -180 and 180/i);
 assert.match(sql,/length\(message\) <= 1000/i);
 assert.match(sql,/drop policy if exists qa_sos_insert_own/i);
});
