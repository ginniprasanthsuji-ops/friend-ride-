/* FRIEND RIDE notification service worker (QA).
   Web Push delivery requires provider credentials and a server-side sender. */
self.addEventListener('install',event=>{event.waitUntil(self.skipWaiting())});
self.addEventListener('activate',event=>{event.waitUntil(self.clients.claim())});
self.addEventListener('message',event=>{
 if(event.data?.type==='FR_NOTIFICATION_PERMISSION_GRANTED'){
  // Permission setup acknowledgment. Push sender/provider is configured separately.
 }
});
self.addEventListener('push',event=>{
 let payload={title:'FRIEND RIDE',body:'You have a new update.',url:'./'};
 try{if(event.data)payload={...payload,...event.data.json()}}catch(_){try{payload.body=event.data.text()}catch(__){}}
 event.waitUntil(self.registration.showNotification(payload.title||'FRIEND RIDE',{
  body:payload.body||'You have a new update.',
  icon:'./icons/icon-192.png',
  badge:'./icons/icon-192.png',
  data:{url:payload.url||'./'},
  tag:payload.tag||payload.event_id||'friendride-notification',
  renotify:false
 }));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 const url=event.notification.data?.url||'./';
 event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(clients=>{
  for(const client of clients){if('focus' in client){client.navigate(url);return client.focus()}}
  return self.clients.openWindow(url);
 }));
});
