-- Phase 13: Referral reward ledger and admin verification (QA)
create table if not exists public.fr_customer_reward_ledger (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete restrict,
 referral_id uuid not null references public.fr_referrals(id) on delete restrict,
 reward_type text not null check(reward_type in ('referrer_reward','referee_reward')),
 amount_paise integer not null check(amount_paise>0),
 status text not null default 'credited' check(status in ('credited','reversed')),
 idempotency_key text not null unique,
 created_at timestamptz not null default now(),
 constraint fr_customer_reward_one_per_referral unique(referral_id,reward_type)
);
alter table public.fr_customer_reward_ledger enable row level security;
drop policy if exists fr_customer_rewards_read_own on public.fr_customer_reward_ledger;
create policy fr_customer_rewards_read_own on public.fr_customer_reward_ledger for select to authenticated using(user_id=(select auth.uid()));
revoke insert,update,delete on public.fr_customer_reward_ledger from anon,authenticated;
grant select on public.fr_customer_reward_ledger to authenticated;

create or replace function public.fr_admin_verify_and_reward_referral(p_referral_id uuid)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare admin_uid uuid:=auth.uid(); r public.fr_referrals%rowtype;
begin
 if admin_uid is null or not exists(select 1 from public.admin_users a where a.user_id=admin_uid) then
  raise exception 'Admin authorization required';
 end if;
 select * into r from public.fr_referrals where id=p_referral_id for update;
 if not found then raise exception 'Referral not found'; end if;
 if r.status='rejected' then raise exception 'Rejected referral cannot be rewarded'; end if;
 if r.status='rewarded' then return jsonb_build_object('status','rewarded','already_rewarded',true); end if;
 update public.fr_referrals set status='verified',verified_at=coalesce(verified_at,now()) where id=p_referral_id;
 insert into public.fr_customer_reward_ledger(user_id,referral_id,reward_type,amount_paise,idempotency_key)
 values
 (r.referrer_user_id,p_referral_id,'referrer_reward',r.referrer_reward_paise,'referral:'||p_referral_id::text||':referrer'),
 (r.referee_user_id,p_referral_id,'referee_reward',r.referee_reward_paise,'referral:'||p_referral_id::text||':referee')
 on conflict(referral_id,reward_type) do nothing;
 update public.fr_referrals set status='rewarded',rewarded_at=coalesce(rewarded_at,now()) where id=p_referral_id;
 return jsonb_build_object('status','rewarded','referral_id',p_referral_id,'referrer_reward_paise',r.referrer_reward_paise,'referee_reward_paise',r.referee_reward_paise);
end $$;
revoke all on function public.fr_admin_verify_and_reward_referral(uuid) from public,anon,authenticated;
grant execute on function public.fr_admin_verify_and_reward_referral(uuid) to authenticated;
