-- FRIEND RIDE QA subscription payment request tracking
create table if not exists public.fr_subscription_payment_requests (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null check (role in ('partner','driver','technician','non_technician')),
 plan_name text not null,
 payment_link text not null,
 payment_reference text,
 status text not null default 'pending_payment' check (status in ('pending_payment','reference_submitted','verified','rejected','activated')),
 admin_verified_by uuid references auth.users(id),
 admin_verified_at timestamptz,
 admin_note text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists fr_subscription_requests_user_created_idx on public.fr_subscription_payment_requests(user_id,created_at desc);
alter table public.fr_subscription_payment_requests enable row level security;
drop policy if exists "Users read own subscription requests" on public.fr_subscription_payment_requests;
create policy "Users read own subscription requests" on public.fr_subscription_payment_requests for select to authenticated using (user_id=auth.uid() or exists(select 1 from public.admin_users a where a.user_id=auth.uid()));
drop policy if exists "Users create own subscription requests" on public.fr_subscription_payment_requests;
create policy "Users create own subscription requests" on public.fr_subscription_payment_requests for insert to authenticated with check (user_id=auth.uid());
drop policy if exists "Admins update subscription requests" on public.fr_subscription_payment_requests;
create policy "Admins update subscription requests" on public.fr_subscription_payment_requests for update to authenticated using (exists(select 1 from public.admin_users a where a.user_id=auth.uid())) with check (exists(select 1 from public.admin_users a where a.user_id=auth.uid()));
create or replace function public.fr_subscription_submit_payment_reference(p_request_id uuid,p_reference text)
returns public.fr_subscription_payment_requests
language plpgsql
security invoker
set search_path=public
as $$
declare r public.fr_subscription_payment_requests;
begin
 if p_reference is null or length(trim(p_reference))<4 or length(trim(p_reference))>120 then raise exception 'Invalid payment reference'; end if;
 update public.fr_subscription_payment_requests
 set payment_reference=trim(p_reference),status='reference_submitted',updated_at=now()
 where id=p_request_id and user_id=auth.uid() and status='pending_payment'
 returning * into r;
 if r.id is null then raise exception 'Request not found or not eligible for reference submission'; end if;
 return r;
end $$;
grant select,insert,update on public.fr_subscription_payment_requests to authenticated;
grant execute on function public.fr_subscription_submit_payment_reference(uuid,text) to authenticated;
