-- Project X2 Food/Shop payment claim + partner confirmation draft.
-- IMPORTANT: partner confirmation is NOT payment verification. No transition to verified is provided.
-- Review-only; do not apply before dependency/schema and security review.
begin;
alter table public.fr_market_orders add column if not exists customer_payment_claimed_at timestamptz;
alter table public.fr_market_orders add column if not exists partner_payment_confirmed_at timestamptz;

create or replace function public.fr_customer_claim_market_payment(p_order_id uuid,p_reference text)
returns boolean language plpgsql security definer set search_path=''
as $$
declare v_customer uuid:=auth.uid(); v_status text; v_pay text;
begin
 if v_customer is null then raise exception 'Authentication required'; end if;
 if p_reference is null or length(trim(p_reference))<4 or length(trim(p_reference))>160 then raise exception 'Payment reference required'; end if;
 select status,payment_status into v_status,v_pay from public.fr_market_orders
 where order_id=p_order_id and customer_id=v_customer for update;
 if not found then raise exception 'Order not found for this customer'; end if;
 if v_status not in ('customer_quote_accepted','accepted','quoted') then raise exception 'Payment claim not allowed for current order state'; end if;
 if v_pay in ('verified','refunded','failed') then raise exception 'Payment state cannot be claimed'; end if;
 update public.fr_market_orders set payment_status='customer_claimed',payment_reference=trim(p_reference),
 customer_payment_claimed_at=now(),partner_payment_confirmed_at=null,updated_at=now()
 where order_id=p_order_id;
 return true;
end; $$;

create or replace function public.fr_partner_confirm_market_payment(p_order_id uuid)
returns boolean language plpgsql security definer set search_path=''
as $$
declare v_partner uuid:=auth.uid(); v_pay text;
begin
 if v_partner is null then raise exception 'Authentication required'; end if;
 select payment_status into v_pay from public.fr_market_orders
 where order_id=p_order_id and partner_id=v_partner for update;
 if not found then raise exception 'Order not found for this partner'; end if;
 if v_pay<>'customer_claimed' then raise exception 'Customer payment claim required first'; end if;
 update public.fr_market_orders set payment_status='partner_confirmed',
 partner_payment_confirmed_at=now(),updated_at=now()
 where order_id=p_order_id and partner_id=v_partner;
 return true;
end; $$;

revoke all on function public.fr_customer_claim_market_payment(uuid,text) from public,anon;
revoke all on function public.fr_partner_confirm_market_payment(uuid) from public,anon;
grant execute on function public.fr_customer_claim_market_payment(uuid,text) to authenticated;
grant execute on function public.fr_partner_confirm_market_payment(uuid) to authenticated;
commit;
