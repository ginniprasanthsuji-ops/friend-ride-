-- Teacher eligibility tiers and one-person coaching center eligibility (QA only)
alter table public.fr_learn_teacher_profiles
  add column if not exists eligibility_level text,
  add column if not exists teach_up_to text,
  add column if not exists bed_subject text;

alter table public.fr_learn_teacher_profiles
  drop constraint if exists fr_learn_teacher_profiles_eligibility_level_check;
alter table public.fr_learn_teacher_profiles
  add constraint fr_learn_teacher_profiles_eligibility_level_check
  check (eligibility_level is null or eligibility_level in ('10th','intermediate','degree','bed','other'));

alter table public.fr_learn_institutes
  add column if not exists owner_eligibility text,
  add column if not exists owner_teach_up_to text;

alter table public.fr_learn_institutes
  drop constraint if exists fr_learn_institutes_owner_eligibility_check;
alter table public.fr_learn_institutes
  add constraint fr_learn_institutes_owner_eligibility_check
  check (owner_eligibility is null or owner_eligibility in ('10th','intermediate','degree','bed','other'));

alter table public.fr_learn_institutes
  drop constraint if exists fr_learn_institutes_one_person_teaching_range_check;
alter table public.fr_learn_institutes
  add constraint fr_learn_institutes_one_person_teaching_range_check
  check (
    center_type <> 'one_person'
    or owner_eligibility is null
    or (owner_eligibility='10th' and owner_teach_up_to in ('6'))
    or (owner_eligibility='intermediate' and owner_teach_up_to in ('6','8'))
    or (owner_eligibility='degree' and owner_teach_up_to in ('6','8','10'))
    or (owner_eligibility='bed' and owner_teach_up_to='subject')
    or owner_eligibility='other'
  );

comment on column public.fr_learn_teacher_profiles.eligibility_level is 'Teacher registration tier: 10th, intermediate, degree, B.Ed, or other; admin verifies.';
comment on column public.fr_learn_teacher_profiles.teach_up_to is 'Teaching level/range selected by teacher, subject to tier validation and admin review.';
comment on column public.fr_learn_institutes.owner_eligibility is 'One-person coaching center operator qualification tier.';
