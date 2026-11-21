/* FRIEND RIDE notification fallback: Realtime + polling for active app sessions.
   Does not require Firebase token; never asks permission without user gesture. */
(function(){
  const seen=new Set();
  let channel=null, timer=null, activeUser=null;
  function showEvent(row){
    if(!row||!row.id||seen.has(row.id)||row.status==='skipped'||row.status==='failed')return;
    seen.add(row.id);
    const title=row.title||'FRIEND RIDE update';
    const body=row.body||'You have a new update.';
    const home=document.getElementById('home')||document.body;
    let box=document.getElementById('frNotifFallbackBox');
    if(!box){box=document.createElement('section');box.id='frNotifFallbackBox';box.className='card';box.style.cssText='position:sticky;top:8px;z-index:10000;border:2px solid #6d28d9;background:#fff;color:#111;padding:12px;margin:8px;border-radius:12px';home.prepend(box);}
    const item=document.createElement('div');item.style.cssText='padding:8px 0;border-bottom:1px solid #ddd';
    const h=document.createElement('strong');h.textContent=title;const p=document.createElement('p');p.textContent=body;p.style.margin='5px 0';
    item.append(h,p);box.prepend(item);
    if(Notification.permission==='granted'){try{new Notification(title,{body,icon:'./icons/icon-192.png'});}catch(_e){}}
  }
  async function loadRecent(){
    if(!window.sb||!activeUser)return;
    const {data,error}=await sb.from('fr_notification_events').select('id,title,body,status,created_at,category,payload').eq('user_id',activeUser).order('created_at',{ascending:false}).limit(20);
    if(!error&&Array.isArray(data))data.reverse().forEach(showEvent);
  }
  async function init(){
    if(!window.sb||!sb.auth)return;
    const {data}=await sb.auth.getSession();activeUser=data?.session?.user?.id||null;
    if(!activeUser)return;
    await loadRecent();
    if(channel)sb.removeChannel(channel);
    channel=sb.channel('fr-notification-fallback-'+activeUser).on('postgres_changes',{event:'INSERT',schema:'public',table:'fr_notification_events',filter:'user_id=eq.'+activeUser},payload=>showEvent(payload.new)).subscribe();
    if(timer)clearInterval(timer);timer=setInterval(loadRecent,60000);
    sb.auth.onAuthStateChange((_event,session)=>{activeUser=session?.user?.id||null;if(channel){sb.removeChannel(channel);channel=null;}if(timer){clearInterval(timer);timer=null;}if(activeUser){loadRecent();channel=sb.channel('fr-notification-fallback-'+activeUser).on('postgres_changes',{event:'INSERT',schema:'public',table:'fr_notification_events',filter:'user_id=eq.'+activeUser},payload=>showEvent(payload.new)).subscribe();timer=setInterval(loadRecent,60000);}});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();