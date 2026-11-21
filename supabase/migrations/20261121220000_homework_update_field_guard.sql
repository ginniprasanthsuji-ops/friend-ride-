create or replace function public.fr_learn_homework_update_guard()
returns trigger
language plpgsql
security invoker
set search_path=public
as $$
begin
 if auth.uid()=old.student_id then
   if new.id is distinct from old.id or new.session_id is distinct from old.session_id or new.teacher_id is distinct from old.teacher_id or new.student_id is distinct from old.student_id or new.homework_date is distinct from old.homework_date or new.teacher_approved is distinct from old.teacher_approved or new.teacher_approved_at is distinct from old.teacher_approved_at or new.teacher_feedback is distinct from old.teacher_feedback or new.created_at is distinct from old.created_at then
     raise exception 'Student may only update homework checklist and confirmation fields';
   end if;
 elsif auth.uid()=old.teacher_id then
   if new.id is distinct from old.id or new.session_id is distinct from old.session_id or new.teacher_id is distinct from old.teacher_id or new.student_id is distinct from old.student_id or new.homework_date is distinct from old.homework_date or new.checklist is distinct from old.checklist or new.student_confirmed is distinct from old.student_confirmed or new.student_confirmed_at is distinct from old.student_confirmed_at or new.created_at is distinct from old.created_at then
     raise exception 'Teacher may only update approval and feedback fields';
   end if;
 else
   raise exception 'Homework update not authorized';
 end if;
 new.updated_at=now();
 return new;
end;
$$;
drop trigger if exists fr_learn_homework_update_guard_trigger on public.fr_learn_homework;
create trigger fr_learn_homework_update_guard_trigger before update on public.fr_learn_homework for each row execute function public.fr_learn_homework_update_guard();
