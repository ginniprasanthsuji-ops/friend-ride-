import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const reply=(b,s=200)=>new Response(JSON.stringify(b),{status:s,headers:{...cors,"Content-Type":"application/json"}});
serve(async req=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 try{
  const auth=req.headers.get("Authorization");if(!auth)throw new Error("Authorization required");
  const url=Deno.env.get("SUPABASE_URL")!,anon=Deno.env.get("SUPABASE_ANON_KEY")!,service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const userClient=createClient(url,anon,{global:{headers:{Authorization:auth}}});
  const {data:{user},error:userError}=await userClient.auth.getUser();if(userError||!user)throw new Error("Invalid user");
  const {session_id}=await req.json();if(!session_id)throw new Error("Session ID required");
  const admin=createClient(url,service);
  const {data:session,error:sessionError}=await admin.from("fr_learn_sessions").select("id,teacher_id,student_id,classroom_id,status").eq("id",session_id).single();
  if(sessionError||!session)throw new Error("Session not found");
  if(user.id!==session.teacher_id&&user.id!==session.student_id)throw new Error("Classroom participant access required");
  if(!["scheduled","started"].includes(session.status))throw new Error("Student confirmation required before joining");
  const {data:homework,error:homeworkError}=await admin.from("fr_learn_homework").select("teacher_approved").eq("session_id",session_id).eq("teacher_approved",true).maybeSingle();
  if(homeworkError||!homework)throw new Error("Teacher homework approval required before joining");
  const {data:room,error:roomError}=await admin.from("fr_learn_zoom_classrooms").select("zoom_join_url").eq("id",session.classroom_id).single();
  if(roomError||!room?.zoom_join_url)throw new Error("Classroom join link unavailable");
  return reply({join_url:room.zoom_join_url});
 }catch(e){return reply({error:String(e?.message||e)},400);}
});
