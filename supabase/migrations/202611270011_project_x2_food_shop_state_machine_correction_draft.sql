-- Project X2 Food/Shop correction: state constraint and transition rules.
-- Draft only. Depends on schema/RPC drafts 005-010. No DB apply.
begin;

alter table public.fr_market_orders drop constraint if exists fr_market_order_status_check;
alter table public.fr_market_orders add constraint fr_market_order_status_check
 check(status in ('quote_requested','accepted','quoted','customer_quote_accepted','rejected','preparing','ready','completed','cancelled'));

create or replace function public.fr_partner_update_market_order(p_order_id uuid,p_status text)
returns boolean language plpgsql security definer set search_path=''
as $$
declare v_partner uuid:=auth.uid(); v_old text; v_pay text;
begin
 if v_partner is null then raise exception 'Authentication required'; end if;
 select status,payment_status into v_old,v_pay from public.fr_market_orders
 where order_id=p_order_id and partner_id=v_partner for update;
 if not found then raise exception 'Order not found for this partner'; end if;
 if not ((v_old='quote_requested' and p_status in ('accepted','rejected')) or
         (v_old='customer_quote_accepted' and p_status='preparing' and v_pay='verified') or
         (v_old='preparing' and p_status='ready' and v_pay='verified') or
         (v_old='ready' and p_status='completed' and v_pay='verified')) then
   raise exception 'Invalid order transition or payment not verified';
 end if;
 update public.fr_market_orders set status=p_status,updated_at=now() where order_id=p_order_id;
 return true;
end; $$;

revoke all on function public.fr_partner_update_market_order(uuid,text) from public,anon;
grant execute on function public.fr_partner_update_market_order(uuid,text) to authenticated;
commit;
