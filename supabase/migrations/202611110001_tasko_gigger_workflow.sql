-- TASKO / GIGGER production-schema migration.
-- Apply only after reviewing this migration. It is intentionally NOT applied by the QA branch workflow.

alter table public.fr_service_bookings
  add column if not exists actual_hours numeric(5,2),
  add column if not exists final_amount numeric(10,2),
  add column if not exists payment_status text not null default 'not_due',
  add column if not exists payment_reference text,
  add column if not exists payment_submitted_at timestamptz,
  add column if not exists payment_verified_at timestamptz,
  add column if not exists payment_verified_by uuid references auth.users(id);

do $$ begin
  alter table public.fr_service_bookings
    add constraint fr_service_bookings_tasko_payment_status_check
    check (payment_status in ('not_due','pending','submitted','verified','rejected'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.fr_service_bookings
    add constraint fr_service_bookings_tasko_actual_hours_check
    check (actual_hours is null or (actual_hours > 0 and actual_hours <= 24));
exception when duplicate_object then null; end $$;

create or replace function public.fr_tasko_provider_transition(
  p_booking_id uuid,
  p_action text,
  p_actual_hours numeric default null
) returns public.fr_service_bookings
language plpgsql
security definer
set search_path = public, auth
as $$
declare v_row public.fr_service_bookings;
declare v_amount numeric(10,2);
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_action not in ('accept','start','complete') then raise exception 'Invalid action'; end if;

  select * into v_row
  from public.fr_service_bookings
  where id = p_booking_id and service_type = 'tasko'
    and assigned_provider_id = auth.uid()
  for update;
  if not found then raise exception 'Assigned TASKO booking not found'; end if;

  if p_action = 'accept' then
    if v_row.status <> 'assigned' then raise exception 'Booking is not awaiting acceptance'; end if;
    update public.fr_service_bookings set status='accepted', updated_at=now()
      where id=p_booking_id returning * into v_row;
  elsif p_action = 'start' then
    if v_row.status <> 'accepted' then raise exception 'Booking must be accepted first'; end if;
    update public.fr_service_bookings set status='in_progress', updated_at=now()
      where id=p_booking_id returning * into v_row;
  else
    if v_row.status <> 'in_progress' then raise exception 'Work must be in progress before completion'; end if;
    if p_actual_hours is null or p_actual_hours <= 0 or p_actual_hours > 24 then
      raise exception 'Enter actual work hours between 0 and 24';
    end if;
    if p_actual_hours <= 6 then
      if v_row.quoted_amount is null or v_row.quoted_amount < 150 or v_row.quoted_amount > 400 then
        raise exception 'Admin must set an approved base quote between ₹150 and ₹400';
      end if;
      v_amount := v_row.quoted_amount;
    else
      v_amount := 400 + ((p_actual_hours - 6) * 50);
    end if;
    update public.fr_service_bookings
      set status='completed', actual_hours=p_actual_hours, final_amount=v_amount,
          payment_status='pending', updated_at=now()
      where id=p_booking_id returning * into v_row;
  end if;
  return v_row;
end;
$$;

create or replace function public.fr_tasko_submit_payment(
  p_booking_id uuid,
  p_payment_reference text
) returns public.fr_service_bookings
language plpgsql
security definer
set search_path = public, auth
as $$
declare v_row public.fr_service_bookings;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_payment_reference is null or p_payment_reference !~ '^[A-Za-z0-9-]{8,40}$' then
    raise exception 'Enter a valid UPI / bank transaction reference (8–40 letters or numbers)';
  end if;
  update public.fr_service_bookings
    set payment_reference=p_payment_reference, payment_status='submitted',
        payment_submitted_at=now(), updated_at=now()
    where id=p_booking_id and service_type='tasko'
      and customer_id=auth.uid() and status='completed'
      and payment_status in ('pending','rejected')
    returning * into v_row;
  if not found then raise exception 'Completed unpaid TASKO booking not found'; end if;
  return v_row;
end;
$$;

create or replace function public.fr_tasko_admin_verify_payment(
  p_booking_id uuid,
  p_decision text
) returns public.fr_service_bookings
language plpgsql
security definer
set search_path = public, auth
as $$
declare v_row public.fr_service_bookings;
begin
  if auth.uid() is null or not exists (
    select 1 from public.admin_users where user_id=auth.uid()
  ) then raise exception 'Admin access required'; end if;
  if p_decision not in ('verified','rejected') then raise exception 'Invalid payment decision'; end if;
  update public.fr_service_bookings
    set payment_status=p_decision,
        payment_verified_by=case when p_decision='verified' then auth.uid() else null end,
        payment_verified_at=case when p_decision='verified' then now() else null end,
        updated_at=now()
    where id=p_booking_id and service_type='tasko' and payment_status='submitted'
    returning * into v_row;
  if not found then raise exception 'Submitted TASKO payment not found'; end if;
  return v_row;
end;
$$;

revoke all on function public.fr_tasko_provider_transition(uuid,text,numeric) from public;
revoke all on function public.fr_tasko_submit_payment(uuid,text) from public;
revoke all on function public.fr_tasko_admin_verify_payment(uuid,text) from public;
grant execute on function public.fr_tasko_provider_transition(uuid,text,numeric) to authenticated;
grant execute on function public.fr_tasko_submit_payment(uuid,text) to authenticated;
grant execute on function public.fr_tasko_admin_verify_payment(uuid,text) to authenticated;
