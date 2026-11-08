import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync('index.html','utf8');
const blocks=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)].filter(([,attrs,body])=>! /\bsrc\s*=/.test(attrs)&&body.trim());
if(!blocks.length)throw new Error('No inline JavaScript blocks found.');
let failed=false;
for(let i=0;i<blocks.length;i++){try{new vm.Script(blocks[i][2],{filename:`index.html:inline-script-${i+1}`});console.log(`PASS inline script ${i+1}`);}catch(e){failed=true;console.error(`FAIL inline script ${i+1}: ${e.message}`);}}
const checks=[
 ['Customer photo bucket','customer-profile-photos'],
 ['Customer photo DB path','customer_profile_photo_path'],
 ['Assigned ride customer details','get_ride_customer_details_v2'],
 ['Completed ride QR details','get_ride_payment_details_v1'],
 ['Completed-only QR condition',"d.ride_status).toLowerCase()==='completed'"],
 ['OTP backend','Sms-otp'],
 ['Role-aware session restore','adminResult.data?.user_id===user.id'],
 ['Customer photo upload','frUploadPrivateRegistrationFile(customerPhoto'],
 ['Version 10.2 feedback hotfix marker','name="application-version" content="10.2-feedback-hotfix"'],
 ['Partner GPS save RPC','fr_partner_save_location'],
 ['Approved store geo RPC','fr_customer_list_approved_stores_geo'],
 ['Friend Mart map','friendMartMap'],
 ['Bank enquiry secure persistence','fr_bank_enquiries'],
 ['Admin bank enquiry review','frAdminLoadBankEnquiries']
];
for(const [label,token] of checks){if(html.includes(token))console.log('PASS '+label);else{failed=true;console.error('FAIL '+label);}}
if(failed)process.exit(1);
console.log(`Checked ${blocks.length} inline scripts.`);
