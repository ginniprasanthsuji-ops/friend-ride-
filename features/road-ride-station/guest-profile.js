/* ROAD RIDE STATION guest profile helpers; requires existing global Supabase client sb */
let rrGuestPhotoFile=null,rrGuestPhotoPreviewUrl=null;
function rrSetStatus(text,good=false){const e=document.getElementById('rrGuestStatus');if(e){e.textContent=text;e.className='notice'+(good?' status ok':'');}}
async function rrStartGuest(){
 try{
  if(!window.sb)throw new Error('Supabase client not found in app.');
  const {data,error}=await sb.auth.getSession();if(error)throw error;
  if(data?.session){rrSetStatus('Existing session ready ✓',true);return;}
  const {data:anon,error:authError}=await sb.auth.signInAnonymously();if(authError)throw authError;
  if(!anon?.user)throw new Error('Anonymous account session was not returned.');
  rrSetStatus('Guest account created ✓ Profile fill చేయండి.',true);
 }catch(e){rrSetStatus('Guest account error: '+(e.message||e));}
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
function rrValidateProfile(){
 const name=(document.getElementById('rrName')?.value||'').trim(),phone=(document.getElementById('rrPhone')?.value||'').replace(/\D/g,''),bike=(document.getElementById('rrBikeNo')?.value||'').trim();
 if(name.length<2){alert('Driver name నమోదు చేయండి.');return false;}
 if(!/^\d{10}$/.test(phone)){alert('10 digit mobile number నమోదు చేయండి.');return false;}
 if(!bike){alert('Bike registration number నమోదు చేయండి.');return false;}
 if(!rrGuestPhotoFile){alert('Driver photo ఎంచుకోండి.');return false;}
 rrSetStatus('Profile validated ✓ OTP అవసరం లేదు. Backend upload/save integration తదుపరి దశ.',true);return true;
}
