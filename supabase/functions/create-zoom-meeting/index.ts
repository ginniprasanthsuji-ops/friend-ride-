// Zoom meeting creation for FRIEND RIDE Learn & Teach.
// Deploy only to QA first. Configure Zoom Server-to-Server OAuth secrets:
// ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET.
// Never expose these values to browser/client code.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
serve(async (req) => {
 if(req.method==="OPTIONS") return new Response("ok",{headers:cors});
 try {
  const auth=req.headers.get("Authorization");
  if(!auth) throw new Error("Authorization required");
  const sb=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_ANON_KEY")!,{global:{headers:{Authorization:auth}}});
  const {data:{user},error:userErr}=await sb.auth.getUser(); if(userErr||!user) throw new Error("Invalid user");
  const {student_id,course_id,title,scheduled_start}=await req.json();
  if(!student_id||!course_id||!title||!scheduled_start) throw new Error("Required fields missing");
  const {data:teacher,error:teacherErr}=await sb.from("fr_learn_teacher_profiles").select("approval_status").eq("teacher_id",user.id).single();
  if(teacherErr||teacher?.approval_status!=="approved") throw new Error("Approved teacher required");
  const {data:enrollment,error:enrollErr}=await sb.from("fr_learn_enrollments").select("id").eq("student_id",student_id).eq("course_id",course_id).eq("status","active").single();
  if(enrollErr||!enrollment) throw new Error("Active student enrollment required");
  const start=new Date(scheduled_start); if(isNaN(start.valueOf())||start<=new Date()) throw new Error("Session must be scheduled in the future");
  const account=Deno.env.get("ZOOM_ACCOUNT_ID"),client=Deno.env.get("ZOOM_CLIENT_ID"),secret=Deno.env.get("ZOOM_CLIENT_SECRET");
  if(!account||!client||!secret) return new Response(JSON.stringify({error:"Zoom API credentials not configured. QA meeting-link generation is not enabled yet."}),{status:503,headers:{...cors,"Content-Type":"application/json"}});
  const basic=btoa(client+":"+secret);
  const tokenRes=await fetch("https://zoom.us/oauth/token?grant_type=account_credentials&account_id="+encodeURIComponent(account),{method:"POST",headers:{Authorization:"Basic "+basic}});
  const tokenJson=await tokenRes.json(); if(!tokenRes.ok) throw new Error("Zoom OAuth token request failed");
  const meetingRes=await fetch("https://api.zoom.us/v2/users/me/meetings",{method:"POST",headers:{Authorization:"Bearer "+tokenJson.access_token,"Content-Type":"application/json"},body:JSON.stringify({topic:title,type:2,start_time:start.toISOString(),duration:90,timezone:"Asia/Kolkata",settings:{join_before_host:false,waiting_room:true,host_video:true,participant_video:true}})});
  const meeting=await meetingRes.json(); if(!meetingRes.ok) throw new Error("Zoom meeting creation failed");
  const {data:row,error:saveErr}=await sb.from("fr_learn_sessions").insert({teacher_id:user.id,student_id,course_id,title,scheduled_start:start.toISOString(),duration_minutes:90,zoom_meeting_id:String(meeting.id),zoom_join_url:meeting.join_url,zoom_start_url:meeting.start_url,status:"scheduled"}).select("id,title,scheduled_start,duration_minutes,zoom_meeting_id,zoom_join_url,status").single();
  if(saveErr) throw saveErr;
  return new Response(JSON.stringify({session:row}),{headers:{...cors,"Content-Type":"application/json"}});
 } catch(e) { return new Response(JSON.stringify({error:String(e?.message||e)}),{status:400,headers:{...cors,"Content-Type":"application/json"}}); }
});
