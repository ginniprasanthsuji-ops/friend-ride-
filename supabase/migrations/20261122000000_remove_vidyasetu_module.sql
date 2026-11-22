-- FRIEND RIDE QA-only cleanup for retired VidyaSetu/Learn-Teach module.
-- Guard: stop if any learning table contains user data. Back up and review before deleting populated tables.
DO $guard$
DECLARE
  t text;
  n bigint;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'fr_learn_courses','fr_learn_enrollments','fr_learn_homework',
    'fr_learn_institute_enquiries','fr_learn_institutes','fr_learn_sessions',
    'fr_learn_students','fr_learn_teacher_profiles','fr_learn_teacher_subscriptions',
    'fr_learn_tuition_applications','fr_learn_tuition_requests','fr_learn_zoom_classrooms'
  ] LOOP
    IF to_regclass(format('public.%I',t)) IS NOT NULL THEN
      EXECUTE format('SELECT count(*) FROM public.%I',t) INTO n;
      IF n > 0 THEN
        RAISE EXCEPTION 'Cleanup aborted: public.% contains % rows. Backup and review first.',t,n;
      END IF;
    END IF;
  END LOOP;
END
$guard$;

-- Child tables first. CASCADE is limited to dependencies attached to these retired module objects.
DROP TABLE IF EXISTS public.fr_learn_homework CASCADE;
DROP TABLE IF EXISTS public.fr_learn_sessions CASCADE;
DROP TABLE IF EXISTS public.fr_learn_zoom_classrooms CASCADE;
DROP TABLE IF EXISTS public.fr_learn_tuition_applications CASCADE;
DROP TABLE IF EXISTS public.fr_learn_tuition_requests CASCADE;
DROP TABLE IF EXISTS public.fr_learn_institute_enquiries CASCADE;
DROP TABLE IF EXISTS public.fr_learn_institutes CASCADE;
DROP TABLE IF EXISTS public.fr_learn_enrollments CASCADE;
DROP TABLE IF EXISTS public.fr_learn_teacher_subscriptions CASCADE;
DROP TABLE IF EXISTS public.fr_learn_teacher_profiles CASCADE;
DROP TABLE IF EXISTS public.fr_learn_students CASCADE;
DROP TABLE IF EXISTS public.fr_learn_courses CASCADE;

DROP FUNCTION IF EXISTS public.fr_learn_guard_owner_updates();
DROP FUNCTION IF EXISTS public.fr_learn_homework_update_guard();
