import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync('index.html','utf8');
const blocks=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)].filter(([,attrs,body])=>! /\bsrc\s*=/.test(attrs)&&body.trim());
if(!blocks.length)throw new Error('No inline JavaScript blocks found.');
let failed=false;
for(let i=0;i<blocks.length;i++){try{new vm.Script(blocks[i][2],{filename:`index.html:inline-script-${i+1}`});console.log(`PASS inline script ${i+1}`);}catch(e){failed=true;console.error(`FAIL inline script ${i+1}: ${e.message}`);console.error(e.stack);}}
const checks=[
 ['3D default avatar generator export','window.frCustomerAvatarData=frCustomerAvatarData'],
 ['Customer photo bucket','customer-profile-photos'],
 ['Customer photo DB path','customer_profile_photo_path'],
 ['Assigned ride customer details','get_ride_customer_details_v2'],
 ['Completed ride QR details','get_ride_payment_details_v1'],
 ['Completed-only QR condition',"if(status!=='completed')"],
 ['OTP backend','Sms-otp'],
 ['Role-aware session restore','adminRow?.user_id===authUser.id'],
 ['Customer photo upload','frUploadPrivateRegistrationFile(customerPhoto'],
 ['Current application version marker','name="application-version" content="11.1-PRO-category-routing-learning-isolation"'],
 ['Partner GPS save RPC','fr_partner_save_location'],
 ['Approved store geo RPC','fr_customer_list_approved_stores_geo'],
 ['Friend Mart map','friendMartMap'],
 ['Bank enquiry secure persistence','fr_bank_enquiries'],
 ['Admin bank enquiry review','frAdminLoadBankEnquiries'],
 ['Profile photo signed URL loader','frLoadProfilePhoto'],
 ['Assigned driver vehicle/contact RPC','get_ride_driver_details'],
 ['Customer WhatsApp action','https://wa.me/'],
 ['Customer active ride contact rendering','frRenderCustomerRideDriverAndPayment(active)']
];
for(const [label,token] of checks){if(html.includes(token))console.log('PASS '+label);else{failed=true;console.error('FAIL '+label);}}
const retiredModuleMigration=fs.readFileSync('supabase/migrations/20261122000000_remove_vidyasetu_module.sql','utf8');
const retiredModuleChecks=[
 ['Legacy Learn-Teach accounts cleanup','DROP TABLE IF EXISTS public.learn_teach_accounts CASCADE;'],
 ['Legacy Learn-Teach courses cleanup','DROP TABLE IF EXISTS public.learn_teach_courses CASCADE;'],
 ['Legacy Learn-Teach notifications cleanup','DROP TABLE IF EXISTS public.learn_teach_notifications CASCADE;'],
 ['Legacy Learn-Teach notification settings cleanup','DROP TABLE IF EXISTS public.learn_teach_notification_settings CASCADE;'],
 ['Legacy Learn-Teach requests cleanup','DROP TABLE IF EXISTS public.learn_teach_requests CASCADE;'],
 ['Legacy Learn-Teach admin RPC cleanup','DROP FUNCTION IF EXISTS public.fr_learn_teach_is_admin();']
];
for(const [label,token] of retiredModuleChecks){if(retiredModuleMigration.includes(token))console.log('PASS '+label);else{failed=true;console.error('FAIL '+label);}}
if(failed)process.exit(1);
console.log(`Checked ${blocks.length} inline scripts.`);
