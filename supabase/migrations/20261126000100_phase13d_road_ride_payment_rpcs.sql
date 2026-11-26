-- Phase 13D: Road Ride payment RPCs (QA only)
-- Applied to QA project pqsangtvietawkfgpgfu; catalog recheck confirmed functions exist.
create table if not exists public.fr_ride_payment_sessions (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null unique references public.rides(id) on delete cascade,
  customer_id uuid not null references auth.users(id),
  driver_id uuid not null references auth.users(id),
  amount numeric(12,2) not null check (amount > 0),
  qr_path text,
  status text not null default 'pending' check (status in ('pending','awaiting_driver_confirmation','success','expired')),
  transaction_id text,
  expires_at timestamptz not null,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.fr_ride_payment_sessions enable row level security;
drop policy if exists fr_ride_payment_sessions_participant_read on public.fr_ride_payment_sessions;
create policy fr_ride_payment_sessions_participant_read on public.fr_ride_payment_sessions
for select to authenticated using (customer_id=auth.uid() or driver_id=auth.uid());
revoke all on public.fr_ride_payment_sessions from anon, authenticated;
grant select on public.fr_ride_payment_sessions to authenticated;
grant all on public.fr_ride_payment_sessions to service_role;

create or replace function public.fr_get_ride_payment_state(p_ride_id uuid)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_uid uuid:=auth.uid(); v_r public.rides%rowtype; v_s public.fr_ride_payment_sessions%rowtype;
begin
 if v_uid is null then raise exception 'Authentication required'; end if;
 select * into v_r from public.rides where id=p_ride_id;
 if not found then raise exception 'Ride not found'; end if;
 if v_uid not in (v_r.customer_id,v_r.driver_id) then raise exception 'Not a ride participant'; end if;
 select * into v_s from public.fr_ride_payment_sessions where ride_id=p_ride_id;
 if not found then return jsonb_build_object('status','not_started'); end if;
 if v_s.status='pending' and v_s.expires_at<=now() then
  update public.fr_ride_payment_sessions set status='expired',updated_at=now() where id=v_s.id returning * into v_s;
 end if;
 return jsonb_build_object('status',v_s.status,'amount',v_s.amount,'qr_path',v_s.qr_path,'expires_at',v_s.expires_at,'transaction_id',v_s.transaction_id,'confirmed_at',v_s.confirmed_at);
end $$;

create or replace function public.fr_customer_create_ride_payment(p_ride_id uuid)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_uid uuid:=auth.uid(); v_r public.rides%rowtype; v_qr text; v_amt numeric(12,2); v_s public.fr_ride_payment_sessions%rowtype;
begin
 if v_uid is null then raise exception 'Authentication required'; end if;
 select * into v_r from public.rides where id=p_ride_id for update;
 if not found or v_r.customer_id<>v_uid then raise exception 'Customer does not own ride'; end if;
 if lower(coalesce(v_r.status,''))<>'completed' then raise exception 'Payment allowed only for completed rides'; end if;
 if v_r.driver_id is null then raise exception 'Ride has no assigned driver'; end if;
 v_amt:=coalesce(v_r.agreed_fare,v_r.fare_offer);
 if v_amt is null or v_amt<=0 then raise exception 'Invalid ride fare'; end if;
 select coalesce(provider_qr_path,partner_qr_path) into v_qr from public.profiles where id=v_r.driver_id;
 if v_qr is null then raise exception 'Driver payment QR is not configured'; end if;
 insert into public.fr_ride_payment_sessions(ride_id,customer_id,driver_id,amount,qr_path,status,transaction_id,expires_at,confirmed_at)
 values(p_ride_id,v_r.customer_id,v_r.driver_id,v_amt,v_qr,'pending',null,now()+interval '15 minutes',null)
 on conflict(ride_id) do update set amount=excluded.amount,qr_path=excluded.qr_path,status='pending',transaction_id=null,expires_at=excluded.expires_at,confirmed_at=null,updated_at=now()
 returning * into v_s;
 return jsonb_build_object('status',v_s.status,'amount',v_s.amount,'qr_path',v_s.qr_path,'expires_at',v_s.expires_at);
end $$;

create or replace function public.fr_customer_submit_ride_transaction(p_ride_id uuid,p_transaction_id text)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_uid uuid:=auth.uid(); v_s public.fr_ride_payment_sessions%rowtype; v_tx text:=btrim(coalesce(p_transaction_id,''));
begin
 if v_uid is null then raise exception 'Authentication required'; end if;
 if v_tx='' or length(v_tx)>40 then raise exception 'Enter a valid transaction reference (1-40 characters)'; end if;
 select * into v_s from public.fr_ride_payment_sessions where ride_id=p_ride_id for update;
 if not found or v_s.customer_id<>v_uid then raise exception 'Payment session not found for this customer'; end if;
 if v_s.status<>'pending' or v_s.expires_at<=now() then raise exception 'Payment session is not active'; end if;
 update public.fr_ride_payment_sessions set transaction_id=v_tx,status='awaiting_driver_confirmation',updated_at=now() where id=v_s.id returning * into v_s;
 return jsonb_build_object('status',v_s.status,'amount',v_s.amount,'transaction_id',v_s.transaction_id,'expires_at',v_s.expires_at);
end $$;

create or replace function public.fr_driver_confirm_ride_payment(p_ride_id uuid)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_uid uuid:=auth.uid(); v_s public.fr_ride_payment_sessions%rowtype;
begin
 if v_uid is null then raise exception 'Authentication required'; end if;
 select * into v_s from public.fr_ride_payment_sessions where ride_id=p_ride_id for update;
 if not found or v_s.driver_id<>v_uid then raise exception 'Payment session not found for this driver'; end if;
 if v_s.status<>'awaiting_driver_confirmation' then raise exception 'Payment is not awaiting driver confirmation'; end if;
 update public.fr_ride_payment_sessions set status='success',confirmed_at=now(),updated_at=now() where id=v_s.id returning * into v_s;
 return jsonb_build_object('status',v_s.status,'amount',v_s.amount,'transaction_id',v_s.transaction_id,'confirmed_at',v_s.confirmed_at);
end $$;

revoke all on function public.fr_get_ride_payment_state(uuid) from public,anon;
revoke all on function public.fr_customer_create_ride_payment(uuid) from public,anon;
revoke all on function public.fr_customer_submit_ride_transaction(uuid,text) from public,anon;
revoke all on function public.fr_driver_confirm_ride_payment(uuid) from public,anon;
grant execute on function public.fr_get_ride_payment_state(uuid) to authenticated,service_role;
grant execute on function public.fr_customer_create_ride_payment(uuid) to authenticated,service_role;
grant execute on function public.fr_customer_submit_ride_transaction(uuid,text) to authenticated,service_role;
grant execute on function public.fr_driver_confirm_ride_payment(uuid) to authenticated,service_role;
