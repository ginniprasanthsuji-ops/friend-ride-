var FRRideContact;
(function (FRRideContact) {
    const first = (row, keys) => {
        for (const key of keys) {
            const value = row[key];
            if (value !== null && value !== undefined && String(value).trim() !== '')
                return String(value).trim();
        }
        return '';
    };
    function phone(row) {
        return first(row, ['phone', 'phone_number', 'phone_e164', 'mobile', 'mobile_number', 'contact_phone', 'profile_phone']);
    }
    FRRideContact.phone = phone;
    function fullName(row) {
        return first(row, ['full_name', 'name', 'customer_name', 'driver_name', 'display_name']);
    }
    FRRideContact.fullName = fullName;
    function profilePhoto(row, role) {
        return role === 'driver'
            ? first(row, ['driver_profile_photo_path', 'driver_photo_path', 'profile_photo_path', 'avatar_path', 'photo_path'])
            : first(row, ['customer_profile_photo_path', 'profile_photo_path', 'customer_photo_path', 'avatar_path', 'photo_path']);
    }
    FRRideContact.profilePhoto = profilePhoto;
    function vehicleRegistration(row) {
        return first(row, ['vehicle_registration', 'vehicle_number', 'registration_number', 'vehicle_reg_no', 'rc_number']);
    }
    FRRideContact.vehicleRegistration = vehicleRegistration;
    function normalize(row) {
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
    FRRideContact.normalize = normalize;
    function confirmedStatus(status) {
        return ['accepted', 'confirmed', 'ongoing', 'in_progress', 'started'].includes(String(status !== null && status !== void 0 ? status : '').trim().toLowerCase());
    }
    FRRideContact.confirmedStatus = confirmedStatus;
})(FRRideContact || (FRRideContact = {}));
globalThis.FRRideContact = FRRideContact;


/* QA recovery: keep route inert state in sync with the final navigation wrapper. */
(function frRouteInertSync(){
  function sync(){
    const pages=[...document.querySelectorAll('main .page')];
    if(!pages.length)return;
    const active=pages.filter(page=>page.classList.contains('active'));
    if(!active.length){pages.forEach(page=>{page.inert=true;page.setAttribute('aria-hidden','true');});return;}
    let target=active[0];
    if(active.length>1){
      const navId=document.querySelector('.premium-bottom button.active[data-page]')?.dataset.page;
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
    if(!window.__frRouteInertObserver){
      window.__frRouteInertObserver=new MutationObserver(sync);
      window.__frRouteInertObserver.observe(main,{subtree:true,attributes:true,attributeFilter:['class']});
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
