-- FRIEND RIDE Phase 13: Referral foundation (QA only)
-- Reward intent: ₹50 to eligible referrer and referee after verification.
create table if not exists public.fr_referral_codes (
 user_id uuid primary key references auth.users(id) on delete cascade,
 referral_code text unique not null,
 created_at timestamptz not null default now()
);
create table if not exists public.fr_referrals (
 id uuid primary key default gen_random_uuid(),
 referrer_user_id uuid not null references auth.users(id) on delete cascade,
 referee_user_id uuid not null references auth.users(id) on delete cascade,
 referral_code text not null,
 status text not null default 'pending' check(status in ('pending','verified','rewarded','rejected')),
 referrer_reward_paise integer not null default 5000 check(referrer_reward_paise>=0),
 referee_reward_paise integer not null default 5000 check(referee_reward_paise>=0),
 verified_at timestamptz,
 rewarded_at timestamptz,
 created_at timestamptz not null default now(),
 constraint fr_referrals_no_self check(referrer_user_id<>referee_user_id),
 constraint fr_referrals_one_per_referee unique(referee_user_id)
);
alter table public.fr_referral_codes enable row level security;
alter table public.fr_referrals enable row level security;
drop policy if exists fr_ref_codes_read_own on public.fr_referral_codes;
create policy fr_ref_codes_read_own on public.fr_referral_codes for select to authenticated using(user_id=(select auth.uid()));
drop policy if exists fr_ref_codes_insert_own on public.fr_referral_codes;
create policy fr_ref_codes_insert_own on public.fr_referral_codes for insert to authenticated with check(user_id=(select auth.uid()));
drop policy if exists fr_referrals_read_participant on public.fr_referrals;
create policy fr_referrals_read_participant on public.fr_referrals for select to authenticated using(referrer_user_id=(select auth.uid()) or referee_user_id=(select auth.uid()));
revoke insert,update,delete on public.fr_referrals from anon,authenticated;
grant select on public.fr_referrals to authenticated;
grant select,insert on public.fr_referral_codes to authenticated;

create or replace function public.fr_referral_create_my_code()
returns text language plpgsql security invoker set search_path=''
as $$
declare uid uuid:=auth.uid(); code text;
begin
 if uid is null then raise exception 'Login required'; end if;
 select referral_code into code from public.fr_referral_codes where user_id=uid;
 if code is not null then return code; end if;
 code:=upper(substr(replace(uid::text,'-',''),1,8));
 insert into public.fr_referral_codes(user_id,referral_code) values(uid,code)
 on conflict(user_id) do nothing;
 select referral_code into code from public.fr_referral_codes where user_id=uid;
 return code;
end $$;
revoke all on function public.fr_referral_create_my_code() from public,anon;
grant execute on function public.fr_referral_create_my_code() to authenticated;

create or replace function public.fr_referral_apply_code(p_code text)
returns uuid language plpgsql security invoker set search_path=''
as $$
declare uid uuid:=auth.uid(); referrer uuid; rid uuid;
begin
 if uid is null then raise exception 'Login required'; end if;
 select user_id into referrer from public.fr_referral_codes where referral_code=upper(trim(p_code));
 if referrer is null then raise exception 'Invalid referral code'; end if;
 if referrer=uid then raise exception 'Self-referral is not allowed'; end if;
 insert into public.fr_referrals(referrer_user_id,referee_user_id,referral_code)
 values(referrer,uid,upper(trim(p_code))) returning id into rid;
 return rid;
exception when unique_violation then raise exception 'This account already used a referral or is already referred'; end $$;
revoke all on function public.fr_referral_apply_code(text) from public,anon;
grant execute on function public.fr_referral_apply_code(text) to authenticated;
