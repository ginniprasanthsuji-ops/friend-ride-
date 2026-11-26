const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('QA Home Services tables and RPCs enforce approved-provider and customer/admin role checks',()=>{
 const sql=fs.readFileSync(path.join(__dirname,'..','supabase','migrations','202611220011_arjuna_qa_home_services.sql'),'utf8');
 for(const t of ['fr_service_categories','fr_service_providers','fr_service_requests']) assert.ok(sql.includes('create table if not exists public.'+t));
 for(const fn of ['fr_customer_list_approved_service_providers','fr_customer_create_service_request','fr_admin_assign_service_provider','fr_service_provider_update_request']) assert.ok(sql.includes('function public.'+fn));
 assert.ok(sql.includes("p.role='customer'"));
 assert.ok(sql.includes("approval_status='approved'"));
 assert.ok(sql.includes('exists(select 1 from public.admin_users'));
 assert.ok(sql.includes('provider_id=auth.uid()')||sql.includes('sp.owner_id=auth.uid()'));
 assert.ok(!/grant .* to anon/i.test(sql));
});
