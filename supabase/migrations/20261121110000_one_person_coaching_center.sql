-- One-person coaching center support (QA branch only)
alter table public.fr_learn_institutes
  add column if not exists center_type text not null default 'multi_teacher',
  add column if not exists teacher_count int,
  add column if not exists subjects jsonb not null default '[]'::jsonb,
  add column if not exists daily_hours numeric,
  add column if not exists period_hours jsonb not null default '[]'::jsonb;

alter table public.fr_learn_institutes
  drop constraint if exists fr_learn_institutes_center_type_check;
alter table public.fr_learn_institutes
  add constraint fr_learn_institutes_center_type_check
  check (center_type in ('multi_teacher','one_person'));

alter table public.fr_learn_institutes
  drop constraint if exists fr_learn_institutes_teacher_count_check;
alter table public.fr_learn_institutes
  add constraint fr_learn_institutes_teacher_count_check
  check (teacher_count is null or teacher_count >= 1);

alter table public.fr_learn_institutes
  drop constraint if exists fr_learn_institutes_daily_hours_check;
alter table public.fr_learn_institutes
  add constraint fr_learn_institutes_daily_hours_check
  check (daily_hours is null or daily_hours between 4 and 5);

alter table public.fr_learn_institutes
  drop constraint if exists fr_learn_institutes_one_person_count_check;
alter table public.fr_learn_institutes
  add constraint fr_learn_institutes_one_person_count_check
  check (center_type <> 'one_person' or teacher_count = 1);

comment on column public.fr_learn_institutes.center_type is 'multi_teacher or one_person; one-person centers are operated by one teacher who may teach multiple subjects.';
comment on column public.fr_learn_institutes.daily_hours is 'Total daily coaching hours, 4 to 5; period-wise with breaks allowed.';
comment on column public.fr_learn_institutes.period_hours is 'JSON array of period durations; application validates sum equals daily_hours.';
