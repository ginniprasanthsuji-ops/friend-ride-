-- QA-only dependency: this isolated Supabase QA project has admin_users but no admin helper.
-- Production/Main remains untouched.
CREATE OR REPLACE FUNCTION public.is_friend_ride_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users a
    WHERE a.user_id = auth.uid()
  );
$$;
REVOKE ALL ON FUNCTION public.is_friend_ride_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_friend_ride_admin() TO authenticated;
