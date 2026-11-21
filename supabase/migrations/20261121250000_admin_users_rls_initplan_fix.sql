-- Cache auth.uid() per statement for the self-only admin membership policy.
DROP POLICY IF EXISTS admin_users_self_select ON public.admin_users;
CREATE POLICY admin_users_self_select
ON public.admin_users
FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));
