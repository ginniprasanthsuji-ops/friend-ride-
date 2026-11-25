-- Phase 13 QA security hardening: pin SECURITY DEFINER search paths to empty.
-- All application references are schema-qualified. Optional QA-only objects are guarded.
DO $$
DECLARE v_proc regprocedure;
BEGIN
  v_proc := to_regprocedure('public.fr_admin_confirm_pending_earning(uuid)');
  IF v_proc IS NOT NULL THEN EXECUTE format('ALTER FUNCTION %s SET search_path TO %L', v_proc, ''); END IF;
  v_proc := to_regprocedure('public.fr_admin_post_earnings_ledger(uuid,text,text,text,uuid,numeric,text,text,text)');
  IF v_proc IS NOT NULL THEN EXECUTE format('ALTER FUNCTION %s SET search_path TO %L', v_proc, ''); END IF;
  v_proc := to_regprocedure('public.fr_get_my_earnings_balance()');
  IF v_proc IS NOT NULL THEN EXECUTE format('ALTER FUNCTION %s SET search_path TO %L', v_proc, ''); END IF;
  v_proc := to_regprocedure('public.fr_create_notification_preferences_for_new_user()');
  IF v_proc IS NOT NULL THEN EXECUTE format('ALTER FUNCTION %s SET search_path TO %L', v_proc, ''); END IF;
  v_proc := to_regprocedure('public.qa_guard_profile_privileged_fields()');
  IF v_proc IS NOT NULL THEN EXECUTE format('ALTER FUNCTION %s SET search_path TO %L', v_proc, ''); END IF;
END $$;
