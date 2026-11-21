-- FRIEND RIDE Learn & Teach marketplace (QA only; do not deploy to production until reviewed)
create table if not exists public.fr_learn_students (
  student_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.fr_learn_teacher_profiles (
  teacher_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  qualification text,
  subjects jsonb not null default '[]'::jsonb,
  experience_years int not null default 0 check (experience_years between 0 and 60),
  teaching_modes text[] not null default '{}',
  area text,
  bio text,
  approval_status text not null default 'pending' check (approval_status in ('pending','approved','rejected','suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.fr_learn_teacher_subscriptions (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  amount_inr int not null default 129 check (amount_inr = 129),
  plan_months int not null default 1 check (plan_months = 1),
  status text not null default 'pending_payment' check (status in ('pending_payment','active','expired','cancelled')),
  payment_reference text,
  starts_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.fr_learn_courses (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  course_name text not null,
  category text not null,
  class_level text,
  mode text not null default 'Online' check (mode in ('Online','Offline','Online & Offline','Home Tuition')),
  monthly_fee int not null default 599 check (monthly_fee = 599),
  approval_status text not null default 'pending' check (approval_status in ('pending','approved','rejected','suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.fr_learn_enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.fr_learn_courses(id) on delete cascade,
  monthly_fee int not null default 599 check (monthly_fee = 599),
  status text not null default 'pending_payment' check (status in ('pending_payment','active','cancelled','completed')),
  schedule_note text,
  created_at timestamptz not null default now(),
  unique(student_id,course_id)
);
create table if not exists public.fr_learn_tuition_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  class_level text not null,
  subject text not null,
  area text not null,
  preferred_schedule text,
  mode text not null default 'Home Tuition' check (mode in ('Home Tuition','Online','Offline Center')),
  details text,
  status text not null default 'open' check (status in ('open','matched','closed','cancelled')),
  created_at timestamptz not null default now()
);
create table if not exists public.fr_learn_tuition_applications (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.fr_learn_tuition_requests(id) on delete cascade,
  teacher_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','rejected','withdrawn')),
  created_at timestamptz not null default now(),
  unique(request_id,teacher_id)
);
create table if not exists public.fr_learn_institutes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  institute_name text not null,
  courses text,
  area text not null,
  mode text not null default 'Offline' check (mode in ('Offline','Online','Online & Offline')),
  approval_status text not null default 'pending' check (approval_status in ('pending','approved','rejected','suspended')),
  created_at timestamptz not null default now()
);
create table if not exists public.fr_learn_institute_enquiries (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  institute_id uuid not null references public.fr_learn_institutes(id) on delete cascade,
  status text not null default 'new' check (status in ('new','contacted','enrolled','closed')),
  created_at timestamptz not null default now()
);
alter table public.fr_learn_students enable row level security;
alter table public.fr_learn_teacher_profiles enable row level security;
alter table public.fr_learn_teacher_subscriptions enable row level security;
alter table public.fr_learn_courses enable row level security;
alter table public.fr_learn_enrollments enable row level security;
alter table public.fr_learn_tuition_requests enable row level security;
alter table public.fr_learn_tuition_applications enable row level security;
alter table public.fr_learn_institutes enable row level security;
alter table public.fr_learn_institute_enquiries enable row level security;

-- Student records: owner and admin.
create policy "learn_student_owner_select" on public.fr_learn_students for select to authenticated using (student_id = (select auth.uid()) or exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));
create policy "learn_student_owner_insert" on public.fr_learn_students for insert to authenticated with check (student_id = (select auth.uid()));
create policy "learn_student_owner_update" on public.fr_learn_students for update to authenticated using (student_id=(select auth.uid())) with check (student_id=(select auth.uid()));

-- Teacher profile: public can see approved teachers only; owner can see own; admin manages.
create policy "learn_teacher_public_or_owner_select" on public.fr_learn_teacher_profiles for select to anon, authenticated using (approval_status='approved' or teacher_id=(select auth.uid()) or exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));
create policy "learn_teacher_owner_insert" on public.fr_learn_teacher_profiles for insert to authenticated with check (teacher_id=(select auth.uid()) and approval_status='pending');
create policy "learn_teacher_owner_update" on public.fr_learn_teacher_profiles for update to authenticated using (teacher_id=(select auth.uid())) with check (teacher_id=(select auth.uid()) and approval_status='pending');
create policy "learn_teacher_admin_update" on public.fr_learn_teacher_profiles for update to authenticated using (exists(select 1 from public.admin_users a where a.user_id=(select auth.uid()))) with check (exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));

-- Teacher subscriptions: users can request a subscription; admin handles activation after payment verification.
create policy "learn_subscription_owner_select" on public.fr_learn_teacher_subscriptions for select to authenticated using (teacher_id=(select auth.uid()) or exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));
create policy "learn_subscription_owner_insert_pending" on public.fr_learn_teacher_subscriptions for insert to authenticated with check (teacher_id=(select auth.uid()) and status='pending_payment' and amount_inr=129 and plan_months=1);
create policy "learn_subscription_admin_update" on public.fr_learn_teacher_subscriptions for update to authenticated using (exists(select 1 from public.admin_users a where a.user_id=(select auth.uid()))) with check (exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));

-- Course marketplace: approved courses are public. Owner requires active subscription to add; admin reviews.
create policy "learn_course_public_owner_admin_select" on public.fr_learn_courses for select to anon, authenticated using (approval_status='approved' or teacher_id=(select auth.uid()) or exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));
create policy "learn_course_teacher_insert_active" on public.fr_learn_courses for insert to authenticated with check (teacher_id=(select auth.uid()) and approval_status='pending' and monthly_fee=599 and exists(select 1 from public.fr_learn_teacher_profiles t where t.teacher_id=(select auth.uid()) and t.approval_status='approved') and exists(select 1 from public.fr_learn_teacher_subscriptions s where s.teacher_id=(select auth.uid()) and s.status='active' and s.expires_at>now()));
create policy "learn_course_teacher_update" on public.fr_learn_courses for update to authenticated using (teacher_id=(select auth.uid())) with check (teacher_id=(select auth.uid()) and approval_status='pending');
create policy "learn_course_admin_update" on public.fr_learn_courses for update to authenticated using (exists(select 1 from public.admin_users a where a.user_id=(select auth.uid()))) with check (exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));

-- Enrollments: student owns; teacher can see enrollments for their courses; admin can see all.
create policy "learn_enrollment_select_owners" on public.fr_learn_enrollments for select to authenticated using (student_id=(select auth.uid()) or exists(select 1 from public.fr_learn_courses c where c.id=course_id and c.teacher_id=(select auth.uid())) or exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));
create policy "learn_enrollment_student_insert_pending" on public.fr_learn_enrollments for insert to authenticated with check (student_id=(select auth.uid()) and monthly_fee=599 and status='pending_payment' and exists(select 1 from public.fr_learn_courses c where c.id=course_id and c.approval_status='approved'));
create policy "learn_enrollment_owner_update" on public.fr_learn_enrollments for update to authenticated using (student_id=(select auth.uid())) with check (student_id=(select auth.uid()));

-- Tuition requests: requester owns; approved teachers can view open requests and apply.
create policy "learn_tuition_request_select" on public.fr_learn_tuition_requests for select to authenticated using (student_id=(select auth.uid()) or (status='open' and exists(select 1 from public.fr_learn_teacher_profiles t where t.teacher_id=(select auth.uid()) and t.approval_status='approved')) or exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));
create policy "learn_tuition_request_insert" on public.fr_learn_tuition_requests for insert to authenticated with check (student_id=(select auth.uid()) and status='open');
create policy "learn_tuition_request_owner_update" on public.fr_learn_tuition_requests for update to authenticated using (student_id=(select auth.uid())) with check (student_id=(select auth.uid()));
create policy "learn_tuition_application_select" on public.fr_learn_tuition_applications for select to authenticated using (teacher_id=(select auth.uid()) or exists(select 1 from public.fr_learn_tuition_requests r where r.id=request_id and r.student_id=(select auth.uid())) or exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));
create policy "learn_tuition_application_teacher_insert" on public.fr_learn_tuition_applications for insert to authenticated with check (teacher_id=(select auth.uid()) and status='pending' and exists(select 1 from public.fr_learn_teacher_profiles t where t.teacher_id=(select auth.uid()) and t.approval_status='approved') and exists(select 1 from public.fr_learn_teacher_subscriptions s where s.teacher_id=(select auth.uid()) and s.status='active' and s.expires_at>now()));
create policy "learn_tuition_application_student_update" on public.fr_learn_tuition_applications for update to authenticated using (exists(select 1 from public.fr_learn_tuition_requests r where r.id=request_id and r.student_id=(select auth.uid()))) with check (exists(select 1 from public.fr_learn_tuition_requests r where r.id=request_id and r.student_id=(select auth.uid())));

-- Institute listings and enquiries.
create policy "learn_institute_public_owner_admin_select" on public.fr_learn_institutes for select to anon, authenticated using (approval_status='approved' or owner_id=(select auth.uid()) or exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));
create policy "learn_institute_owner_insert_pending" on public.fr_learn_institutes for insert to authenticated with check (owner_id=(select auth.uid()) and approval_status='pending');
create policy "learn_institute_owner_update_pending" on public.fr_learn_institutes for update to authenticated using (owner_id=(select auth.uid())) with check (owner_id=(select auth.uid()) and approval_status='pending');
create policy "learn_institute_admin_update" on public.fr_learn_institutes for update to authenticated using (exists(select 1 from public.admin_users a where a.user_id=(select auth.uid()))) with check (exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));
create policy "learn_institute_enquiry_select" on public.fr_learn_institute_enquiries for select to authenticated using (student_id=(select auth.uid()) or exists(select 1 from public.fr_learn_institutes i where i.id=institute_id and i.owner_id=(select auth.uid())) or exists(select 1 from public.admin_users a where a.user_id=(select auth.uid())));
create policy "learn_institute_enquiry_insert" on public.fr_learn_institute_enquiries for insert to authenticated with check (student_id=(select auth.uid()) and status='new' and exists(select 1 from public.fr_learn_institutes i where i.id=institute_id and i.approval_status='approved'));

grant select on public.fr_learn_teacher_profiles, public.fr_learn_courses, public.fr_learn_institutes to anon;
grant select, insert, update on public.fr_learn_students, public.fr_learn_teacher_profiles, public.fr_learn_teacher_subscriptions, public.fr_learn_courses, public.fr_learn_enrollments, public.fr_learn_tuition_requests, public.fr_learn_tuition_applications, public.fr_learn_institutes, public.fr_learn_institute_enquiries to authenticated;
grant select, insert on public.fr_learn_teacher_subscriptions to authenticated;
