-- Learn & Teach RLS transition hardening (QA branch only)
-- Prevent owner-side updates from changing payment/admin-controlled status or immutable ownership fields.
create or replace function public.fr_learn_guard_owner_updates()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if exists (select 1 from public.admin_users a where a.user_id = auth.uid()) then
    return new;
  end if;

  if tg_table_name = 'fr_learn_enrollments' then
    if new.student_id is distinct from old.student_id
       or new.course_id is distinct from old.course_id
       or new.monthly_fee is distinct from old.monthly_fee
       or new.created_at is distinct from old.created_at then
      raise exception 'Enrollment identity, course, fee, and creation time are immutable';
    end if;
    if new.status is distinct from old.status
       and not (old.status = 'pending_payment' and new.status = 'cancelled') then
      raise exception 'Student may only cancel a pending-payment enrollment';
    end if;
    return new;
  elsif tg_table_name = 'fr_learn_tuition_requests' then
    if new.student_id is distinct from old.student_id
       or new.created_at is distinct from old.created_at then
      raise exception 'Tuition request owner and creation time are immutable';
    end if;
    if new.status is distinct from old.status
       and not (old.status = 'open' and new.status = 'cancelled') then
      raise exception 'Student may only cancel an open tuition request';
    end if;
    return new;
  elsif tg_table_name = 'fr_learn_tuition_applications' then
    if new.request_id is distinct from old.request_id
       or new.teacher_id is distinct from old.teacher_id
       or new.created_at is distinct from old.created_at then
      raise exception 'Application identity and creation time are immutable';
    end if;
    if new.status is distinct from old.status
       and not (old.status = 'pending' and new.status in ('accepted','rejected')) then
      raise exception 'Request owner may only accept or reject a pending application';
    end if;
    return new;
  end if;
  return new;
end;
$$;

drop trigger if exists fr_learn_guard_enrollment_update on public.fr_learn_enrollments;
create trigger fr_learn_guard_enrollment_update
before update on public.fr_learn_enrollments
for each row execute function public.fr_learn_guard_owner_updates();

drop trigger if exists fr_learn_guard_tuition_request_update on public.fr_learn_tuition_requests;
create trigger fr_learn_guard_tuition_request_update
before update on public.fr_learn_tuition_requests
for each row execute function public.fr_learn_guard_owner_updates();

drop trigger if exists fr_learn_guard_tuition_application_update on public.fr_learn_tuition_applications;
create trigger fr_learn_guard_tuition_application_update
before update on public.fr_learn_tuition_applications
for each row execute function public.fr_learn_guard_owner_updates();

-- Add explicit admin update permissions for tuition requests and applications.
drop policy if exists learn_tuition_request_admin_update on public.fr_learn_tuition_requests;
create policy learn_tuition_request_admin_update on public.fr_learn_tuition_requests
for update to authenticated
using (exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())))
with check (exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));

drop policy if exists learn_tuition_application_admin_update on public.fr_learn_tuition_applications;
create policy learn_tuition_application_admin_update on public.fr_learn_tuition_applications
for update to authenticated
using (exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())))
with check (exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));
