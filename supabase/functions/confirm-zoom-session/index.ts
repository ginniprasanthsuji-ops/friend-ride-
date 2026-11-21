import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const reply=(b,s=200)=>new Response(JSON.stringify(b),{status:s,headers:{...cors,"Content-Type":"application/json"}});
serve(async req=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 try{
  const auth=req.headers.get("Authorization");if(!auth)throw new Error("Authorization required");
  const userClient=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_ANON_KEY")!,{global:{headers:{Authorization:auth}}});
  const {data:{user},error:userError}=await userClient.auth.getUser();if(userError||!user)throw new Error("Invalid user");
  const {session_id}=await req.json();if(!session_id)throw new Error("Session ID required");
  const admin=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const {data:session,error:fetchError}=await admin.from("fr_learn_sessions").select("id,student_id,status").eq("id",session_id).single();
  if(fetchError||!session)throw new Error("Session not found");
  if(session.student_id!==user.id)throw new Error("Only the enrolled student can confirm this class time");
  if(session.status!=="pending_confirmation")throw new Error("Session is not awaiting confirmation");
  const {data:updated,error:updateError}=await admin.from("fr_learn_sessions").update({status:"scheduled"}).eq("id",session_id).eq("student_id",user.id).eq("status","pending_confirmation").select("id,status").single();
  if(updateError||!updated)throw new Error("Confirmation failed; refresh and retry");
  return reply({session:updated,message:"Class time confirmed by student."});
 }catch(e){return reply({error:String(e?.message||e)},400);}
});
