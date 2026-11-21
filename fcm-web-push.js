/* FRIEND RIDE FCM Web Push opt-in; public Firebase config only. */
(function(){
  const FIREBASE_CONFIG={
    apiKey:'REPLACE_WITH_FIREBASE_WEB_API_KEY',
    authDomain:'friend-ride-app.firebaseapp.com',
    projectId:'friend-ride-app',
    storageBucket:'friend-ride-app.appspot.com',
    messagingSenderId:'986949278576',
    appId:'REPLACE_WITH_FIREBASE_WEB_APP_ID'
  };
  const VAPID_PUBLIC_KEY='BOYoqlhqA2JZzKxqRUcfPC1Dw7QV7ldMZFzU7aS_gwhyJrerEQNaIP3DuH46BV9z_bLmi5jHliVY3AD6riknmkM';
  const SUPABASE_URL='https://fglyplxcczdjtfwobtzh.supabase.co';
  const SUPABASE_ANON_KEY='sb_publishable_P55B8imGKyE4_8HwLRiaQA_EE81kwVz';
  const CONFIG_READY=!FIREBASE_CONFIG.apiKey.startsWith('REPLACE_')&&!FIREBASE_CONFIG.appId.startsWith('REPLACE_');
  function makeUI(){
    const home=document.getElementById('home');
    if(!home||document.getElementById('frPushOptInCard'))return;
    const card=document.createElement('section');card.className='card';card.id='frPushOptInCard';
    card.innerHTML='<h3>🔔 FRIEND RIDE Notifications</h3><p class="muted tiny">Enable ride, order and service updates on this device.</p><button id="frPushEnableBtn" class="btn purple">Enable Notifications</button><div id="frPushStatus" class="notice" role="status">Notifications are optional. Tap to enable on this device.</div>';
    home.appendChild(card);
    const btn=card.querySelector('#frPushEnableBtn'),status=card.querySelector('#frPushStatus');
    btn.addEventListener('click',enablePush);
    async function enablePush(){
      btn.disabled=true;status.textContent='Setting up notifications…';
      try{
        if(!CONFIG_READY)throw new Error('Firebase Web app config is incomplete. Firebase Project Settings > General > Web app నుంచి apiKey మరియు appId నమోదు చేయాలి.');
        if(!window.currentUser && !currentUser)throw new Error('Notifications register చేయడానికి ముందుగా Login చేయండి.');
        if(!('Notification' in window)||!('serviceWorker' in navigator))throw new Error('ఈ browserలో Web Push support లేదు.');
        const permission=await Notification.requestPermission();
        if(permission!=='granted')throw new Error('Notification permission ఇవ్వలేదు. Browser Settingsలో enable చేసి మళ్లీ ప్రయత్నించండి.');
        const scripts=['https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js','https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js'];
        for(const src of scripts)await loadScript(src);
        if(!firebase.apps.length)firebase.initializeApp(FIREBASE_CONFIG);
        const reg=await navigator.serviceWorker.register('/firebase-messaging-sw.js',{scope:'/'});
        const messaging=firebase.messaging();
        const token=await messaging.getToken({vapidKey:VAPID_PUBLIC_KEY,serviceWorkerRegistration:reg});
        if(!token)throw new Error('FCM token generation failed.');
        const {data:sessionData,error:sessionError}=await sb.auth.getSession();
        if(sessionError||!sessionData.session)throw new Error('Login session unavailable. Re-login చేసి retry చేయండి.');
        const response=await fetch(SUPABASE_URL+'/functions/v1/fr-notification-register-token',{
          method:'POST',headers:{'Content-Type':'application/json','apikey':SUPABASE_ANON_KEY,'Authorization':'Bearer '+sessionData.session.access_token},
          body:JSON.stringify({token,platform:'web'})
        });
        const result=await response.json().catch(()=>({}));
        if(!response.ok||!result.registered)throw new Error(result.error||'Token registration failed.');
        status.textContent='Notifications enabled and device registered ✓';
        btn.textContent='Notifications Enabled ✓';btn.disabled=true;
        messaging.onMessage(payload=>{const title=payload.notification?.title||'FRIEND RIDE';const body=payload.notification?.body||'New update';if(Notification.permission==='granted')new Notification(title,{body,icon:'/icons/icon-192.png'});});
      }catch(e){status.textContent=e.message||String(e);btn.disabled=false;}
    }
  }
  function loadScript(src){return new Promise((resolve,reject)=>{if(document.querySelector('script[src="'+src+'"]'))return resolve();const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error('Firebase SDK load failed'));document.head.appendChild(s);});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',makeUI,{once:true});else makeUI();
})();
