-- FRIEND RIDE Food Delivery RLS corrections (reviewed against production schema metadata)
-- QA branch artifact only. NOT applied to the production database.
-- Fixes a self-join typo that prevented assigned delivery partners from reading orders.
DROP POLICY IF EXISTS fr_food_orders_read ON public.fr_food_orders;
CREATE POLICY fr_food_orders_read
ON public.fr_food_orders
FOR SELECT
TO authenticated
USING (
  customer_id = auth.uid()
  OR is_friend_ride_admin()
  OR EXISTS (
    SELECT 1 FROM public.fr_restaurants r
    WHERE r.id = fr_food_orders.restaurant_id
      AND r.owner_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.fr_food_deliveries d
    WHERE d.order_id = fr_food_orders.id
      AND d.delivery_partner_id = auth.uid()
  )
);

-- Restaurant owner may update rows for their approved restaurant.
-- IMPORTANT: PostgreSQL RLS row policies do NOT restrict which columns can be
-- changed. This policy alone could permit edits to sensitive columns if table
-- grants allow them. Before applying, use column-level UPDATE grants or a
-- constrained RPC/trigger to protect customer, restaurant, payment totals,
-- payment status, order identity and allowed state transitions.
DROP POLICY IF EXISTS fr_food_orders_restaurant_update ON public.fr_food_orders;
CREATE POLICY fr_food_orders_restaurant_update
ON public.fr_food_orders
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.fr_restaurants r
    WHERE r.id = fr_food_orders.restaurant_id
      AND r.owner_id = auth.uid()
      AND r.approval_status = 'approved'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.fr_restaurants r
    WHERE r.id = fr_food_orders.restaurant_id
      AND r.owner_id = auth.uid()
      AND r.approval_status = 'approved'
  )
);

-- Delivery partners may read their assigned delivery records. Status updates
-- remain admin-only until a dedicated constrained RPC is implemented.
