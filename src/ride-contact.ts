namespace FRRideContact {
  export type Row = Record<string, unknown>;

  const first = (row: Row, keys: string[]): string => {
    for (const key of keys) {
      const value = row[key];
      if (value !== null && value !== undefined && String(value).trim() !== '') return String(value).trim();
    }
    return '';
  };

  export function phone(row: Row): string {
    return first(row, ['phone', 'phone_number', 'phone_e164', 'mobile', 'mobile_number', 'contact_phone', 'profile_phone']);
  }
  export function fullName(row: Row): string {
    return first(row, ['full_name', 'name', 'customer_name', 'driver_name', 'display_name']);
  }
  export function profilePhoto(row: Row, role: 'driver' | 'customer'): string {
    return role === 'driver'
      ? first(row, ['driver_profile_photo_path', 'driver_photo_path', 'profile_photo_path', 'avatar_path', 'photo_path'])
      : first(row, ['customer_profile_photo_path', 'profile_photo_path', 'customer_photo_path', 'avatar_path', 'photo_path']);
  }
  export function vehicleRegistration(row: Row): string {
    return first(row, ['vehicle_registration', 'vehicle_number', 'registration_number', 'vehicle_reg_no', 'rc_number']);
  }
  export function normalize(row: Row): Row {
    return {
      ...row,
      full_name: fullName(row),
      phone: phone(row),
      driver_profile_photo_path: profilePhoto(row, 'driver'),
      customer_profile_photo_path: profilePhoto(row, 'customer'),
      vehicle_company: first(row, ['vehicle_company', 'vehicle_make', 'company']),
      vehicle_model: first(row, ['vehicle_model', 'model']),
      vehicle_registration: vehicleRegistration(row),
    };
  }
  export function confirmedStatus(status: unknown): boolean {
    return ['accepted', 'confirmed', 'ongoing', 'in_progress', 'started'].includes(String(status ?? '').trim().toLowerCase());
  }
}
(globalThis as typeof globalThis & { FRRideContact?: typeof FRRideContact }).FRRideContact = FRRideContact;

/* Navigation/data-read recovery hooks. This is built into assets/ride-contact.js. */
declare const currentUser: any;
declare const currentProfile: any;
declare const sb: any;
declare let frActiveRideId: any;
declare const safe: any;
declare const frCustomerTrackingStatusAllowed: any;
declare const frRenderCustomerRideDriverAndPayment: any;

if(typeof window!=='undefined'&&typeof document!=='undefined'){(function frRouteInertSync(){
  const win=window as any;
  function sync(){
    const pages=Array.from(document.querySelectorAll<HTMLElement>('main .page'));
    if(!pages.length)return;
    const active=pages.filter(page=>page.classList.contains('active'));
    if(!active.length){pages.forEach(page=>{page.inert=true;page.setAttribute('aria-hidden','true');});return;}
    let target=active[0];
    if(active.length>1){
      const navId=document.querySelector<HTMLElement>('.premium-bottom button.active[data-page]')?.dataset.page;
      target=active.find(page=>page.id===navId)||active[0];
    }
    pages.forEach(page=>{
      const isActive=page===target;
      page.inert=!isActive;
      page.setAttribute('aria-hidden',isActive?'false':'true');
    });
  }
  function install(){
    const main=document.querySelector('main');
    if(!main)return;
    sync();
    if(!win.__frRouteInertObserver){
      win.__frRouteInertObserver=new MutationObserver(sync);
      win.__frRouteInertObserver.observe(main,{subtree:true,attributes:true,attributeFilter:['class']});
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();}

if(typeof window!=='undefined'&&typeof document!=='undefined'){(function frSavedRideReadFallback(){
  const win=window as any;
  function install(){
    const previous=win.loadMyRideTracking;
    if(typeof previous!=='function'||previous.__frSavedRideFallback)return;
    const wrapped:any=async function(this:any,...args:any[]){
      try{await previous.apply(this,args);}catch(_){}
      if(!currentUser||currentProfile?.role!=='customer')return;
      const box=document.getElementById('liveRideStatus');
      if(!box)return;
      const shown=box.textContent||'';
      if(shown.includes('→')&&shown.includes('Ride ID:'))return;
      try{
        const {data,error}=await sb.from('rides').select('*').eq('customer_id',currentUser.id).order('created_at',{ascending:false}).limit(10);
        if(error)throw error;
        if(!data?.length){box.textContent='ఇంకా Rides లేవు.';return;}
        const trackingAllowed=typeof frCustomerTrackingStatusAllowed==='function'
          ? (status:any)=>frCustomerTrackingStatusAllowed(status)
          : (status:any)=>['accepted','confirmed','ongoing','in_progress','started'].includes(String(status||'').trim().toLowerCase());
        const active=data.find((r:any)=>r.driver_id&&trackingAllowed(r.status))||data.find((r:any)=>!['completed','cancelled','canceled','rejected'].includes(String(r.status||'').toLowerCase()))||data[0];
        frActiveRideId=active.id;
        const esc=(value:any)=>typeof safe==='function'?safe(value):String(value??'');
        box.innerHTML='<b>'+esc(active.vehicle_type)+' • '+esc(active.status)+'</b><p>'+esc(active.pickup||active.pickup_text||'—')+' → '+esc(active.drop||active.drop_text||'—')+'</p><p>మీ Offer ₹'+esc(active.fare_offer)+' | Agreed ₹'+esc(active.agreed_fare??'—')+'</p><small>Ride ID: '+esc(active.id)+'</small>';
        if(active.driver_id&&typeof frRenderCustomerRideDriverAndPayment==='function')await frRenderCustomerRideDriverAndPayment(active);
      }catch(e:any){box.textContent='My Rides Error: '+(e.message||e);}
    };
    wrapped.__frSavedRideFallback=true;
    win.loadMyRideTracking=wrapped;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();}
