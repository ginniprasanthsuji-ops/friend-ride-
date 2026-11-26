-- FRIEND RIDE ERS/RRS branch implementation
create table if not exists public.fr_ers_emergency_contacts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  contact_name text not null,
  contact_phone text not null,
  updated_at timestamptz not null default now()
);
create table if not exists public.fr_ers_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_name text not null,
  contact_phone text not null,
  message text not null,
  ride_id uuid,
  created_at timestamptz not null default now()
);
alter table public.fr_ers_emergency_contacts enable row level security;
alter table public.fr_ers_alerts enable row level security;
drop policy if exists fr_ers_contacts_self on public.fr_ers_emergency_contacts;
create policy fr_ers_contacts_self on public.fr_ers_emergency_contacts for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
drop policy if exists fr_ers_alerts_self_read on public.fr_ers_alerts;
create policy fr_ers_alerts_self_read on public.fr_ers_alerts for select to authenticated using(user_id=auth.uid());
revoke all on public.fr_ers_emergency_contacts, public.fr_ers_alerts from anon;
grant select,insert,update,delete on public.fr_ers_emergency_contacts to authenticated;
grant select on public.fr_ers_alerts to authenticated;
create or replace function public.fr_ers_save_contact(p_name text,p_phone text)
returns void language plpgsql security definer set search_path=public as $$
begin
 if auth.uid() is null then raise exception 'Login required'; end if;
 if length(trim(coalesce(p_name,'')))<2 or trim(coalesce(p_phone,'')) !~ '^[+]?[0-9]{10,15}$' then raise exception 'Valid contact name and phone required'; end if;
 insert into public.fr_ers_emergency_contacts(user_id,contact_name,contact_phone)
 values(auth.uid(),trim(p_name),trim(p_phone))
 on conflict(user_id) do update set contact_name=excluded.contact_name,contact_phone=excluded.contact_phone,updated_at=now();
end $$;
create or replace function public.fr_ers_create_alert(p_message text,p_ride_id uuid default null)
returns uuid language plpgsql security definer set search_path=public as $$
declare c public.fr_ers_emergency_contacts%rowtype; alert_id uuid;
begin
 if auth.uid() is null then raise exception 'Login required'; end if;
 select * into c from public.fr_ers_emergency_contacts where user_id=auth.uid();
 if not found then raise exception 'Save emergency contact first'; end if;
 insert into public.fr_ers_alerts(user_id,contact_name,contact_phone,message,ride_id)
 values(auth.uid(),c.contact_name,c.contact_phone,left(coalesce(p_message,'FRIEND RIDE emergency alert'),500),p_ride_id)
 returning id into alert_id;
 return alert_id;
end $$;
revoke all on function public.fr_ers_save_contact(text,text) from public;
revoke all on function public.fr_ers_create_alert(text,uuid) from public;
grant execute on function public.fr_ers_save_contact(text,text) to authenticated;
grant execute on function public.fr_ers_create_alert(text,uuid) to authenticated;
