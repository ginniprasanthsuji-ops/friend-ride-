-- FRIEND RIDE Learn & Teach education marketplace
create table if not exists public.learn_teach_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  account_type text not null check (account_type in ('student','teacher','institute')),
  display_name text not null,
  phone text,
  email text,
  qualification text,
  subjects text[] not null default '{}',
  teaching_experience_years integer not null default 0 check (teaching_experience_years >= 0),
  teaching_modes text[] not null default '{}',
  location text,
  bio text,
  approval_status text not null default 'pending' check (approval_status in ('pending','approved','rejected','suspended')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.learn_teach_courses (
  id uuid primary key default gen_random_uuid(),
  provider_user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  category text not null,
  description text,
  delivery_mode text not null default 'online' check (delivery_mode in ('online','offline','hybrid')),
  location text,
  fee numeric(10,2) not null default 0 check (fee >= 0),
  published boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.learn_teach_requests (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references auth.users(id) on delete cascade,
  request_type text not null check (request_type in ('course_enrollment','home_tuition','class_join','coaching')),
  subject text,
  class_level text,
  location text,
  preferred_mode text not null default 'online' check (preferred_mode in ('online','offline','hybrid')),
  details text,
  status text not null default 'pending' check (status in ('pending','approved','rejected','assigned','completed','cancelled')),
  assigned_provider_id uuid references auth.users(id) on delete set null,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.learn_teach_notification_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  in_app_enabled boolean not null default true,
  push_enabled boolean not null default false,
  email_enabled boolean not null default false,
  course_updates boolean not null default true,
  approval_updates boolean not null default true,
  class_reminders boolean not null default true,
  updated_at timestamptz not null default now()
);
create table if not exists public.learn_teach_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  category text not null default 'general',
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists learn_teach_accounts_status_idx on public.learn_teach_accounts(approval_status, account_type);
create index if not exists learn_teach_requests_status_idx on public.learn_teach_requests(status, created_at desc);
create index if not exists learn_teach_notifications_user_idx on public.learn_teach_notifications(user_id, created_at desc);
alter table public.learn_teach_accounts enable row level security;
alter table public.learn_teach_courses enable row level security;
alter table public.learn_teach_requests enable row level security;
alter table public.learn_teach_notification_settings enable row level security;
alter table public.learn_teach_notifications enable row level security;
create or replace function public.fr_learn_teach_is_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'); $$;
drop policy if exists "learn teach account self insert" on public.learn_teach_accounts;
create policy "learn teach account self insert" on public.learn_teach_accounts for insert to authenticated with check (user_id=auth.uid() and approval_status='pending');
drop policy if exists "learn teach account self read" on public.learn_teach_accounts;
create policy "learn teach account self read" on public.learn_teach_accounts for select to authenticated using (user_id=auth.uid() or public.fr_learn_teach_is_admin());
drop policy if exists "learn teach account admin update" on public.learn_teach_accounts;
create policy "learn teach account admin update" on public.learn_teach_accounts for update to authenticated using (public.fr_learn_teach_is_admin()) with check (public.fr_learn_teach_is_admin());
drop policy if exists "learn teach courses read" on public.learn_teach_courses;
create policy "learn teach courses read" on public.learn_teach_courses for select to authenticated using (published=true or provider_user_id=auth.uid() or public.fr_learn_teach_is_admin());
drop policy if exists "learn teach courses admin manage" on public.learn_teach_courses;
create policy "learn teach courses admin manage" on public.learn_teach_courses for all to authenticated using (public.fr_learn_teach_is_admin()) with check (public.fr_learn_teach_is_admin());
drop policy if exists "learn teach requests self insert" on public.learn_teach_requests;
create policy "learn teach requests self insert" on public.learn_teach_requests for insert to authenticated with check (student_user_id=auth.uid() and status='pending');
drop policy if exists "learn teach requests read" on public.learn_teach_requests;
create policy "learn teach requests read" on public.learn_teach_requests for select to authenticated using (student_user_id=auth.uid() or assigned_provider_id=auth.uid() or public.fr_learn_teach_is_admin());
drop policy if exists "learn teach requests admin update" on public.learn_teach_requests;
create policy "learn teach requests admin update" on public.learn_teach_requests for update to authenticated using (public.fr_learn_teach_is_admin()) with check (public.fr_learn_teach_is_admin());
drop policy if exists "learn teach settings own access" on public.learn_teach_notification_settings;
create policy "learn teach settings own access" on public.learn_teach_notification_settings for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
drop policy if exists "learn teach notifications own read" on public.learn_teach_notifications;
create policy "learn teach notifications own read" on public.learn_teach_notifications for select to authenticated using (user_id=auth.uid() or public.fr_learn_teach_is_admin());
drop policy if exists "learn teach notifications own update" on public.learn_teach_notifications;
create policy "learn teach notifications own update" on public.learn_teach_notifications for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
drop policy if exists "learn teach notifications admin insert" on public.learn_teach_notifications;
create policy "learn teach notifications admin insert" on public.learn_teach_notifications for insert to authenticated with check (public.fr_learn_teach_is_admin());
