-- Phase 13 QA-only referral code apply RPC security correction.
-- Apply ONLY to the disposable FRIEND RIDE QA Supabase project; production is untouched.
-- The previous invoker function could not read another user's referral code under
-- fr_referral_codes RLS (read-own only), and fr_referrals has no client INSERT policy.
-- This narrowly-scoped SECURITY DEFINER RPC performs both operations using auth.uid().
CREATE OR REPLACE FUNCTION public.fr_referral_apply_code(p_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_referrer uuid;
  v_referral_id uuid;
  v_code text := upper(trim(coalesce(p_code, '')));
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Login required';
  END IF;
  IF v_code = '' THEN
    RAISE EXCEPTION 'Invalid referral code';
  END IF;

  SELECT c.user_id INTO v_referrer
  FROM public.fr_referral_codes c
  WHERE c.referral_code = v_code;

  IF v_referrer IS NULL THEN
    RAISE EXCEPTION 'Invalid referral code';
  END IF;
  IF v_referrer = v_uid THEN
    RAISE EXCEPTION 'Self-referral is not allowed';
  END IF;

  INSERT INTO public.fr_referrals(referrer_user_id, referee_user_id, referral_code)
  VALUES (v_referrer, v_uid, v_code)
  RETURNING id INTO v_referral_id;

  RETURN v_referral_id;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'This account already used a referral or is already referred';
END;
$$;

REVOKE ALL ON FUNCTION public.fr_referral_apply_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fr_referral_apply_code(text) TO authenticated;
