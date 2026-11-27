-- Project X2 UI compatibility wrapper for current partner payment confirmation call.
-- Draft only. Depends on migration 013. Does not mark payment verified.
begin;
create or replace function public.fr_partner_confirm_market_payment(p_order_id uuid,p_payment_reference text default null)
returns boolean language plpgsql security definer set search_path=''
as $$
begin
 if p_payment_reference is not null and length(trim(p_payment_reference))>160 then
   raise exception 'Payment reference too long';
 end if;
 return public.fr_partner_confirm_market_payment(p_order_id);
end; $$;
revoke all on function public.fr_partner_confirm_market_payment(uuid,text) from public,anon;
grant execute on function public.fr_partner_confirm_market_payment(uuid,text) to authenticated;
commit;
