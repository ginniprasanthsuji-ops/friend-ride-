-- FRIEND RIDE subscription payment tracking (QA/test branch migration)
create table if not exists public.fr_subscription_payment_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('partner','driver','technician','non_technician')),
  plan_name text not null,
  payment_link text not null default 'https://rzp.io/rzp/54cMN1g',
  payment_reference text,
  status text not null default 'pending_payment' check (status in ('pending_payment','pending_verification','verified','rejected')),
  admin_note text,
  verified_by uuid references auth.users(id),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.fr_subscription_payment_requests enable row level security;
drop policy if exists fr_subscription_requests_select_own_or_admin on public.fr_subscription_payment_requests;
create policy fr_subscription_requests_select_own_or_admin on public.fr_subscription_payment_requests
for select to authenticated using (user_id=auth.uid() or exists(select 1 from public.admin_users a where a.user_id=auth.uid()));
drop policy if exists fr_subscription_requests_insert_own on public.fr_subscription_payment_requests;
create policy fr_subscription_requests_insert_own on public.fr_subscription_payment_requests
for insert to authenticated with check (user_id=auth.uid() and status='pending_payment' and payment_reference is null and verified_by is null and verified_at is null);
grant select, insert on public.fr_subscription_payment_requests to authenticated;
create or replace function public.fr_subscription_submit_payment_reference(p_request_id uuid,p_reference text)
returns public.fr_subscription_payment_requests
language plpgsql security definer set search_path=public
as $$
declare v_row public.fr_subscription_payment_requests;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if p_reference is null or length(trim(p_reference))<4 or length(trim(p_reference))>120 then raise exception 'Enter a valid payment reference'; end if;
 update public.fr_subscription_payment_requests
 set payment_reference=trim(p_reference),status='pending_verification',updated_at=now()
 where id=p_request_id and user_id=auth.uid() and status='pending_payment'
 returning * into v_row;
 if v_row.id is null then raise exception 'Request not found or not editable'; end if;
 return v_row;
end $$;
grant execute on function public.fr_subscription_submit_payment_reference(uuid,text) to authenticated;
create or replace function public.fr_admin_verify_subscription_payment(p_request_id uuid,p_approve boolean,p_note text default null)
returns public.fr_subscription_payment_requests
language plpgsql security definer set search_path=public
as $$
declare v_row public.fr_subscription_payment_requests;
begin
 if auth.uid() is null or not exists(select 1 from public.admin_users a where a.user_id=auth.uid()) then raise exception 'Admin access required'; end if;
 update public.fr_subscription_payment_requests
 set status=case when p_approve then 'verified' else 'rejected' end,
     admin_note=left(coalesce(p_note,''),1000),verified_by=auth.uid(),
     verified_at=case when p_approve then now() else null end,updated_at=now()
 where id=p_request_id and status='pending_verification'
 returning * into v_row;
 if v_row.id is null then raise exception 'Pending verification request not found'; end if;
 return v_row;
end $$;
grant execute on function public.fr_admin_verify_subscription_payment(uuid,boolean,text) to authenticated;
