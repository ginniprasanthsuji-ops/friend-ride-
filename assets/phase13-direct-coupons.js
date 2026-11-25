/* Phase 13 Direct Store Coupon Recognition - claim/review only, no payment status mutation */
(function(){
 const $=id=>document.getElementById(id),esc=v=>typeof safe==='function'?safe(v):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const isAdmin=()=>!!currentUser&&(selectedRole==='admin'||currentProfile?.role==='admin');
 window.frDirectCouponSubmit=async function(){
  const s=$('frDirectCouponStatus');if(!s)return;
  try{if(!currentUser||currentProfile?.role!=='customer')throw Error('Customer login required.');
   const order=$('frDirectCouponOrder').value.trim(),code=$('frDirectCouponCode').value.trim(),txn=$('frDirectCouponTxn').value.trim(),note=$('frDirectCouponNote').value.trim();
   if(!order||!code)throw Error('Order ID and coupon code are required.');
   const {data,error}=await sb.rpc('fr_direct_store_coupon_submit',{p_order_id:order,p_coupon_code:code,p_transaction_reference:txn||null,p_customer_note:note||null});
   if(error)throw error;if(!data?.ok)throw Error(data?.reason||'Submit failed');
   s.textContent='Claim submitted for store/admin review. FRIEND RIDE payment/order status remains unchanged.';
  }catch(e){s.textContent='Submission failed: '+(e.message||e);}
 };
 window.frDirectCouponReviewLoad=async function(){
  const box=$('frDirectCouponReviewList');if(!box)return;
  try{if(!currentUser||!(isAdmin()||currentProfile?.role==='partner'||currentProfile?.role==='shop_partner'||currentProfile?.role==='store_partner'))throw Error('Partner or Admin login required.');
   box.textContent='Loading claims…';
   const {data,error}=await sb.from('fr_direct_store_coupon_claims').select('id,order_id,customer_id,shop_id,coupon_code,transaction_reference,customer_note,status,review_note,created_at').order('created_at',{ascending:false}).limit(200);
   if(error)throw error;if(!data?.length){box.textContent='No coupon claims.';return;}
   box.innerHTML=data.map(r=>'<div class="listrow"><div class="grow"><b>Coupon: '+esc(r.coupon_code)+'</b><small>Order: '+esc(r.order_id)+'<br>Customer: '+esc(r.customer_id)+'</small><small>Transaction reference: '+esc(r.transaction_reference||'Not provided')+'</small><small>Note: '+esc(r.customer_note||'')+'</small><small>Status: '+esc(r.status)+' • Direct store claim (not FR payment)</small><small>'+esc(r.review_note||'')+'</small></div>'+(r.status==='pending'?'<button class="btn purple" style="width:auto" onclick="frDirectCouponReview(\''+esc(r.id)+'\',\'recognize\')">Recognize</button><button class="btn light" style="width:auto" onclick="frDirectCouponReview(\''+esc(r.id)+'\',\'reject\')">Reject</button>':'<span class="tag">'+esc(r.status)+'</span>')+'</div>').join('');
  }catch(e){box.textContent='Claims load failed: '+(e.message||e);}
 };
 window.frDirectCouponReview=async function(id,decision){
  try{if(!currentUser)throw Error('Login required.');
   const note=prompt('Review note (optional):','');if(note===null)return;
   const {data,error}=await sb.rpc('fr_direct_store_coupon_review',{p_claim_id:id,p_decision:decision,p_note:note});
   if(error)throw error;if(!data?.ok)throw Error(data?.reason||'Review failed');
   alert('Claim '+decision+'d. Payment/order status is unchanged.');await window.frDirectCouponReviewLoad();
  }catch(e){alert('Review failed: '+(e.message||e));}
 };
 if(typeof window.showPage==='function'){const old=window.showPage;window.showPage=function(id){const out=old.apply(this,arguments);if(id==='frDirectCouponReview')window.frDirectCouponReviewLoad();return out;};}
})();