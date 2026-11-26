const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('QA Driver/Partner registration RPC validates role, ownership, and pending approvals', () => {
 const sql=fs.readFileSync(path.join(__dirname,'..','supabase','migrations','202611220010_arjuna_qa_registration_rpc.sql'),'utf8');
 assert.ok(sql.includes('function public.fr_register_driver_partner(p_role text,p_profile jsonb)'));
 assert.ok(sql.includes("p_role not in ('driver','partner')"));
 assert.ok(sql.includes("v_old_role<>'customer'"));
 assert.ok(sql.includes("provider_qr_path"));
 assert.ok(sql.includes("driver_approval_status=case when p_role='driver' then 'pending'"));
 assert.ok(sql.includes("partner_approval_status=case when p_role='partner' then 'pending'"));
 assert.ok(sql.includes("app.friend_ride_role_registration"));
 assert.ok(sql.includes('revoke all on function public.fr_register_driver_partner(text,jsonb) from public,anon'));
 assert.ok(sql.includes('grant execute on function public.fr_register_driver_partner(text,jsonb) to authenticated'));
});
