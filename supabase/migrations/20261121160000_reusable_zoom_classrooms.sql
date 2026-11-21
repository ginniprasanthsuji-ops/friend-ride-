-- Reusable Zoom classroom links for each teacher/student/course relationship (QA only)
create table if not exists public.fr_learn_zoom_classrooms (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.fr_learn_courses(id) on delete cascade,
  title text not null,
  zoom_meeting_id text not null,
  zoom_join_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(teacher_id, student_id, course_id),
  check(teacher_id<>student_id)
);
alter table public.fr_learn_zoom_classrooms enable row level security;
create policy learn_zoom_classroom_participant_select on public.fr_learn_zoom_classrooms
 for select to authenticated using (
  teacher_id=(select auth.uid()) or student_id=(select auth.uid())
  or exists(select 1 from public.admin_users a where a.user_id=(select auth.uid()))
);
create policy learn_zoom_classroom_teacher_insert on public.fr_learn_zoom_classrooms
 for insert to authenticated with check (
  teacher_id=(select auth.uid())
  and exists(select 1 from public.fr_learn_teacher_profiles t where t.teacher_id=(select auth.uid()) and t.approval_status='approved')
  and exists(select 1 from public.fr_learn_enrollments e where e.student_id=student_id and e.course_id=fr_learn_zoom_classrooms.course_id and e.status='active')
);
grant select, insert on public.fr_learn_zoom_classrooms to authenticated;
-- Host start URLs must never be stored in participant-readable rows.
alter table public.fr_learn_sessions drop column if exists zoom_start_url;
alter table public.fr_learn_sessions add column if not exists classroom_id uuid references public.fr_learn_zoom_classrooms(id) on delete set null;
create index if not exists fr_learn_zoom_classrooms_participants_idx on public.fr_learn_zoom_classrooms(teacher_id,student_id,course_id);
create index if not exists fr_learn_sessions_classroom_idx on public.fr_learn_sessions(classroom_id);
