-- Mutual teacher/student confirmation for scheduled classroom times (QA only)
alter table public.fr_learn_sessions drop constraint if exists fr_learn_sessions_status_check;
alter table public.fr_learn_sessions add constraint fr_learn_sessions_status_check check(status in ('pending_confirmation','scheduled','started','completed','cancelled'));
alter table public.fr_learn_sessions alter column status set default 'pending_confirmation';
