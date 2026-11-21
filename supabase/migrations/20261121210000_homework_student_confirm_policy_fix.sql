drop policy if exists learn_homework_student_insert on public.fr_learn_homework;
create policy learn_homework_student_insert on public.fr_learn_homework for insert to authenticated with check(auth.uid()=student_id and student_confirmed=true and teacher_approved=false);
drop policy if exists learn_homework_student_update on public.fr_learn_homework;
create policy learn_homework_student_update on public.fr_learn_homework for update to authenticated using(auth.uid()=student_id and teacher_approved=false) with check(auth.uid()=student_id and teacher_approved=false and teacher_approved_at is null);
drop policy if exists learn_homework_teacher_update on public.fr_learn_homework;
create policy learn_homework_teacher_update on public.fr_learn_homework for update to authenticated using(auth.uid()=teacher_id and student_confirmed=true) with check(auth.uid()=teacher_id and student_confirmed=true);
