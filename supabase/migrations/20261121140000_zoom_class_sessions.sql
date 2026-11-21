-- Zoom classroom sessions (QA branch only)
create table if not exists public.fr_learn_sessions (
 id uuid primary key default gen_random_uuid(),
 teacher_id uuid not null references auth.users(id) on delete cascade,
 student_id uuid not null references auth.users(id) on delete cascade,
 course_id uuid references public.fr_learn_courses(id) on delete set null,
 title text not null,
 scheduled_start timestamptz not null,
 duration_minutes int not null default 90 check(duration_minutes=90),
 zoom_meeting_id text,
 zoom_join_url text,
 zoom_start_url text,
 status text not null default 'scheduled' check(status in ('scheduled','started','completed','cancelled')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check(teacher_id<>student_id)
);
alter table public.fr_learn_sessions enable row level security;
create policy learn_sessions_participant_select on public.fr_learn_sessions for select to authenticated using (teacher_id=(select auth.uid()) or student_id=(select auth.uid()) or exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));
create policy learn_sessions_teacher_insert on public.fr_learn_sessions for insert to authenticated with check (teacher_id=(select auth.uid()) and exists(select 1 from public.fr_learn_teacher_profiles t where t.teacher_id=(select auth.uid()) and t.approval_status='approved') and exists(select 1 from public.fr_learn_enrollments e where e.student_id=student_id and e.course_id=fr_learn_sessions.course_id and e.status='active'));
create policy learn_sessions_participant_update on public.fr_learn_sessions for update to authenticated using (teacher_id=(select auth.uid()) or student_id=(select auth.uid())) with check (teacher_id=(select auth.uid()) or student_id=(select auth.uid()));
grant select,insert,update on public.fr_learn_sessions to authenticated;
