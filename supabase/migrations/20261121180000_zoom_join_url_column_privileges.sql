-- Prevent participant clients from directly reading Zoom join URLs before confirmation.
revoke select on public.fr_learn_sessions from authenticated;
grant select (id,title,scheduled_start,duration_minutes,zoom_meeting_id,status,teacher_id,student_id,course_id,classroom_id,created_at,updated_at) on public.fr_learn_sessions to authenticated;
revoke select on public.fr_learn_zoom_classrooms from authenticated;
grant select (id,teacher_id,student_id,course_id,title,zoom_meeting_id,created_at,updated_at) on public.fr_learn_zoom_classrooms to authenticated;
