-- FRIEND RIDE notification foundation (QA only; not deployed)
-- Server-side Edge Functions/cron must enqueue and deliver messages. Never send push from browser timers.
create table if not exists public.fr_notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  transactional_enabled boolean not null default true,
  marketing_enabled boolean not null default false,
  learning_enabled boolean not null default true,
  homework_enabled boolean not null default true,
  quiet_hours_start time not null default '22:00',
  quiet_hours_end time not null default '08:00',
  updated_at timestamptz not null default now()
);
alter table public.fr_notification_preferences enable row level security;
drop policy if exists "fr notification preferences own access" on public.fr_notification_preferences;
create policy "fr notification preferences own access" on public.fr_notification_preferences
  for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());

create table if not exists public.fr_notification_campaigns (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete set null,
  title text not null,
  body text not null,
  target_roles text[] not null default '{}',
  target_interests text[] not null default '{}',
  scheduled_at timestamptz,
  status text not null default 'draft' check(status in ('draft','scheduled','processing','sent','cancelled','failed')),
  frequency_cap_per_day integer not null default 4 check(frequency_cap_per_day between 1 and 4),
  spacing_hours integer not null default 6 check(spacing_hours between 1 and 24),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.fr_notification_campaigns enable row level security;
drop policy if exists "fr campaigns admin read" on public.fr_notification_campaigns;
create policy "fr campaigns admin read" on public.fr_notification_campaigns
  for select to authenticated using (exists(select 1 from public.admin_users a where a.user_id=auth.uid()));
drop policy if exists "fr campaigns admin write" on public.fr_notification_campaigns;
create policy "fr campaigns admin write" on public.fr_notification_campaigns
  for all to authenticated using (exists(select 1 from public.admin_users a where a.user_id=auth.uid()))
  with check (exists(select 1 from public.admin_users a where a.user_id=auth.uid()));

create table if not exists public.fr_homework_reminders (
  id uuid primary key default gen_random_uuid(),
  assignment_id text not null,
  teacher_user_id uuid references auth.users(id) on delete set null,
  student_user_id uuid not null references auth.users(id) on delete cascade,
  parent_user_id uuid references auth.users(id) on delete set null,
  title text not null,
  due_at timestamptz not null,
  completed_at timestamptz,
  reminder_before_minutes integer not null default 60 check(reminder_before_minutes between 0 and 10080),
  status text not null default 'scheduled' check(status in ('scheduled','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(assignment_id,student_user_id)
);
alter table public.fr_homework_reminders enable row level security;
drop policy if exists "fr homework reminder participants read" on public.fr_homework_reminders;
create policy "fr homework reminder participants read" on public.fr_homework_reminders
  for select to authenticated using (student_user_id=auth.uid() or teacher_user_id=auth.uid() or parent_user_id=auth.uid() or exists(select 1 from public.admin_users a where a.user_id=auth.uid()));
drop policy if exists "fr homework reminder admin manage" on public.fr_homework_reminders;
create policy "fr homework reminder admin manage" on public.fr_homework_reminders
  for all to authenticated using (exists(select 1 from public.admin_users a where a.user_id=auth.uid()))
  with check (exists(select 1 from public.admin_users a where a.user_id=auth.uid()));

create table if not exists public.fr_notification_queue (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check(category in ('transactional','marketing','learning','homework')),
  source_type text not null,
  source_id text not null,
  title text not null,
  body text not null,
  action_url text,
  scheduled_at timestamptz not null,
  status text not null default 'pending' check(status in ('pending','processing','sent','skipped','failed')),
  attempt_count integer not null default 0 check(attempt_count>=0),
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique(category,source_type,source_id,recipient_user_id)
);
create index if not exists fr_notification_queue_due_idx on public.fr_notification_queue(status,scheduled_at);
alter table public.fr_notification_queue enable row level security;
drop policy if exists "fr notification queue admin read" on public.fr_notification_queue;
create policy "fr notification queue admin read" on public.fr_notification_queue
  for select to authenticated using (exists(select 1 from public.admin_users a where a.user_id=auth.uid()));
-- No client write policy: trusted server/Edge Function (service role) owns queueing and delivery.
