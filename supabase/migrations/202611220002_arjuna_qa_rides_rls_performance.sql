-- Project Arjuna QA-only ride RLS performance remediation.
-- Merge/apply to production only after reviewed role-boundary tests.
DROP POLICY IF EXISTS "QA customers insert own rides" ON public.rides;
CREATE POLICY "QA customers insert own rides" ON public.rides
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = customer_id);

DROP POLICY IF EXISTS "QA customers read own rides" ON public.rides;
DROP POLICY IF EXISTS "QA drivers read assigned rides" ON public.rides;
CREATE POLICY "QA customers and assigned drivers read rides" ON public.rides
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = customer_id OR (select auth.uid()) = driver_id);
