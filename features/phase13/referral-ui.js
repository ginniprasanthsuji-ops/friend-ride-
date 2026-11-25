/* Phase 13 referral customer UI helpers; uses existing global Supabase client sb */
function frReferralStatus(msg,good=false){const e=document.getElementById('frReferralStatus');if(e){e.textContent=msg;e.style.color=good?'green':'';}}
async function frReferralLoadCode(){
 try{if(!window.sb)throw new Error('App Supabase client unavailable');const {data,error}=await sb.rpc('fr_referral_create_my_code');if(error)throw error;const box=document.getElementById('frReferralCodeBox');if(box)box.textContent=data||'';frReferralStatus('Referral code ready ✓',true);return data;}
 catch(e){frReferralStatus('Code error: '+(e.message||e));return null;}
}
async function frReferralCopyCode(){
 const code=document.getElementById('frReferralCodeBox')?.textContent?.trim();if(!code){frReferralStatus('ముందుగా referral code తీసుకోండి');return;}
 try{await navigator.clipboard.writeText(code);frReferralStatus('Code copied ✓',true);}catch(e){frReferralStatus('Copy failed. Code manually copy చేయండి: '+code);}
}
async function frReferralApplyCode(){
 const code=document.getElementById('frReferralApplyInput')?.value?.trim();if(!code){frReferralStatus('Referral code enter చేయండి');return;}
 try{const {data,error}=await sb.rpc('fr_referral_apply_code',{p_code:code});if(error)throw error;frReferralStatus('Referral code applied ✓ Verification తర్వాత reward eligible అవుతుంది.',true);}
 catch(e){frReferralStatus('Apply failed: '+(e.message||e));}
}
async function frReferralLoadRewards(){
 const box=document.getElementById('frReferralRewards');if(!box)return;
 try{const {data,error}=await sb.from('fr_customer_reward_ledger').select('reward_type,amount_paise,status,created_at').order('created_at',{ascending:false});if(error)throw error;
 box.innerHTML=(data||[]).map(x=>'<div>'+String(x.reward_type).replaceAll('_',' ')+' — ₹'+(Number(x.amount_paise)/100).toFixed(2)+' ('+x.status+')</div>').join('')||'ఇంకా rewards లేవు';
 }catch(e){box.textContent='Rewards load failed: '+(e.message||e);}
}