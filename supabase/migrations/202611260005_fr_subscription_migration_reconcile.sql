-- FRIEND RIDE QA branch: reconcile subscription payment request migration variants.
-- QA branch only. This fixes status/column drift between payment tracking and admin review migrations.
begin;

alter table public.fr_subscription_payment_requests
  add column if not exists admin_verified_by uuid references auth.users(id),
  add column if not exists admin_verified_at timestamptz;

alter table public.fr_subscription_payment_requests
  alter column payment_link set default 'https://rzp.io/rzp/54cMN1g';

-- Normalize earlier tracking-migration status before enforcing the app's status vocabulary.
update public.fr_subscription_payment_requests
set status='reference_submitted'
where status='pending_verification' and payment_reference is not null;

alter table public.fr_subscription_payment_requests
  drop constraint if exists fr_subscription_payment_requests_status_check;

alter table public.fr_subscription_payment_requests
  add constraint fr_subscription_payment_requests_status_check
  check (status in ('pending_payment','reference_submitted','verified','rejected','activated'));

create or replace function public.fr_subscription_submit_payment_reference(p_request_id uuid,p_reference text)
returns public.fr_subscription_payment_requests
language plpgsql security definer set search_path=public
as $$
declare r public.fr_subscription_payment_requests;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_reference is null or length(trim(p_reference))<4 or length(trim(p_reference))>120 then
    raise exception 'Invalid payment reference';
  end if;
  update public.fr_subscription_payment_requests
  set payment_reference=trim(p_reference),status='reference_submitted',updated_at=now()
  where id=p_request_id and user_id=auth.uid() and status='pending_payment'
  returning * into r;
  if r.id is null then raise exception 'Request not found or not eligible for reference submission'; end if;
  return r;
end $$;
grant execute on function public.fr_subscription_submit_payment_reference(uuid,text) to authenticated;

create or replace function public.fr_admin_subscription_review(p_request_id uuid,p_action text,p_note text default null)
returns public.fr_subscription_payment_requests
language plpgsql security definer set search_path=public
as $$
declare r public.fr_subscription_payment_requests;
begin
  if auth.uid() is null or not exists(select 1 from public.admin_users a where a.user_id=auth.uid()) then
    raise exception 'Admin access required';
  end if;
  if p_action not in ('approve','reject') then raise exception 'Invalid action'; end if;
  update public.fr_subscription_payment_requests
  set status=case when p_action='approve' then 'activated' else 'rejected' end,
      admin_verified_by=auth.uid(),
      admin_verified_at=now(),
      admin_note=nullif(trim(coalesce(p_note,'')),''),
      updated_at=now()
  where id=p_request_id and status='reference_submitted'
  returning * into r;
  if r.id is null then raise exception 'Request not found or not awaiting admin review'; end if;
  return r;
end $$;
grant execute on function public.fr_admin_subscription_review(uuid,text,text) to authenticated;

notify pgrst, 'reload schema';
commit;
