-- Project Arjuna QA: prevent profile self-promotion and permit admin driver review.
create or replace function public.qa_guard_profile_privileged_fields()
returns trigger language plpgsql security definer set search_path=public
as $$
begin
 if auth.uid() is not null
 and not exists(select 1 from public.admin_users a where a.user_id=auth.uid())
 and (new.role is distinct from old.role
  or new.driver_approval_status is distinct from old.driver_approval_status
  or new.partner_approval_status is distinct from old.partner_approval_status) then
  raise exception 'Role and approval fields are admin-controlled';
 end if;
 return new;
end $$;
revoke all on function public.qa_guard_profile_privileged_fields() from public, anon, authenticated;
drop trigger if exists qa_guard_profile_privileged_fields on public.profiles;
create trigger qa_guard_profile_privileged_fields before update on public.profiles
for each row execute function public.qa_guard_profile_privileged_fields();
drop policy if exists qa_profiles_admin_read_drivers on public.profiles;
create policy qa_profiles_admin_read_drivers on public.profiles for select to authenticated
using(role='driver' and exists(select 1 from public.admin_users a where a.user_id=auth.uid()));
