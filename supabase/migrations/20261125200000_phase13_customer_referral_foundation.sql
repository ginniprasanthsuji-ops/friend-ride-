-- Phase 13: Customer referral foundation (additive; separate from driver referrals)
create table if not exists public.fr_customer_referral_codes (
 id uuid primary key default gen_random_uuid(),
 customer_id uuid not null unique references public.profiles(id) on delete cascade,
 referral_code text not null unique,
 is_active boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.fr_customer_referrals (
 id uuid primary key default gen_random_uuid(),
 referrer_customer_id uuid not null references public.profiles(id) on delete cascade,
 referred_customer_id uuid not null unique references public.profiles(id) on delete cascade,
 referral_code text not null,
 status text not null default 'pending' check(status in ('pending','eligible','pending_admin','approved','rejected','rewarded')),
 eligible_order_count integer not null default 0 check(eligible_order_count>=0),
 reward_amount numeric(12,2) not null default 50 check(reward_amount>=0),
 reward_status text not null default 'pending' check(reward_status in ('pending','approved','credited','rejected')),
 admin_note text,
 reviewed_by uuid references public.profiles(id),
 reviewed_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check(referrer_customer_id<>referred_customer_id)
);
create index if not exists fr_customer_referrals_referrer_idx on public.fr_customer_referrals(referrer_customer_id,status);
alter table public.fr_customer_referral_codes enable row level security;
alter table public.fr_customer_referrals enable row level security;
drop policy if exists fr_customer_referral_codes_owner_read on public.fr_customer_referral_codes;
create policy fr_customer_referral_codes_owner_read on public.fr_customer_referral_codes for select to authenticated using(customer_id=auth.uid() or public.is_friend_ride_admin());
drop policy if exists fr_customer_referral_codes_admin_all on public.fr_customer_referral_codes;
create policy fr_customer_referral_codes_admin_all on public.fr_customer_referral_codes for all to authenticated using(public.is_friend_ride_admin()) with check(public.is_friend_ride_admin());
drop policy if exists fr_customer_referrals_participant_read on public.fr_customer_referrals;
create policy fr_customer_referrals_participant_read on public.fr_customer_referrals for select to authenticated using(referrer_customer_id=auth.uid() or referred_customer_id=auth.uid() or public.is_friend_ride_admin());
drop policy if exists fr_customer_referrals_admin_all on public.fr_customer_referrals;
create policy fr_customer_referrals_admin_all on public.fr_customer_referrals for all to authenticated using(public.is_friend_ride_admin()) with check(public.is_friend_ride_admin());
grant select on public.fr_customer_referral_codes,public.fr_customer_referrals to authenticated;
revoke insert,update,delete on public.fr_customer_referral_codes,public.fr_customer_referrals from anon,authenticated;
create or replace function public.fr_customer_referral_get_or_create_code()
returns text language plpgsql security definer set search_path='' as $$
declare v_uid uuid:=auth.uid(); v_role text; v_code text;
begin
 if v_uid is null then raise exception 'Authentication required'; end if;
 select p.role into v_role from public.profiles p where p.id=v_uid;
 if lower(coalesce(v_role,''))<>'customer' then raise exception 'Customer account required'; end if;
 select c.referral_code into v_code from public.fr_customer_referral_codes c where c.customer_id=v_uid;
 if v_code is not null then return v_code; end if;
 v_code:='FR'||upper(substr(replace(pg_catalog.gen_random_uuid()::text,'-',''),1,10));
 insert into public.fr_customer_referral_codes(customer_id,referral_code) values(v_uid,v_code)
 on conflict(customer_id) do update set updated_at=now() returning referral_code into v_code;
 return v_code;
end;$$;
revoke all on function public.fr_customer_referral_get_or_create_code() from public,anon;
grant execute on function public.fr_customer_referral_get_or_create_code() to authenticated;
