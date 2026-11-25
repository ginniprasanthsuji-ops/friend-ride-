-- DRAFT ONLY — review required. Not an applied migration.
-- Core Ride manual-UPI QR payment backend draft, derived from the current index.html contract.
-- Targets only the dedicated FRIEND RIDE QA project when separately approved.
-- This is NOT Razorpay/provider settlement. Customer submits a UTR; assigned Driver manually confirms receipt.

begin;

-- Private QR storage (UI uploads PNG/JPEG/WebP up to 2 MB).
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('provider-payment-qr','provider-payment-qr',false,2097152,array['image/png','image/jpeg','image/webp'])
on conflict (id) do update
set public=false,file_size_limit=2097152,allowed_mime_types=array['image/png','image/jpeg','image/webp'];

create table if not exists public.fr_ride_payments (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null unique references public.rides(id) on delete cascade,
  customer_id uuid not null references auth.users(id),
  driver_id uuid not null references auth.users(id),
  amount numeric(12,2) not null check (amount >= 0),
  status text not null check (status in ('pending','awaiting_driver_confirmation','success','expired')),
  qr_path text not null,
  expires_at timestamptz not null,
  transaction_id text,
  submitted_at timestamptz,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists fr_ride_payments_transaction_id_unique
on public.fr_ride_payments (lower(transaction_id))
where transaction_id is not null;

alter table public.fr_ride_payments enable row level security;
drop policy if exists fr_ride_payments_participant_read on public.fr_ride_payments;
create policy fr_ride_payments_participant_read on public.fr_ride_payments
for select to authenticated
using (customer_id=auth.uid() or driver_id=auth.uid());
revoke all privileges on table public.fr_ride_payments from anon,authenticated;
grant select on table public.fr_ride_payments to authenticated;

-- QR files are private. Driver may read/upload/delete only their own folder.
-- Customer can read the exact QR object belonging to their assigned completed ride.
drop policy if exists fr_provider_payment_qr_driver_read on storage.objects;
drop policy if exists fr_provider_payment_qr_driver_upload on storage.objects;
drop policy if exists fr_provider_payment_qr_driver_delete on storage.objects;
drop policy if exists fr_provider_payment_qr_completed_ride_customer_read on storage.objects;
create policy fr_provider_payment_qr_driver_read on storage.objects
for select to authenticated
using (bucket_id='provider-payment-qr' and (storage.foldername(name))[1]=auth.uid()::text
  and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='driver' and p.driver_approval_status='approved'));
create policy fr_provider_payment_qr_driver_upload on storage.objects
for insert to authenticated
with check (
  bucket_id='provider-payment-qr'
  and (storage.foldername(name))[1]=auth.uid()::text
  and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='driver' and p.driver_approval_status='approved')
);
create policy fr_provider_payment_qr_driver_delete on storage.objects
for delete to authenticated
using (
  bucket_id='provider-payment-qr'
  and (storage.foldername(name))[1]=auth.uid()::text
  and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='driver' and p.driver_approval_status='approved')
);
create policy fr_provider_payment_qr_completed_ride_customer_read on storage.objects
for select to authenticated
using (
  bucket_id='provider-payment-qr'
  and exists(
    select 1 from public.rides r
    join public.profiles d on d.id=r.driver_id
    where r.customer_id=auth.uid()
      and r.status='completed'
      and d.provider_qr_path=storage.objects.name
  )
);

create or replace function public.fr_driver_save_payment_qr(p_qr_path text)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if auth.uid() is null then raise exception 'Login required'; end if;
  if not exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='driver' and p.driver_approval_status='approved') then
    raise exception 'Approved driver account required';
  end if;
  if p_qr_path is null or length(trim(p_qr_path))=0 or split_part(p_qr_path,'/',1)<>auth.uid()::text then
    raise exception 'QR path must belong to this driver';
  end if;
  if not exists(select 1 from storage.objects o where o.bucket_id='provider-payment-qr' and o.name=p_qr_path) then
    raise exception 'Uploaded QR object not found';
  end if;
  update public.profiles set provider_qr_path=p_qr_path where id=auth.uid();
  return jsonb_build_object('ok',true,'qr_path',p_qr_path);
end;
$function$;

create or replace function public.fr_customer_create_ride_payment(p_ride_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_ride public.rides%rowtype;
  v_qr text;
  v_amount numeric(12,2);
  v_pay public.fr_ride_payments%rowtype;
begin
  if auth.uid() is null then raise exception 'Login required'; end if;
  if not exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='customer') then raise exception 'Customer account required'; end if;
  select * into v_ride from public.rides r where r.id=p_ride_id and r.customer_id=auth.uid() and r.status='completed' for update;
  if not found then raise exception 'Completed ride belonging to this customer required'; end if;
  if v_ride.driver_id is null then raise exception 'Assigned driver required'; end if;
  select p.provider_qr_path into v_qr from public.profiles p where p.id=v_ride.driver_id and p.role='driver' and p.driver_approval_status='approved';
  if v_qr is null or split_part(v_qr,'/',1)<>v_ride.driver_id::text then raise exception 'Driver UPI QR is not configured'; end if;
  if not exists(select 1 from storage.objects o where o.bucket_id='provider-payment-qr' and o.name=v_qr) then raise exception 'Driver QR object not found'; end if;
  v_amount:=coalesce(v_ride.agreed_fare,v_ride.fare_offer);
  if v_amount is null or v_amount<0 then raise exception 'Ride fare is invalid'; end if;
  -- Serialize session creation for this ride to avoid concurrent duplicate sessions.
  perform pg_advisory_xact_lock(hashtext(p_ride_id::text)::bigint);
  select * into v_pay from public.fr_ride_payments p where p.ride_id=p_ride_id for update;
  if found then
    if v_pay.status='success' then return jsonb_build_object('status','success','amount',v_pay.amount,'transaction_id',v_pay.transaction_id,'confirmed_at',v_pay.confirmed_at); end if;
    if v_pay.status='awaiting_driver_confirmation' then return jsonb_build_object('status',v_pay.status,'amount',v_pay.amount,'transaction_id',v_pay.transaction_id,'expires_at',v_pay.expires_at); end if;
    if v_pay.status='pending' and v_pay.expires_at>now() then return jsonb_build_object('status',v_pay.status,'amount',v_pay.amount,'qr_path',v_pay.qr_path,'expires_at',v_pay.expires_at); end if;
    update public.fr_ride_payments set status='pending',amount=v_amount,qr_path=v_qr,expires_at=now()+interval '15 minutes',transaction_id=null,submitted_at=null,confirmed_at=null,updated_at=now()
    where ride_id=p_ride_id returning * into v_pay;
  else
    insert into public.fr_ride_payments(ride_id,customer_id,driver_id,amount,status,qr_path,expires_at)
    values(p_ride_id,v_ride.customer_id,v_ride.driver_id,v_amount,'pending',v_qr,now()+interval '15 minutes')
    returning * into v_pay;
  end if;
  return jsonb_build_object('status',v_pay.status,'amount',v_pay.amount,'qr_path',v_pay.qr_path,'expires_at',v_pay.expires_at);
end;
$function$;

create or replace function public.fr_get_ride_payment_state(p_ride_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare v_ride public.rides%rowtype; v_pay public.fr_ride_payments%rowtype;
begin
  if auth.uid() is null then raise exception 'Login required'; end if;
  select * into v_ride from public.rides r where r.id=p_ride_id;
  if not found or (v_ride.customer_id<>auth.uid() and v_ride.driver_id<>auth.uid()) then raise exception 'Ride participant access required'; end if;
  select * into v_pay from public.fr_ride_payments p where p.ride_id=p_ride_id;
  if not found then return jsonb_build_object('status','not_started'); end if;
  if v_pay.status='pending' and v_pay.expires_at<=now() then
    update public.fr_ride_payments set status='expired',updated_at=now() where ride_id=p_ride_id returning * into v_pay;
  end if;
  return jsonb_build_object('status',v_pay.status,'amount',v_pay.amount,'qr_path',v_pay.qr_path,'expires_at',v_pay.expires_at,'transaction_id',v_pay.transaction_id,'confirmed_at',v_pay.confirmed_at);
end;
$function$;

create or replace function public.fr_customer_submit_ride_transaction(p_ride_id uuid,p_transaction_id text)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare v_ride public.rides%rowtype; v_pay public.fr_ride_payments%rowtype; v_tx text;
begin
  if auth.uid() is null then raise exception 'Login required'; end if;
  if not exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='customer') then raise exception 'Customer account required'; end if;
  v_tx:=nullif(trim(p_transaction_id),'');
  if v_tx is null or v_tx !~ '^[A-Za-z0-9._/-]{8,40}$' then raise exception 'UPI transaction ID must be 8-40 valid characters'; end if;
  select * into v_ride from public.rides r where r.id=p_ride_id and r.customer_id=auth.uid() and r.status='completed';
  if not found then raise exception 'Completed ride belonging to this customer required'; end if;
  select * into v_pay from public.fr_ride_payments p where p.ride_id=p_ride_id for update;
  if not found or v_pay.status<>'pending' or v_pay.expires_at<=now() then raise exception 'Active payment QR session required'; end if;
  update public.fr_ride_payments set status='awaiting_driver_confirmation',transaction_id=v_tx,submitted_at=now(),updated_at=now()
  where ride_id=p_ride_id returning * into v_pay;
  return jsonb_build_object('status',v_pay.status,'amount',v_pay.amount,'transaction_id',v_pay.transaction_id);
end;
$function$;

create or replace function public.fr_driver_confirm_ride_payment(p_ride_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare v_ride public.rides%rowtype; v_pay public.fr_ride_payments%rowtype;
begin
  if auth.uid() is null then raise exception 'Login required'; end if;
  if not exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='driver' and p.driver_approval_status='approved') then raise exception 'Approved driver account required'; end if;
  select * into v_ride from public.rides r where r.id=p_ride_id and r.driver_id=auth.uid() and r.status='completed';
  if not found then raise exception 'Completed ride assigned to this driver required'; end if;
  select * into v_pay from public.fr_ride_payments p where p.ride_id=p_ride_id for update;
  if not found or v_pay.status<>'awaiting_driver_confirmation' or v_pay.transaction_id is null then raise exception 'Customer transaction submission required before confirmation'; end if;
  update public.fr_ride_payments set status='success',confirmed_at=now(),updated_at=now() where ride_id=p_ride_id returning * into v_pay;
  return jsonb_build_object('status',v_pay.status,'amount',v_pay.amount,'transaction_id',v_pay.transaction_id,'confirmed_at',v_pay.confirmed_at);
end;
$function$;

-- This RPC is used by the existing customer live-ride UI as a fallback driver-contact source.
create or replace function public.get_ride_payment_details_v1(p_ride_id uuid)
returns table(driver_name text,driver_phone text)
language plpgsql
security definer
set search_path to ''
as $function$
declare v_ride public.rides%rowtype;
begin
  if auth.uid() is null then raise exception 'Login required'; end if;
  select * into v_ride from public.rides r where r.id=p_ride_id;
  if not found or (v_ride.customer_id<>auth.uid() and v_ride.driver_id<>auth.uid()) then raise exception 'Ride participant access required'; end if;
  if v_ride.driver_id is null or v_ride.status not in ('accepted','confirmed','ongoing','completed') then return; end if;
  return query select p.full_name,p.phone from public.profiles p where p.id=v_ride.driver_id;
end;
$function$;

revoke all on function public.fr_driver_save_payment_qr(text) from public,anon;
revoke all on function public.fr_customer_create_ride_payment(uuid) from public,anon;
revoke all on function public.fr_get_ride_payment_state(uuid) from public,anon;
revoke all on function public.fr_customer_submit_ride_transaction(uuid,text) from public,anon;
revoke all on function public.fr_driver_confirm_ride_payment(uuid) from public,anon;
revoke all on function public.get_ride_payment_details_v1(uuid) from public,anon;
grant execute on function public.fr_driver_save_payment_qr(text) to authenticated;
grant execute on function public.fr_customer_create_ride_payment(uuid) to authenticated;
grant execute on function public.fr_get_ride_payment_state(uuid) to authenticated;
grant execute on function public.fr_customer_submit_ride_transaction(uuid,text) to authenticated;
grant execute on function public.fr_driver_confirm_ride_payment(uuid) to authenticated;
grant execute on function public.get_ride_payment_details_v1(uuid) to authenticated;

commit;

-- Draft review notes:
-- * Manual UPI flow only; no automatic bank/provider settlement proof or webhook.
-- * QR storage bucket/policies, payment table, and six RPCs are absent in QA as of this audit.
-- * Verify current profile trigger/RLS and bucket schema before applying.
-- * Execute role tests using customer, assigned approved driver, pending driver, partner, anonymous,
--   non-participant, wrong ride, expired session, duplicate UTR, and success-state fixtures.
-- * No SQL has been applied and this draft has not been runtime-tested.
