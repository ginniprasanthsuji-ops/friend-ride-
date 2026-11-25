/* Phase 13 store reviews customer submission and admin moderation */
(function(){
 const $=id=>document.getElementById(id),esc=v=>typeof safe==='function'?safe(v):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const admin=()=>!!currentUser&&(selectedRole==='admin'||currentProfile?.role==='admin');
 window.frStoreReviewSubmit=async function(){
  const status=$('frStoreReviewStatus');if(!status)return;
  try{if(!currentUser||currentProfile?.role!=='customer')throw Error('Customer login required.');
   const partner=$('frStoreReviewPartner').value.trim(),rating=Number($('frStoreReviewRating').value),text=$('frStoreReviewText').value.trim();
   if(!partner)throw Error('Partner UUID required.');
   const {error}=await sb.from('fr_store_reviews').insert({customer_id:currentUser.id,partner_id:partner,rating,review_text:text||null,status:'pending',purchase_verified:false});
   if(error)throw error;status.textContent='Review submitted for Admin moderation. Not purchase-verified.';
  }catch(e){status.textContent='Review submission failed: '+(e.message||e);}
 };
 window.frStoreReviewAdminLoad=async function(){
  const box=$('frStoreReviewAdminList');if(!box)return;
  try{if(!admin())throw Error('Admin login required.');box.textContent='Loading reviews…';
   const {data,error}=await sb.from('fr_store_reviews').select('id,customer_id,partner_id,rating,review_text,status,purchase_verified,admin_note,created_at').order('created_at',{ascending:false}).limit(250);
   if(error)throw error;if(!data?.length){box.textContent='No reviews yet.';return;}
   box.innerHTML=data.map(r=>'<div class="listrow"><div class="grow"><b>'+('★'.repeat(Number(r.rating))+'☆'.repeat(5-Number(r.rating)))+'</b><small>Partner: '+esc(r.partner_id)+' • Customer: '+esc(r.customer_id)+'</small><p>'+esc(r.review_text||'(No text)')+'</p><small>Status: '+esc(r.status)+' • Purchase verified: No</small><small>'+esc(r.admin_note||'')+'</small></div>'+ (r.status==='pending'?'<button class="btn purple" style="width:auto" onclick="frStoreReviewModerate(\''+esc(r.id)+'\',\'approve\')">Approve</button><button class="btn light" style="width:auto" onclick="frStoreReviewModerate(\''+esc(r.id)+'\',\'reject\')">Reject</button>':'<span class="tag">'+esc(r.status)+'</span>')+'</div>').join('');
  }catch(e){box.textContent='Review list failed: '+(e.message||e);}
 };
 window.frStoreReviewModerate=async function(id,decision){
  try{if(!admin())throw Error('Admin only.');
   const note=prompt('Admin moderation note (optional):','');if(note===null)return;
   const {data,error}=await sb.rpc('fr_store_review_admin_moderate',{p_review_id:id,p_decision:decision,p_note:note});
   if(error)throw error;if(!data?.ok)throw Error(data?.reason||'Moderation failed');
   alert('Review '+decision+'d. Purchase verification remains false.');await window.frStoreReviewAdminLoad();
  }catch(e){alert('Moderation error: '+(e.message||e));}
 };
 if(typeof window.showPage==='function'){const old=window.showPage;window.showPage=function(id){const result=old.apply(this,arguments);if(id==='frStoreReviewAdmin')window.frStoreReviewAdminLoad();return result;};}
})();