const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('QA public feedback RPC only returns published homepage feedback; store geo is authenticated',()=>{
 const sql=fs.readFileSync(path.join(__dirname,'..','supabase','migrations','202611220012_arjuna_qa_public_feedback_store_geo.sql'),'utf8');
 assert.ok(sql.includes("f.kind='feedback' and f.show_on_homepage=true and f.status='published'"));
 assert.ok(sql.includes('limit 20'));
 assert.ok(sql.includes('grant execute on function public.fr_public_homepage_feedback() to anon,authenticated'));
 assert.ok(sql.includes('grant execute on function public.fr_customer_list_approved_stores_geo(text) to authenticated'));
 assert.ok(sql.includes("p.partner_approval_status,'pending'))='approved'"));
 assert.ok(!/grant execute on function public.fr_customer_list_approved_stores_geo\(text\) to anon/i.test(sql));
});
