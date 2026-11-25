/* Phase 13: customer consent UI for birthday/special-day data */
(function(){
 const $=id=>document.getElementById(id);
 const dateParts=v=>{if(!v)return null;const p=v.split('-');return {month:Number(p[1]),day:Number(p[2])};};
 window.frSpecialDayLoad=async function(){
  const s=$('frSpecialDayStatus');if(!s)return;
  try{if(!currentUser||currentProfile?.role!=='customer')throw Error('Customer login required.');
   const {data,error}=await sb.from('fr_customer_special_days').select('event_type,event_month,event_day,label,consent_enabled').eq('customer_id',currentUser.id);
   if(error)throw error;
   const b=data?.find(x=>x.event_type==='birthday'),sp=data?.find(x=>x.event_type==='special_day');
   if(b)$('frBirthdayDate').value='2000-'+String(b.event_month).padStart(2,'0')+'-'+String(b.event_day).padStart(2,'0');
   if(sp){$('frSpecialDate').value='2000-'+String(sp.event_month).padStart(2,'0')+'-'+String(sp.event_day).padStart(2,'0');$('frSpecialLabel').value=sp.label||'';}
   $('frSpecialDayConsent').checked=!!(b?.consent_enabled||sp?.consent_enabled);
   s.textContent=data?.length?'Saved date preferences loaded. Consent: '+($('frSpecialDayConsent').checked?'Yes':'No'):'No dates saved yet.';
  }catch(e){s.textContent='Could not load: '+(e.message||e);}
 };
 window.frSpecialDaySave=async function(){
  const s=$('frSpecialDayStatus');if(!s)return;
  try{if(!currentUser||currentProfile?.role!=='customer')throw Error('Customer login required.');
   const consent=$('frSpecialDayConsent').checked;
   const b=dateParts($('frBirthdayDate').value),sp=dateParts($('frSpecialDate').value),label=$('frSpecialLabel').value.trim()||null;
   if(!b&&!sp)throw Error('Load saved dates or enter a date first.');
   if(b){const {data,error}=await sb.rpc('fr_customer_special_day_set',{p_event_type:'birthday',p_month:b.month,p_day:b.day,p_label:null,p_consent:consent});if(error)throw error;if(!data?.ok)throw Error('Birthday save failed.');}
   if(sp){const {data,error}=await sb.rpc('fr_customer_special_day_set',{p_event_type:'special_day',p_month:sp.month,p_day:sp.day,p_label:label,p_consent:consent});if(error)throw error;if(!data?.ok)throw Error('Special day save failed.');}
   s.textContent=consent?'Saved successfully. Consent is active. Offer targeting is not yet activated.':'Consent revoked for saved date(s).';
  }catch(e){s.textContent='Save failed: '+(e.message||e);}
 };
 if(typeof window.showPage==='function'){const old=window.showPage;window.showPage=function(id){const r=old.apply(this,arguments);if(id==='offers'&&currentProfile?.role==='customer')window.frSpecialDayLoad();return r;};}
})();
