-- Phase 13: validate calendar dates in special-day consent RPC
create or replace function public.fr_customer_special_day_set(p_event_type text,p_month integer,p_day integer,p_label text default null,p_consent boolean default false)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_uid uuid:=auth.uid();v_role text;
begin
 if v_uid is null then raise exception 'Authentication required';end if;
 select role into v_role from public.profiles where id=v_uid;
 if lower(coalesce(v_role,''))<>'customer' then raise exception 'Customer only';end if;
 if p_event_type not in ('birthday','special_day') then raise exception 'Invalid event type';end if;
 if p_month not between 1 and 12 or p_day not between 1 and 31 then raise exception 'Invalid month/day';end if;
 if p_day>extract(day from (make_date(2000,p_month,1)+interval '1 month - 1 day')) then raise exception 'Invalid calendar date';end if;
 if p_event_type='birthday' and p_label is not null then raise exception 'Birthday label not allowed';end if;
 insert into public.fr_customer_special_days(customer_id,event_type,event_month,event_day,label,consent_enabled,consent_at)
 values(v_uid,p_event_type,p_month,p_day,p_label,p_consent,case when p_consent then now() else null end)
 on conflict(customer_id,event_type) do update set event_month=excluded.event_month,event_day=excluded.event_day,label=excluded.label,consent_enabled=excluded.consent_enabled,consent_at=case when excluded.consent_enabled then now() else null end,updated_at=now();
 return jsonb_build_object('ok',true,'consent_enabled',p_consent);
end;$$;
revoke all on function public.fr_customer_special_day_set(text,integer,integer,text,boolean) from public,anon;
grant execute on function public.fr_customer_special_day_set(text,integer,integer,text,boolean) to authenticated;