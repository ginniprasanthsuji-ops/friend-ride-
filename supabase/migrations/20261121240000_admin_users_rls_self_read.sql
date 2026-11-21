-- Restrict admin membership lookup to the authenticated user's own row.
-- This supports client-side role verification without exposing admin membership lists.
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS admin_users_self_select ON public.admin_users;
CREATE POLICY admin_users_self_select
ON public.admin_users
FOR SELECT
TO authenticated
USING (user_id = auth.uid());
