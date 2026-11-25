/* Phase 13 Flash Sale checkout acceptance integration */
(function(){
 window.frCustomerAcceptQuote=async function(id){
  try{
   const redemptionId=prompt('Flash Sale Redemption ID (optional). Leave blank for regular checkout:','');
   if(redemptionId===null)return;
   const clean=redemptionId.trim();
   const params={p_order_id:id};
   if(clean)params.p_redemption_id=clean;
   const {data,error}=await sb.rpc('fr_customer_accept_market_quote',params);
   if(error)throw error;
   if(data?.flash_sale_discount_paise>0){
    alert('Quote accepted. Flash Sale '+(data.campaign_code||'')+' applied! Discount: ₹'+(Number(data.flash_sale_discount_paise)/100).toFixed(2)+'\nPayable: ₹'+(Number(data.total_paise)/100).toFixed(2));
   }else alert('Partner quote accepted. Payment window started.');
   await frLoadCustomerMarketOrders();
  }catch(e){alert(e.message||e);}
 };
})();