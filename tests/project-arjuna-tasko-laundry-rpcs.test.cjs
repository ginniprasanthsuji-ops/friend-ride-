const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('QA TASKO and Laundry transition RPCs enforce assigned-provider and ordered states', () => {
 const sql=fs.readFileSync(path.join(__dirname,'..','supabase','migrations','202611220009_arjuna_qa_tasko_laundry_transitions.sql'),'utf8');
 for(const fn of ['fr_laundry_provider_transition','fr_tasko_provider_transition']) assert.ok(sql.includes('function public.'+fn));
 assert.match(sql,/assigned_provider_id=auth\.uid\(\)/i);
 assert.match(sql,/status='assigned'/i);
 assert.match(sql,/status='accepted'/i);
 assert.match(sql,/status='in_progress'/i);
 assert.match(sql,/p_actual_hours<=6/i);
 assert.match(sql,/400\+\(\(p_actual_hours-6\)\*50\)/i);
 assert.match(sql,/revoke all on function .* from public,anon/i);
 assert.match(sql,/grant execute on function .* to authenticated/i);
});
