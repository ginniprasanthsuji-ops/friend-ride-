/* Phase 13 customer referral admin review and reward ledger credit */
(function(){
 const esc=v=>typeof safe==='function'?safe(v):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const isAdmin=()=>String(currentProfile?.role||selectedRole||'').toLowerCase()==='admin';
 window.frReferralAdminLoad=async function(){
  const box=document.getElementById('frReferralAdminList');if(!box)return;
  try{if(!currentUser||!isAdmin())throw Error('Admin login required.');
   box.textContent='Loading referrals…';
   const {data,error}=await sb.from('fr_customer_referrals').select('id,referrer_customer_id,referred_customer_id,referral_code,status,eligible_order_count,reward_amount,reward_status,admin_note,created_at,reviewed_at').order('created_at',{ascending:false}).limit(200);
   if(error)throw error;if(!data?.length){box.textContent='No customer referrals yet.';return;}
   box.innerHTML=data.map(r=>'<div class="listrow"><div class="grow"><b>₹'+Number(r.reward_amount||50).toFixed(2)+' • '+esc(r.reward_status)+'</b><small>Code: '+esc(r.referral_code)+' • '+esc(r.status)+' • Eligible orders: '+esc(r.eligible_order_count||0)+'</small><small>Referrer: '+esc(r.referrer_customer_id)+'<br>Referred: '+esc(r.referred_customer_id)+'</small><small>'+esc(r.admin_note||'')+'</small></div>'+(r.reward_status==='pending'?'<button class="btn purple" style="width:auto" onclick="frReferralReview(\''+esc(r.id)+'\',\'approve\')">Approve</button><button class="btn light" style="width:auto" onclick="frReferralReview(\''+esc(r.id)+'\',\'reject\')">Reject</button>':r.reward_status==='approved'?'<button class="btn purple" style="width:auto" onclick="frReferralRewardCredit(\''+esc(r.id)+'\')">Credit ₹50 Ledger</button>':'<span class="tag">'+esc(r.reward_status)+'</span>')+'</div>').join('');
  }catch(e){box.textContent='Referral list failed: '+(e.message||e);}
 };
 window.frReferralReview=async function(id,decision){
  try{if(!currentUser||!isAdmin())throw Error('Admin login required.');
   const note=prompt(decision==='approve'?'Optional approval note:':'Rejection reason (recommended):','');if(note===null)return;
   const {data,error}=await sb.rpc('fr_customer_referral_admin_review',{p_referral_id:id,p_decision:decision,p_note:note});if(error)throw error;if(!data?.ok)throw Error(data?.reason||'Review failed');
   alert('Referral '+decision+'d. Approval is separate from reward ledger credit.');await window.frReferralAdminLoad();
  }catch(e){alert('Referral review failed: '+(e.message||e));}
 };
 window.frReferralRewardCredit=async function(id){
  try{if(!currentUser||!isAdmin())throw Error('Admin login required.');
   if(!confirm('Record exactly-once ₹50 referral reward in ledger? This is not a wallet payout.'))return;
   const {data,error}=await sb.rpc('fr_customer_referral_reward_credit',{p_referral_id:id});if(error)throw error;if(!data?.ok)throw Error(data?.reason||'Credit failed');
   alert(data.already_credited?'Already credited; duplicate prevented.':'₹50 reward ledger entry recorded. Wallet/cash payout is not connected.');await window.frReferralAdminLoad();
  }catch(e){alert('Reward credit failed: '+(e.message||e));}
 };
 if(typeof window.showPage==='function'){const old=window.showPage;window.showPage=function(id){const out=old.apply(this,arguments);if(id==='frReferralAdmin')window.frReferralAdminLoad();return out;};}
})();