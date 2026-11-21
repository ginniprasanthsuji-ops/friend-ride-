-- Allow approved teachers/institutes to manage their own draft catalogue; publication stays admin controlled.
drop policy if exists "learn teach provider course insert" on public.learn_teach_courses;
create policy "learn teach provider course insert" on public.learn_teach_courses for insert to authenticated
with check (provider_user_id=auth.uid() and published=false and exists(select 1 from public.learn_teach_accounts a where a.user_id=auth.uid() and a.account_type in ('teacher','institute') and a.approval_status='approved'));
drop policy if exists "learn teach provider course update" on public.learn_teach_courses;
create policy "learn teach provider course update" on public.learn_teach_courses for update to authenticated
using (provider_user_id=auth.uid() and exists(select 1 from public.learn_teach_accounts a where a.user_id=auth.uid() and a.approval_status='approved'))
with check (provider_user_id=auth.uid() and published=false and exists(select 1 from public.learn_teach_accounts a where a.user_id=auth.uid() and a.approval_status='approved'));
drop policy if exists "learn teach provider request read" on public.learn_teach_requests;
create policy "learn teach provider request read" on public.learn_teach_requests for select to authenticated
using (assigned_provider_id=auth.uid() or (assigned_provider_id is null and exists(select 1 from public.learn_teach_accounts a where a.user_id=auth.uid() and a.approval_status='approved' and a.account_type in ('teacher','institute'))));
