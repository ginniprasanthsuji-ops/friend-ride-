-- Student homework checklist and teacher approval gate before classroom join.
create table if not exists public.fr_learn_homework (
 id uuid primary key default gen_random_uuid(),
 session_id uuid not null references public.fr_learn_sessions(id) on delete cascade,
 teacher_id uuid not null references auth.users(id) on delete cascade,
 student_id uuid not null references auth.users(id) on delete cascade,
 homework_date date not null default current_date,
 checklist jsonb not null default '[]'::jsonb,
 student_confirmed boolean not null default false,
 student_confirmed_at timestamptz,
 teacher_approved boolean not null default false,
 teacher_approved_at timestamptz,
 teacher_feedback text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(session_id,homework_date),
 constraint fr_learn_homework_checklist_array check(jsonb_typeof(checklist)='array')
);
alter table public.fr_learn_homework enable row level security;
drop policy if exists learn_homework_participant_select on public.fr_learn_homework;
create policy learn_homework_participant_select on public.fr_learn_homework for select to authenticated using (auth.uid()=teacher_id or auth.uid()=student_id);
drop policy if exists learn_homework_student_insert on public.fr_learn_homework;
create policy learn_homework_student_insert on public.fr_learn_homework for insert to authenticated with check(auth.uid()=student_id and student_confirmed=false and teacher_approved=false);
drop policy if exists learn_homework_student_update on public.fr_learn_homework;
create policy learn_homework_student_update on public.fr_learn_homework for update to authenticated using(auth.uid()=student_id and teacher_approved=false) with check(auth.uid()=student_id and teacher_approved=false);
drop policy if exists learn_homework_teacher_update on public.fr_learn_homework;
create policy learn_homework_teacher_update on public.fr_learn_homework for update to authenticated using(auth.uid()=teacher_id and student_confirmed=true) with check(auth.uid()=teacher_id and student_confirmed=true);
grant select,insert,update on public.fr_learn_homework to authenticated;
