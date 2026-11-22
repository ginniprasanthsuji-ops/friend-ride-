const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('QA admin KYC and partner review RPCs require admin membership and authenticated grants', () => {
 const sql=fs.readFileSync(path.join(__dirname,'..','supabase','migrations','202611220008_arjuna_qa_admin_kyc_rpcs.sql'),'utf8');
 for(const fn of ['admin_list_driver_applications','admin_list_driver_documents','admin_review_driver','admin_review_driver_document','fr_admin_list_partner_applications','fr_admin_review_partner']) assert.ok(sql.includes('function public.'+fn));
 assert.match(sql,/exists\(select 1 from public\.admin_users/i);
 assert.match(sql,/revoke all on function .* from public,anon/i);
 assert.match(sql,/grant execute on function .* to authenticated/i);
 assert.match(sql,/p_decision not in \('approved','rejected','revoked'\)/i);
 assert.match(sql,/p_decision not in \('verified','rejected'\)/i);
});
