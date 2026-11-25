-- FRIEND RIDE Earnings Ledger base (QA project only)
create table if not exists public.fr_earnings_ledger (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete restrict,
 owner_role text not null check (owner_role in ('driver','partner','service_provider')),
 entry_type text not null check (entry_type in ('credit','debit','reversal')),
 source_type text not null check (source_type in ('ride','market_order','service_booking','referral_reward','subscription','admin_adjustment','other')),
 source_id uuid,
 amount numeric(12,2) not null check (amount > 0),
 currency text not null default 'INR' check (currency='INR'),
 status text not null default 'pending' check (status in ('pending','confirmed','voided')),
 idempotency_key text not null unique check (length(btrim(idempotency_key)) between 8 and 200),
 note text,
 created_by uuid references auth.users(id),
 created_at timestamptz not null default now(),
 confirmed_at timestamptz,
 constraint fr_earnings_ledger_source_unique unique(source_type,source_id,owner_id,entry_type)
);
alter table public.fr_earnings_ledger enable row level security;
drop policy if exists fr_earnings_ledger_owner_select on public.fr_earnings_ledger;
create policy fr_earnings_ledger_owner_select on public.fr_earnings_ledger for select to authenticated using (owner_id=auth.uid() or exists(select 1 from public.admin_users au where au.user_id=auth.uid()));
revoke all on public.fr_earnings_ledger from anon, authenticated;
grant select on public.fr_earnings_ledger to authenticated;
create or replace function public.fr_earnings_ledger_immutable()
returns trigger language plpgsql set search_path=public as $$
begin
 raise exception 'Ledger rows are immutable; create a reversal entry instead.';
end; $$;
drop trigger if exists fr_earnings_ledger_no_update_delete on public.fr_earnings_ledger;
create trigger fr_earnings_ledger_no_update_delete before update or delete on public.fr_earnings_ledger for each row execute function public.fr_earnings_ledger_immutable();
create or replace function public.fr_admin_post_earnings_ledger(
 p_owner_id uuid,p_owner_role text,p_entry_type text,p_source_type text,p_source_id uuid,p_amount numeric,p_status text,p_idempotency_key text,p_note text default null
) returns uuid language plpgsql security definer set search_path=public as $$
declare v_id uuid; v_admin boolean;
begin
 select exists(select 1 from public.admin_users where user_id=auth.uid()) into v_admin;
 if not v_admin then raise exception 'Admin authorization required'; end if;
 if p_amount<=0 or p_owner_role not in ('driver','partner','service_provider') or p_entry_type not in ('credit','debit','reversal') or p_source_type not in ('ride','market_order','service_booking','referral_reward','subscription','admin_adjustment','other') or p_status not in ('pending','confirmed','voided') then raise exception 'Invalid ledger entry'; end if;
 if p_status='confirmed' and p_source_type not in ('admin_adjustment') then
   raise exception 'Only admin adjustments may be confirmed directly; payment/eligibility verification workflow required';
 end if;
 insert into public.fr_earnings_ledger(owner_id,owner_role,entry_type,source_type,source_id,amount,status,idempotency_key,note,created_by,confirmed_at)
 values(p_owner_id,p_owner_role,p_entry_type,p_source_type,p_source_id,p_amount,p_status,p_idempotency_key,p_note,auth.uid(),case when p_status='confirmed' then now() else null end)
 on conflict (idempotency_key) do nothing returning id into v_id;
 if v_id is null then select id into v_id from public.fr_earnings_ledger where idempotency_key=p_idempotency_key; end if;
 return v_id;
end; $$;
revoke all on function public.fr_admin_post_earnings_ledger(uuid,text,text,text,uuid,numeric,text,text,text) from public,anon,authenticated;
grant execute on function public.fr_admin_post_earnings_ledger(uuid,text,text,text,uuid,numeric,text,text,text) to authenticated;
create or replace function public.fr_get_my_earnings_balance()
returns table(available_balance numeric,pending_balance numeric,total_confirmed_credits numeric,total_confirmed_debits numeric)
language sql security definer set search_path=public as $$
 select
 coalesce(sum(amount) filter(where status='confirmed' and entry_type='credit'),0)-coalesce(sum(amount) filter(where status='confirmed' and entry_type in ('debit','reversal')),0),
 coalesce(sum(amount) filter(where status='pending' and entry_type='credit'),0)-coalesce(sum(amount) filter(where status='pending' and entry_type in ('debit','reversal')),0),
 coalesce(sum(amount) filter(where status='confirmed' and entry_type='credit'),0),
 coalesce(sum(amount) filter(where status='confirmed' and entry_type in ('debit','reversal')),0)
 from public.fr_earnings_ledger where owner_id=auth.uid()
$$;
revoke all on function public.fr_get_my_earnings_balance() from public,anon;
grant execute on function public.fr_get_my_earnings_balance() to authenticated;

-- Second migration section: pending-credit confirmation
create or replace function public.fr_admin_confirm_pending_earning(p_pending_entry_id uuid)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_admin boolean; v_pending public.fr_earnings_ledger%rowtype; v_confirmed_id uuid;
begin
 select exists(select 1 from public.admin_users where user_id=auth.uid()) into v_admin;
 if not v_admin then raise exception 'Admin authorization required'; end if;
 select * into v_pending from public.fr_earnings_ledger where id=p_pending_entry_id and status='pending' and entry_type='credit';
 if not found then raise exception 'Pending credit not found'; end if;
 insert into public.fr_earnings_ledger(owner_id,owner_role,entry_type,source_type,source_id,amount,status,idempotency_key,note,created_by,confirmed_at)
 values(v_pending.owner_id,v_pending.owner_role,'credit',v_pending.source_type,null,v_pending.amount,'confirmed',v_pending.idempotency_key||':confirmed',coalesce(v_pending.note,'')||' | confirmed from pending entry '||v_pending.id,auth.uid(),now())
 on conflict(idempotency_key) do nothing returning id into v_confirmed_id;
 if v_confirmed_id is null then select id into v_confirmed_id from public.fr_earnings_ledger where idempotency_key=v_pending.idempotency_key||':confirmed'; end if;
 insert into public.fr_earnings_ledger(owner_id,owner_role,entry_type,source_type,source_id,amount,status,idempotency_key,note,created_by)
 values(v_pending.owner_id,v_pending.owner_role,'debit',v_pending.source_type,null,v_pending.amount,'pending',v_pending.idempotency_key||':pending-clear', 'Pending amount cleared after confirmation of entry '||v_pending.id,auth.uid())
 on conflict(idempotency_key) do nothing;
 return v_confirmed_id;
end; $$;
revoke all on function public.fr_admin_confirm_pending_earning(uuid) from public,anon,authenticated;
grant execute on function public.fr_admin_confirm_pending_earning(uuid) to authenticated;
