-- Fix food-order read access for assigned delivery partners and disable unsafe direct client inserts.
-- Orders must be created by a trusted server flow after validating menu items and totals.
-- Previously the EXISTS predicate compared d.order_id to d.id (the delivery row's own id),
-- which never correctly linked an assignment to its order.
drop policy if exists fr_food_orders_insert on public.fr_food_orders;
drop policy if exists fr_food_orders_read on public.fr_food_orders;

create policy fr_food_orders_read
on public.fr_food_orders
for select
to authenticated
using (
  customer_id = auth.uid()
  or is_friend_ride_admin()
  or exists (
    select 1
    from public.fr_restaurants r
    where r.id = fr_food_orders.restaurant_id
      and r.owner_id = auth.uid()
  )
  or exists (
    select 1
    from public.fr_food_deliveries d
    where d.order_id = fr_food_orders.id
      and d.delivery_partner_id = auth.uid()
  )
);
