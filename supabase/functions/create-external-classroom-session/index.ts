// Simple external classroom URL workflow (no Zoom OAuth or API secrets).
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const reply=(b,s=200)=>new Response(JSON.stringify(b),{status:s,headers:{...cors,"Content-Type":"application/json"}});
serve(async req=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 try{
  const auth=req.headers.get("Authorization");if(!auth)throw new Error("Login required");
  const url=Deno.env.get("SUPABASE_URL")!,anon=Deno.env.get("SUPABASE_ANON_KEY")!,service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const userClient=createClient(url,anon,{global:{headers:{Authorization:auth}}});
  const {data:{user},error:userErr}=await userClient.auth.getUser();if(userErr||!user)throw new Error("Invalid login");
  const admin=createClient(url,service);
  const {student_id,course_id,title,scheduled_start,external_classroom_url}=await req.json();
  if(!student_id||!course_id||!title||!scheduled_start||!external_classroom_url)throw new Error("All fields including classroom link are required");
  let link;try{link=new URL(external_classroom_url);}catch{throw new Error("Please enter a valid external meeting URL");}
  if(!["https:","http:"].includes(link.protocol))throw new Error("Only HTTP/HTTPS classroom links are accepted");
  const start=new Date(scheduled_start);if(isNaN(start.valueOf())||start<=new Date())throw new Error("Choose a future class time");
  const {data:teacher,error:teacherErr}=await userClient.from("fr_learn_teacher_profiles").select("approval_status").eq("teacher_id",user.id).single();
  if(teacherErr||teacher?.approval_status!=="approved")throw new Error("Approved teacher required");
  const {data:course,error:courseErr}=await userClient.from("fr_learn_courses").select("id,teacher_id,approval_status").eq("id",course_id).single();
  if(courseErr||!course||course.teacher_id!==user.id||course.approval_status!=="approved")throw new Error("Approved course owned by this teacher required");
  const {data:enroll,error:enrollErr}=await userClient.from("fr_learn_enrollments").select("id").eq("student_id",student_id).eq("course_id",course_id).eq("status","active").single();
  if(enrollErr||!enroll)throw new Error("Active student enrollment required");
  const {data:existing,error:roomErr}=await admin.from("fr_learn_zoom_classrooms").select("id").eq("teacher_id",user.id).eq("student_id",student_id).eq("course_id",course_id).maybeSingle();
  if(roomErr)throw roomErr;
  let roomId=existing?.id;
  if(roomId){
   const {error:updateRoom}=await admin.from("fr_learn_zoom_classrooms").update({title,zoom_join_url:link.toString(),external_classroom_url:link.toString(),updated_at:new Date().toISOString()}).eq("id",roomId);
   if(updateRoom)throw updateRoom;
  }else{
   const {data:room,error:createRoom}=await admin.from("fr_learn_zoom_classrooms").insert({teacher_id:user.id,student_id,course_id,title,zoom_meeting_id:"external",zoom_join_url:link.toString(),external_classroom_url:link.toString()}).select("id").single();
   if(createRoom)throw createRoom;roomId=room.id;
  }
  const {data:session,error:sessionErr}=await admin.from("fr_learn_sessions").insert({teacher_id:user.id,student_id,course_id,classroom_id:roomId,title,scheduled_start:start.toISOString(),duration_minutes:90,zoom_meeting_id:"external",zoom_join_url:link.toString(),external_classroom_url:link.toString(),status:"pending_confirmation"}).select("id,title,scheduled_start,duration_minutes,status,classroom_id").single();
  if(sessionErr)throw sessionErr;
  return reply({session,message:"Class request created. Student confirmation is required before joining."});
 }catch(e){return reply({error:String(e?.message||e)},400);}
});
