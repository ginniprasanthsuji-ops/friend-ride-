-- Customer referral reward ledger with exactly-once credit record.
create table if not exists public.fr_customer_referral_reward_ledger(
 id uuid primary key default gen_random_uuid(),
 referral_id uuid not null unique references public.fr_customer_referrals(id) on delete restrict,
 referrer_customer_id uuid not null references public.profiles(id) on delete restrict,
 referred_customer_id uuid not null references public.profiles(id) on delete restrict,
 amount_paise bigint not null check(amount_paise>0),
 currency_code text not null default 'INR' check(currency_code='INR'),
 entry_type text not null default 'referral_reward_credit' check(entry_type='referral_reward_credit'),
 credited_by uuid references public.profiles(id),
 created_at timestamptz not null default now(),
 metadata jsonb not null default '{}'::jsonb
);
alter table public.fr_customer_referral_reward_ledger enable row level security;
drop policy if exists fr_customer_referral_reward_ledger_select_own_admin on public.fr_customer_referral_reward_ledger;
create policy fr_customer_referral_reward_ledger_select_own_admin on public.fr_customer_referral_reward_ledger for select to authenticated using(referrer_customer_id=auth.uid() or referred_customer_id=auth.uid() or public.is_friend_ride_admin());
grant select on public.fr_customer_referral_reward_ledger to authenticated;
revoke insert,update,delete on public.fr_customer_referral_reward_ledger from anon,authenticated;
create or replace function public.fr_customer_referral_reward_credit(p_referral_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_uid uuid:=auth.uid();v_ref public.fr_customer_referrals%rowtype;v_entry public.fr_customer_referral_reward_ledger%rowtype;
begin
 if v_uid is null then raise exception 'Authentication required';end if;
 if not public.is_friend_ride_admin() then raise exception 'Admin only';end if;
 select * into v_ref from public.fr_customer_referrals r where r.id=p_referral_id for update;
 if not found then raise exception 'Referral not found';end if;
 if v_ref.reward_status='credited' then
  select * into v_entry from public.fr_customer_referral_reward_ledger l where l.referral_id=p_referral_id;
  if not found then raise exception 'Credited referral has no ledger row';end if;
  return jsonb_build_object('ok',true,'already_credited',true,'ledger_id',v_entry.id,'amount_paise',v_entry.amount_paise);
 end if;
 if v_ref.reward_status<>'approved' or v_ref.status<>'approved' then raise exception 'Referral reward must be admin-approved first';end if;
 if v_ref.eligible_order_count<2 then raise exception 'Two qualifying orders required';end if;
 if v_ref.reward_amount<>50 then raise exception 'Configured reward amount is not ₹50';end if;
 insert into public.fr_customer_referral_reward_ledger(referral_id,referrer_customer_id,referred_customer_id,amount_paise,credited_by,metadata)
 values(p_referral_id,v_ref.referrer_customer_id,v_ref.referred_customer_id,5000,v_uid,jsonb_build_object('reward_rupees',50,'eligibility_order_count',v_ref.eligible_order_count))
 on conflict(referral_id) do nothing returning * into v_entry;
 if v_entry.id is null then select * into v_entry from public.fr_customer_referral_reward_ledger l where l.referral_id=p_referral_id;return jsonb_build_object('ok',true,'already_credited',true,'ledger_id',v_entry.id,'amount_paise',v_entry.amount_paise);end if;
 update public.fr_customer_referrals set reward_status='credited',status='rewarded',updated_at=now() where id=p_referral_id;
 return jsonb_build_object('ok',true,'already_credited',false,'ledger_id',v_entry.id,'amount_paise',v_entry.amount_paise,'status','credited');
end;$$;
revoke all on function public.fr_customer_referral_reward_credit(uuid) from public,anon;
grant execute on function public.fr_customer_referral_reward_credit(uuid) to authenticated;
