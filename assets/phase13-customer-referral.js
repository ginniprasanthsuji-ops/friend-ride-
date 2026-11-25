/* Phase 13 customer referral code UI */
(function(){
 const box=()=>document.getElementById('frCustomerReferralCodeBox');
 const esc=v=>typeof safe==='function'?safe(v):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let cachedCode='';
 window.frCustomerReferralLoad=async function(){
  const b=box();if(!b)return;
  try{
   if(!currentUser)throw Error('Customer login required.');
   if(String(currentProfile?.role||selectedRole).toLowerCase()!=='customer')throw Error('Customer account only.');
   b.textContent='Generating/loading referral code…';
   const {data,error}=await sb.rpc('fr_customer_referral_get_or_create_code');if(error)throw error;
   cachedCode=String(data||'');
   if(!cachedCode)throw Error('Referral code response is empty.');
   b.innerHTML='<div><b>Your referral code:</b><br><span style="font-size:1.35rem;font-weight:800;letter-spacing:1px">'+esc(cachedCode)+'</span><p class="tiny">₹50 reward eligibility after 2 eligible completed orders by referred customer. Admin approval applies.</p><button class="btn light" onclick="frCustomerReferralCopy()">Copy Code</button></div>';
  }catch(e){b.textContent='Referral code unavailable: '+(e.message||e);}
 };
 window.frCustomerReferralCopy=function(){
  if(!cachedCode)return;
  const copy=()=>{const b=box();if(b)b.insertAdjacentHTML('beforeend','<p>Code copied.</p>');};
  if(navigator.clipboard?.writeText)navigator.clipboard.writeText(cachedCode).then(copy).catch(()=>alert('Copy failed; code: '+cachedCode));
  else alert('Referral code: '+cachedCode);
 };
 window.frCustomerReferralShare=function(){
  if(!cachedCode){window.frCustomerReferralLoad().then(()=>{if(cachedCode)window.frCustomerReferralShare();});return;}
  const invite='FRIEND RIDE invite! Local rides, shopping, delivery and services. Use my customer referral code: '+cachedCode+'. Customer ₹50 reward is eligible after 2 completed eligible orders; terms and admin approval apply. https://friendride.in';
  if(navigator.share)navigator.share({title:'FRIEND RIDE Invite',text:invite}).catch(()=>{});
  else if(navigator.clipboard)navigator.clipboard.writeText(invite).then(()=>alert('Invite copied.')).catch(()=>alert(invite));
  else alert(invite);
 };
})();
