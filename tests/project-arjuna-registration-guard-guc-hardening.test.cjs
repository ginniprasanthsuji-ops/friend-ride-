const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Project Arjuna registration guard cannot be bypassed with user-settable GUC', () => {
 const sql = fs.readFileSync(path.join(__dirname,'..','supabase','migrations','202611220018_arjuna_registration_guard_guc_hardening.sql'),'utf8');
 assert.match(sql,/qa_role_registration_authorizations/);
 assert.match(sql,/transaction_id=pg_catalog\.txid_current\(\)/i);
 assert.match(sql,/revoke all on table public\.qa_role_registration_authorizations from public,anon,authenticated/i);
 assert.match(sql,/insert into public\.qa_role_registration_authorizations\(user_id,transaction_id\)/i);
 assert.match(sql,/delete from public\.qa_role_registration_authorizations where user_id=v_uid/i);
 assert.doesNotMatch(sql,/current_setting\('app\.friend_ride_role_registration'/i);
});
