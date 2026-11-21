/* FRIEND RIDE FCM Web Push service worker (Firebase compat SDK) */
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');
firebase.initializeApp({apiKey:'REPLACE_WITH_FIREBASE_WEB_API_KEY',authDomain:'friend-ride-app.firebaseapp.com',projectId:'friend-ride-app',storageBucket:'friend-ride-app.appspot.com',messagingSenderId:'986949278576',appId:'REPLACE_WITH_FIREBASE_WEB_APP_ID'});
const messaging=firebase.messaging();
messaging.onBackgroundMessage(payload=>{const title=payload.notification?.title||'FRIEND RIDE';self.registration.showNotification(title,{body:payload.notification?.body||'New update',icon:'/icons/icon-192.png',badge:'/icons/icon-192.png',data:payload.data||{url:'/'}});});
self.addEventListener('notificationclick',event=>{event.notification.close();const target=event.notification.data?.url||'/';event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(wins=>{for(const w of wins){if('focus'in w){w.focus();if('navigate'in w)w.navigate(target);return;}}return clients.openWindow(target);}));});