-- Project Arjuna QA: harden registration authorization against user-settable custom GUC spoofing.
create table if not exists public.qa_role_registration_authorizations (
 user_id uuid not null,
 transaction_id bigint not null,
 primary key(user_id,transaction_id)
);
alter table public.qa_role_registration_authorizations enable row level security;
revoke all on table public.qa_role_registration_authorizations from public,anon,authenticated;

create or replace function public.qa_guard_profile_privileged_fields()
returns trigger language plpgsql security definer set search_path=''
as $$
begin
 if auth.uid() is not null
 and not exists(select 1 from public.admin_users a where a.user_id=auth.uid())
 and not exists(select 1 from public.qa_role_registration_authorizations q where q.user_id=auth.uid() and q.transaction_id=pg_catalog.txid_current())
 and (new.role is distinct from old.role
  or new.driver_approval_status is distinct from old.driver_approval_status
  or new.partner_approval_status is distinct from old.partner_approval_status) then
  raise exception 'Role and approval fields are admin-controlled';
 end if;
 return new;
end $$;
revoke all on function public.qa_guard_profile_privileged_fields() from public,anon,authenticated;
drop trigger if exists qa_guard_profile_privileged_fields on public.profiles;
create trigger qa_guard_profile_privileged_fields before update on public.profiles for each row execute function public.qa_guard_profile_privileged_fields();

create or replace function public.fr_register_driver_partner(p_role text,p_profile jsonb)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_uid uuid:=auth.uid(); v_old_role text; v_name text; v_phone text; v_qr text;
begin
 if v_uid is null then raise exception 'OTP login session required'; end if;
 if p_role not in ('driver','partner') or jsonb_typeof(p_profile)<>'object' then raise exception 'Invalid registration request'; end if;
 v_name:=nullif(btrim(p_profile->>'full_name'),'');
 v_phone:=nullif(regexp_replace(coalesce(p_profile->>'phone',''),'[^0-9]','','g'),'');
 if length(v_phone)=12 and left(v_phone,2)='91' then v_phone:=substring(v_phone from 3); end if;
 if v_name is null or v_phone !~ '^[6-9][0-9]{9}$' then raise exception 'Valid name and 10 digit mobile number required'; end if;
 v_phone:='+91'||v_phone;
 v_qr:=nullif(btrim(p_profile->>'provider_qr_path'),'');
 if v_qr is not null and split_part(v_qr,'/',1)<>v_uid::text then raise exception 'QR path must belong to this account'; end if;
 select lower(coalesce(role,'customer')) into v_old_role from public.profiles where id=v_uid for update;
 if not found then raise exception 'Profile row not found'; end if;
 if v_old_role<>'customer' then raise exception 'Account already registered as another role'; end if;
 if p_role='driver' then
  if nullif(btrim(p_profile->>'vehicle_company'),'') is null or nullif(btrim(p_profile->>'vehicle_model'),'') is null or nullif(btrim(p_profile->>'vehicle_number'),'') is null or nullif(btrim(p_profile->>'driver_license_number'),'') is null or nullif(btrim(p_profile->>'driver_aadhaar_number'),'') is null then raise exception 'Complete Driver and vehicle details required'; end if;
 else
  if nullif(btrim(p_profile->>'business_name'),'') is null or nullif(btrim(p_profile->>'partner_category'),'') is null or nullif(btrim(p_profile->>'address'),'') is null or nullif(btrim(p_profile->>'upi_id'),'') is null or nullif(btrim(p_profile->>'phonepe_number'),'') is null then raise exception 'Complete Partner business, address and payment details required'; end if;
 end if;
 insert into public.qa_role_registration_authorizations(user_id,transaction_id) values(v_uid,pg_catalog.txid_current());
 update public.profiles set role=p_role,full_name=v_name,phone=v_phone,
 driver_approval_status=case when p_role='driver' then 'pending' else driver_approval_status end,
 partner_approval_status=case when p_role='partner' then 'pending' else partner_approval_status end,
 vehicle_type=case when p_role='driver' then coalesce(nullif(p_profile->>'vehicle_type',''),'Bike') else vehicle_type end,
 vehicle_company=case when p_role='driver' then nullif(btrim(p_profile->>'vehicle_company'),'') else vehicle_company end,
 vehicle_model=case when p_role='driver' then nullif(btrim(p_profile->>'vehicle_model'),'') else vehicle_model end,
 vehicle_number=case when p_role='driver' then nullif(btrim(p_profile->>'vehicle_number'),'') else vehicle_number end,
 driver_license_number=case when p_role='driver' then nullif(btrim(p_profile->>'driver_license_number'),'') else driver_license_number end,
 driver_aadhaar_number=case when p_role='driver' then nullif(btrim(p_profile->>'driver_aadhaar_number'),'') else driver_aadhaar_number end,
 driving_experience_years=case when p_role='driver' then greatest(0,coalesce((p_profile->>'driving_experience_years')::integer,0)) else driving_experience_years end,
 business_name=case when p_role='partner' then nullif(btrim(p_profile->>'business_name'),'') else business_name end,
 partner_category=case when p_role='partner' then nullif(btrim(p_profile->>'partner_category'),'') else partner_category end,
 gstin=case when p_role='partner' then nullif(btrim(p_profile->>'gstin'),'') else gstin end,
 upi_id=case when p_role in ('driver','partner') then nullif(btrim(p_profile->>'upi_id'),'') else upi_id end,
 phonepe_number=case when p_role='partner' then nullif(btrim(p_profile->>'phonepe_number'),'') else phonepe_number end,
 provider_qr_path=case when p_role in ('driver','partner') then v_qr else provider_qr_path end,
 address=case when p_role='partner' then nullif(btrim(p_profile->>'address'),'') else address end
 where id=v_uid;
 delete from public.qa_role_registration_authorizations where user_id=v_uid and transaction_id=pg_catalog.txid_current();
 return jsonb_build_object('ok',true,'role',p_role,'approval_status','pending','user_id',v_uid);
end $$;
revoke all on function public.fr_register_driver_partner(text,jsonb) from public,anon;
grant execute on function public.fr_register_driver_partner(text,jsonb) to authenticated;
