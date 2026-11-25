/* Phase 13 Flash Sale UI integration. Uses existing Supabase client and authenticated session. */
(function(){
  const el=id=>document.getElementById(id);
  const esc=v=>typeof safe==='function'?safe(v):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=v=>'₹'+Number(v||0).toFixed(2);
  function adminCheck(){return !!currentUser && (selectedRole==='admin' || currentProfile?.role==='admin');}
  window.frCampaignCreate=async function(){
    const status=el('frCampaignAdminStatus'); if(!status)return;
    try{
      if(!adminCheck())throw Error('Admin login required.');
      const code=el('frCampaignCode').value.trim().toUpperCase(),title=el('frCampaignTitle').value.trim();
      const discountType=el('frCampaignDiscountType').value,discountValue=Number(el('frCampaignDiscountValue').value);
      const start=new Date(el('frCampaignStart').value),end=new Date(el('frCampaignEnd').value);
      if(!code||!title)throw Error('Campaign code and title are required.');
      if(!Number.isFinite(discountValue)||discountValue<0||(discountType==='percentage'&&discountValue>100))throw Error('Discount value is invalid.');
      if(!el('frCampaignStart').value||!el('frCampaignEnd').value||!(start<end))throw Error('Valid start and end dates are required.');
      const minimum=Number(el('frCampaignMinimum').value||0),maxInput=el('frCampaignMaxDiscount').value,qtyInput=el('frCampaignQuantity').value,perUser=Number(el('frCampaignPerUser').value||1),partner=el('frCampaignPartnerId').value.trim()||null;
      if(minimum<0||perUser<1)throw Error('Minimum order and per-customer limit are invalid.');
      const payload={campaign_code:code,campaign_type:'flash_sale',title,description:el('frCampaignDescription').value.trim()||null,partner_id:partner,discount_type:discountType,discount_value:discountValue,minimum_order_amount:minimum,maximum_discount_amount:maxInput===''?null:Number(maxInput),starts_at:start.toISOString(),ends_at:end.toISOString(),quantity_limit:qtyInput===''?null:Number(qtyInput),per_user_limit:perUser,eligibility:{},is_active:true,approval_status:'approved',created_by:currentUser.id,approved_by:currentUser.id};
      status.textContent='Saving campaign…';
      const {data,error}=await sb.from('fr_store_campaigns').insert(payload).select('id,campaign_code,title').single();
      if(error)throw error;
      status.textContent='Campaign created and activated: '+data.campaign_code+' ('+data.id+').';
      await window.frCampaignAdminLoad();
      await window.frCampaignCustomerLoad();
    }catch(e){status.textContent='Create failed: '+(e.message||e);}
  };
  window.frCampaignAdminLoad=async function(){
    const box=el('frCampaignAdminList');if(!box)return;
    try{if(!adminCheck())throw Error('Admin login required.');
      box.textContent='Loading campaigns…';
      const {data,error}=await sb.from('fr_store_campaigns').select('*').order('created_at',{ascending:false}).limit(100);if(error)throw error;
      if(!data?.length){box.textContent='No campaigns created yet.';return;}
      box.innerHTML=data.map(c=>'<div class="listrow"><div class="grow"><b>'+esc(c.title)+'</b><small>'+esc(c.campaign_code)+' • '+esc(c.approval_status)+' • '+(c.is_active?'Active':'Inactive')+'</small><small>'+esc(c.campaign_type)+' • '+esc(c.discount_type)+' '+esc(c.discount_value??'')+' • redeemed '+esc(c.quantity_redeemed)+'/'+esc(c.quantity_limit??'∞')+'</small></div><button class="btn light" style="width:auto" onclick="frCampaignToggle(\''+esc(c.id)+'\','+(!c.is_active)+')">'+(c.is_active?'Pause':'Activate')+'</button></div>').join('');
    }catch(e){box.textContent='Campaign list failed: '+(e.message||e);}
  };
  window.frCampaignToggle=async function(id,active){
    try{if(!adminCheck())throw Error('Admin login required.');
      const {error}=await sb.from('fr_store_campaigns').update({is_active:!!active,updated_at:new Date().toISOString()}).eq('id',id);if(error)throw error;
      await window.frCampaignAdminLoad();await window.frCampaignCustomerLoad();
    }catch(e){alert('Campaign update failed: '+(e.message||e));}
  };
  window.frCampaignCustomerLoad=async function(){
    const box=el('frCampaignCustomerList');if(!box)return;
    try{
      const {data,error}=await sb.from('fr_store_campaigns').select('id,campaign_code,title,description,discount_type,discount_value,minimum_order_amount,maximum_discount_amount,starts_at,ends_at,quantity_limit,quantity_redeemed,per_user_limit').eq('campaign_type','flash_sale').eq('is_active',true).eq('approval_status','approved').order('ends_at',{ascending:true});if(error)throw error;
      const now=Date.now(),active=(data||[]).filter(c=>new Date(c.starts_at).getTime()<=now&&new Date(c.ends_at).getTime()>now&&(c.quantity_limit==null||c.quantity_redeemed<c.quantity_limit));
      if(!active.length){box.textContent='Currently no active Flash Sale campaigns.';return;}
      box.innerHTML=active.map(c=>'<div class="offer-card"><span class="tag">FLASH SALE</span><h3>'+esc(c.title)+'</h3><p>'+esc(c.description||'Limited-time offer')+'</p><div class="offer-price">'+(c.discount_type==='percentage'?esc(c.discount_value)+'% OFF':money(c.discount_value)+' OFF')+'</div><small>Minimum order: '+money(c.minimum_order_amount)+' • Ends: '+new Date(c.ends_at).toLocaleString()+' • Remaining: '+(c.quantity_limit==null?'Unlimited':Math.max(0,c.quantity_limit-c.quantity_redeemed))+'</small><div class="field"><label>Cart subtotal ₹ (estimate)</label><input id="frFlashSubtotal_'+esc(c.id)+'" type="number" min="0" step="0.01" placeholder="Enter subtotal"></div><button class="btn purple" onclick="frCampaignReserve(\''+esc(c.id)+'\')">Reserve Flash Sale</button><div id="frFlashResult_'+esc(c.id)+'" class="notice">Coupon reservation is not yet connected to checkout/order payment.</div></div>').join('');
    }catch(e){box.textContent='Flash Sale load failed: '+(e.message||e);}
  };
  window.frCampaignReserve=async function(id){
    const out=el('frFlashResult_'+id),amount=Number(el('frFlashSubtotal_'+id)?.value);
    try{if(!currentUser)throw Error('Please login as a customer first.');if(!Number.isFinite(amount)||amount<=0)throw Error('Enter a valid cart subtotal.');
      const key='fr-flash-'+currentUser.id+'-'+(crypto.randomUUID?crypto.randomUUID():Date.now().toString());
      const {data,error}=await sb.rpc('fr_store_flash_sale_reserve',{p_campaign_id:id,p_cart_subtotal:amount,p_idempotency_key:key});if(error)throw error;
      if(out)out.innerHTML='Reservation: <b>'+esc(data.status)+'</b> • Discount: <b>'+money(data.discount_amount)+'</b><br>Code: <b>'+esc(data.redemption_code||'')+'</b><br><button class="btn light" onclick="frCampaignCancel(\''+esc(data.redemption_id)+'\')">Cancel Reservation</button><small>Reservation recorded. Not a checkout discount/payment confirmation.</small><div class="field"><label>Order ID to link (same store)</label><input id="frFlashOrder_${esc(data.redemption_id)}" placeholder="FRM order UUID"></div><button class="btn light" onclick="frCampaignAttachOrder('${esc(data.redemption_id)}')">Link reservation to order</button><small id="frFlashLinkStatus_${esc(data.redemption_id)}">Linking only; discount is not applied yet.</small>';
    }catch(e){if(out)out.textContent='Reservation failed: '+(e.message||e);}
  };
  window.frCampaignCancel=async function(redemptionId){
    try{const {data,error}=await sb.rpc('fr_store_flash_sale_cancel_reservation',{p_redemption_id:redemptionId});if(error)throw error;alert('Reservation cancelled.');await window.frCampaignCustomerLoad();}catch(e){alert('Cancel failed: '+(e.message||e));}
  };

 window.frCampaignAttachOrder=async function(redemptionId){try{if(!currentUser||currentProfile?.role!=='customer')throw Error('Customer login required.');const orderId=el('frFlashOrder_'+redemptionId)?.value.trim();if(!orderId)throw Error('Order ID required.');const {data,error}=await sb.rpc('fr_store_flash_sale_attach_order',{p_redemption_id:redemptionId,p_order_id:orderId});if(error)throw error;if(!data?.ok)throw Error(data?.reason||'Link failed');const box=el('frFlashLinkStatus_'+redemptionId);if(box)box.textContent='Linked to order. Discount has not been applied; campaign remains reserved.';}catch(e){const box=el('frFlashLinkStatus_'+redemptionId);if(box)box.textContent='Link failed: '+(e.message||e);}};
  if(typeof window.showPage==='function'){
    const old=window.showPage;
    window.showPage=function(id){const r=old.apply(this,arguments);if(id==='frCampaignAdmin')window.frCampaignAdminLoad();if(id==='offers')window.frCampaignCustomerLoad();return r;};
  }
  document.addEventListener('DOMContentLoaded',()=>{if(el('frCampaignCustomerList'))window.frCampaignCustomerLoad();});
})();
