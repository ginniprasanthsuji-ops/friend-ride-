/* Phase 13 admin referral verifier; requires global Supabase client sb */
async function frReferralAdminRefresh(){
 const root=document.getElementById('frReferralAdminList');if(!root)return;
 root.textContent='Loading…';
 try{
 const {data,error}=await sb.from('fr_referrals').select('id,referrer_user_id,referee_user_id,referral_code,status,referrer_reward_paise,referee_reward_paise,created_at,verified_at,rewarded_at').order('created_at',{ascending:false});
 if(error)throw error;
 if(!data?.length){root.textContent='No referrals found.';return;}
 root.innerHTML='';
 data.forEach(row=>{
 const card=document.createElement('div');card.style.cssText='border:1px solid #ccc;border-radius:8px;padding:10px;margin:8px 0';
 const text=document.createElement('div');text.textContent='Code: '+row.referral_code+' | Status: '+row.status+' | ₹'+(row.referrer_reward_paise/100)+' + ₹'+(row.referee_reward_paise/100)+' | Referrer: '+row.referrer_user_id+' | Referee: '+row.referee_user_id;
 card.appendChild(text);
 if(row.status!=='rewarded'&&row.status!=='rejected'){
 const btn=document.createElement('button');btn.type='button';btn.textContent='Verify & Credit Both ₹50';
 btn.onclick=async()=>{btn.disabled=true;try{const {data,error}=await sb.rpc('fr_admin_verify_and_reward_referral',{p_referral_id:row.id});if(error)throw error;alert('Reward processed: '+JSON.stringify(data));frReferralAdminRefresh();}catch(e){alert('Failed: '+(e.message||e));btn.disabled=false;}};
 card.appendChild(btn);
 }
 root.appendChild(card);
 });
 }catch(e){root.textContent='Admin referral load failed: '+(e.message||e);}
}