/* ROAD RIDE STATION guest profile helpers; requires existing global Supabase client sb */
let rrGuestPhotoFile=null,rrGuestPhotoPreviewUrl=null;
function rrSetStatus(text,good=false){const e=document.getElementById('rrGuestStatus');if(e){e.textContent=text;e.className='notice'+(good?' status ok':'');}}
async function rrStartGuest(){
 try{
  if(!window.sb)throw new Error('Supabase client not found in app.');
  const {data,error}=await sb.auth.getSession();if(error)throw error;
  if(data?.session){rrSetStatus('Guest session ready ✓',true);return data.session.user;}
  const {data:anon,error:authError}=await sb.auth.signInAnonymously();if(authError)throw authError;
  if(!anon?.user)throw new Error('Anonymous account session was not returned.');
  rrSetStatus('Guest account created ✓ Profile fill చేయండి.',true);return anon.user;
 }catch(e){rrSetStatus('Guest account error: '+(e.message||e));return null;}
}
function rrPreviewPhoto(input){
 const f=input?.files?.[0];if(!f){rrGuestPhotoFile=null;return;}
 if(!['image/jpeg','image/png','image/webp'].includes(f.type)||f.size>3*1024*1024){alert('JPG/PNG/WEBP మాత్రమే, 3 MB లోపు.');input.value='';rrGuestPhotoFile=null;return;}
 rrGuestPhotoFile=f;
 if(rrGuestPhotoPreviewUrl)URL.revokeObjectURL(rrGuestPhotoPreviewUrl);
 rrGuestPhotoPreviewUrl=URL.createObjectURL(f);
 const img=document.getElementById('rrPhotoPreview'),wrap=document.getElementById('rrPhotoPreviewWrap');
 if(img)img.src=rrGuestPhotoPreviewUrl;if(wrap)wrap.classList.remove('hide');
}
function rrProfileFormData(){
 return {name:(document.getElementById('rrName')?.value||'').trim(),
 phone:(document.getElementById('rrPhone')?.value||'').replace(/\D/g,''),
 bike:(document.getElementById('rrBikeNo')?.value||'').trim().toUpperCase()};
}
function rrValidateProfile(){
 const {name,phone,bike}=rrProfileFormData();
 if(name.length<2){alert('Driver name నమోదు చేయండి.');return false;}
 if(!/^\d{10}$/.test(phone)){alert('10 digit mobile number నమోదు చేయండి.');return false;}
 if(!bike){alert('Bike registration number నమోదు చేయండి.');return false;}
 if(!rrGuestPhotoFile){alert('Driver photo ఎంచుకోండి.');return false;}
 return true;
}
async function rrSaveGuestProfile(){
 if(!rrValidateProfile())return;
 try{
  const user=await rrStartGuest();if(!user)throw new Error('Guest login failed. Try again.');
  const {name,phone,bike}=rrProfileFormData();
  const ext=rrGuestPhotoFile.type==='image/png'?'png':rrGuestPhotoFile.type==='image/webp'?'webp':'jpg';
  const path=user.id+'/'+Date.now()+'-driver.'+ext;
  rrSetStatus('Driver photo upload అవుతోంది…');
  const {error:uploadError}=await sb.storage.from('road-ride-driver-photos').upload(path,rrGuestPhotoFile,{contentType:rrGuestPhotoFile.type,upsert:false});
  if(uploadError)throw uploadError;
  rrSetStatus('Profile save అవుతోంది…');
  const {data,error}=await sb.rpc('fr_road_ride_save_guest_driver_profile',{p_driver_phone:phone,p_driver_photo_path:path,p_bike_registration_number:bike,p_driver_display_name:name});
  if(error)throw error;
  if(data!==true)throw new Error('Profile save confirmation not returned.');
  rrSetStatus('Guest Driver Profile saved successfully ✓ Ride publish చేయడానికి సిద్ధంగా ఉంది.',true);
  const btn=document.getElementById('rrGuestSaveBtn');if(btn)btn.textContent='Update Guest Driver Profile';
 }catch(e){rrSetStatus('Save failed: '+(e.message||e));}
}
