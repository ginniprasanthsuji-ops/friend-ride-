// Create/reuse a recurring Zoom classroom for a teacher-student-course pair.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json"}});
serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 try{
  const auth=req.headers.get("Authorization");if(!auth)throw new Error("Authorization required");
  const sb=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_ANON_KEY")!,{global:{headers:{Authorization:auth}}});
  const {data:{user},error:userErr}=await sb.auth.getUser();if(userErr||!user)throw new Error("Invalid user");
  const {student_id,course_id,title,scheduled_start}=await req.json();
  if(!student_id||!course_id||!title||!scheduled_start)throw new Error("Student, course, title and schedule are required");
  const start=new Date(scheduled_start);if(isNaN(start.valueOf())||start<=new Date())throw new Error("Session must be scheduled in the future");
  const {data:teacher,error:teacherErr}=await sb.from("fr_learn_teacher_profiles").select("approval_status").eq("teacher_id",user.id).single();
  if(teacherErr||teacher?.approval_status!=="approved")throw new Error("Approved teacher required");
  const {data:course,error:courseErr}=await sb.from("fr_learn_courses").select("id,course_name,teacher_id,approval_status").eq("id",course_id).single();
  if(courseErr||!course||course.teacher_id!==user.id||course.approval_status!=="approved")throw new Error("Approved course owned by this teacher required");
  const {data:enrollment,error:enrollErr}=await sb.from("fr_learn_enrollments").select("id").eq("student_id",student_id).eq("course_id",course_id).eq("status","active").single();
  if(enrollErr||!enrollment)throw new Error("Active student enrollment required");
  const account=Deno.env.get("ZOOM_ACCOUNT_ID"),client=Deno.env.get("ZOOM_CLIENT_ID"),secret=Deno.env.get("ZOOM_CLIENT_SECRET"),host=Deno.env.get("ZOOM_HOST_USER");
  if(!account||!client||!secret||!host)return json({error:"Zoom QA secrets missing. Configure Account ID, Client ID, Client Secret, and host user/email."},503);
  const {data:existing,error:roomErr}=await sb.from("fr_learn_zoom_classrooms").select("id,zoom_meeting_id,zoom_join_url,title").eq("teacher_id",user.id).eq("student_id",student_id).eq("course_id",course_id).maybeSingle();
  if(roomErr)throw roomErr;
  let room=existing;
  if(!room){
   const tokenRes=await fetch("https://zoom.us/oauth/token?grant_type=account_credentials&account_id="+encodeURIComponent(account),{method:"POST",headers:{Authorization:"Basic "+btoa(client+":"+secret)}});
   const tokenJson=await tokenRes.json();if(!tokenRes.ok)throw new Error("Zoom OAuth token request failed");
   const meetingRes=await fetch("https://api.zoom.us/v2/users/"+encodeURIComponent(host)+"/meetings",{method:"POST",headers:{Authorization:"Bearer "+tokenJson.access_token,"Content-Type":"application/json"},body:JSON.stringify({topic:title,type:3,timezone:"Asia/Kolkata",settings:{join_before_host:false,waiting_room:true,host_video:true,participant_video:true,meeting_authentication:false}})});
   const meeting=await meetingRes.json();if(!meetingRes.ok)throw new Error("Zoom recurring meeting creation failed");
   const {data:saved,error:saveRoomErr}=await sb.from("fr_learn_zoom_classrooms").insert({teacher_id:user.id,student_id,course_id,title,zoom_meeting_id:String(meeting.id),zoom_join_url:meeting.join_url}).select("id,zoom_meeting_id,zoom_join_url,title").single();
   if(saveRoomErr)throw saveRoomErr;room=saved;
  }
  const {data:session,error:sessionErr}=await sb.from("fr_learn_sessions").insert({teacher_id:user.id,student_id,course_id,classroom_id:room.id,title,scheduled_start:start.toISOString(),duration_minutes:90,zoom_meeting_id:room.zoom_meeting_id,zoom_join_url:room.zoom_join_url,status:"scheduled"}).select("id,title,scheduled_start,duration_minutes,zoom_meeting_id,zoom_join_url,status,classroom_id").single();
  if(sessionErr)throw sessionErr;
  return json({session,classroom:{id:room.id,title:room.title,zoom_meeting_id:room.zoom_meeting_id,zoom_join_url:room.zoom_join_url,reused:!!existing}});
 }catch(e){return json({error:String(e?.message||e)},400);}
});
