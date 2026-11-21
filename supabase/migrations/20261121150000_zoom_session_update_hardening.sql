-- Restrict Zoom session modifications to trusted backend/admin. Participant client writes are disabled.
drop policy if exists learn_sessions_participant_update on public.fr_learn_sessions;
revoke update on public.fr_learn_sessions from authenticated;
create policy learn_sessions_admin_update on public.fr_learn_sessions for update to authenticated using (exists(select 1 from public.admin_users a where a.user_id=(select auth.uid()))) with check (exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));
grant update on public.fr_learn_sessions to authenticated;
