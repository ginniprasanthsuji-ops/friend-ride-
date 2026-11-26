-- Project Arjuna QA-only admin driver/partner review RPCs.
create or replace function public.admin_list_driver_applications()
returns table(id uuid,full_name text,phone text,vehicle_type text,vehicle_company text,vehicle_model text,vehicle_registration text,driving_experience_years integer,driving_license_number text,driving_license_document_path text,driver_approval_status text)
language plpgsql security definer set search_path=''
as $$
begin
 if not exists(select 1 from public.admin_users a where a.user_id=auth.uid()) then raise exception 'Admin access denied'; end if;
 return query select p.id,p.full_name,p.phone,p.vehicle_type,p.vehicle_company,p.vehicle_model,coalesce(p.vehicle_number,p.vehicle_registration),p.driving_experience_years,coalesce(p.driver_license_number,p.driving_license_number),p.driving_license_document_path,p.driver_approval_status from public.profiles p where p.role='driver' order by p.full_name;
end $$;
create or replace function public.admin_list_driver_documents()
returns table(id uuid,driver_id uuid,full_name text,phone text,document_type text,storage_path text,verification_status text,review_note text,created_at timestamptz)
language plpgsql security definer set search_path=''
as $$
begin
 if not exists(select 1 from public.admin_users a where a.user_id=auth.uid()) then raise exception 'Admin access required'; end if;
 return query select d.id,d.driver_id,p.full_name,p.phone,d.document_type,d.storage_path,d.verification_status,d.review_note,d.created_at from public.fr_driver_documents d join public.profiles p on p.id=d.driver_id order by d.created_at desc;
end $$;
create or replace function public.admin_review_driver(p_driver_id uuid,p_decision text)
returns boolean language plpgsql security definer set search_path=''
as $$
declare affected_rows integer;
begin
 if not exists(select 1 from public.admin_users a where a.user_id=auth.uid()) then raise exception 'Admin access required'; end if;
 if p_decision not in ('approved','rejected','revoked') then raise exception 'Invalid driver decision'; end if;
 update public.profiles set driver_approval_status=p_decision where id=p_driver_id and role='driver';
 get diagnostics affected_rows=row_count;
 if affected_rows=1 and p_decision<>'approved' then update public.driver_locations set is_online=false,updated_at=now() where driver_id=p_driver_id; end if;
 return affected_rows=1;
end $$;
create or replace function public.admin_review_driver_document(p_document_id uuid,p_decision text,p_note text default null)
returns boolean language plpgsql security definer set search_path=''
as $$
declare n integer;
begin
 if not exists(select 1 from public.admin_users a where a.user_id=auth.uid()) then raise exception 'Admin access required'; end if;
 if p_decision not in ('verified','rejected') then raise exception 'Invalid document decision'; end if;
 update public.fr_driver_documents set verification_status=p_decision,review_note=nullif(left(coalesce(p_note,''),500),''),reviewed_by=auth.uid(),reviewed_at=now() where id=p_document_id;
 get diagnostics n=row_count; return n=1;
end $$;
create or replace function public.fr_admin_list_partner_applications()
returns table(id uuid,full_name text,phone text,business_name text,partner_category text,address text,gstin text,upi_id text,phonepe_number text,partner_qr_path text,partner_approval_status text,created_at timestamptz)
language plpgsql security definer set search_path=''
as $$
begin
 if not exists(select 1 from public.admin_users a where a.user_id=auth.uid()) then raise exception 'Admin access required'; end if;
 return query select p.id,p.full_name,p.phone,p.business_name,p.partner_category,p.address,p.gstin,p.upi_id,p.phonepe_number,p.partner_qr_path,p.partner_approval_status,p.created_at from public.profiles p where p.role='partner' order by case p.partner_approval_status when 'pending' then 0 when 'rejected' then 1 else 2 end,p.created_at desc;
end $$;
create or replace function public.fr_admin_review_partner(p_partner_id uuid,p_decision text)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_status text;
begin
 if not exists(select 1 from public.admin_users a where a.user_id=auth.uid()) then raise exception 'Admin access required'; end if;
 if p_decision not in ('approved','rejected','revoked') then raise exception 'Invalid partner decision'; end if;
 update public.profiles set partner_approval_status=p_decision where id=p_partner_id and role='partner' returning partner_approval_status into v_status;
 if not found then raise exception 'Partner profile not found'; end if;
 return jsonb_build_object('ok',true,'partner_id',p_partner_id,'status',v_status);
end $$;
revoke all on function public.admin_list_driver_applications() from public,anon;
revoke all on function public.admin_list_driver_documents() from public,anon;
revoke all on function public.admin_review_driver(uuid,text) from public,anon;
revoke all on function public.admin_review_driver_document(uuid,text,text) from public,anon;
revoke all on function public.fr_admin_list_partner_applications() from public,anon;
revoke all on function public.fr_admin_review_partner(uuid,text) from public,anon;
grant execute on function public.admin_list_driver_applications() to authenticated;
grant execute on function public.admin_list_driver_documents() to authenticated;
grant execute on function public.admin_review_driver(uuid,text) to authenticated;
grant execute on function public.admin_review_driver_document(uuid,text,text) to authenticated;
grant execute on function public.fr_admin_list_partner_applications() to authenticated;
grant execute on function public.fr_admin_review_partner(uuid,text) to authenticated;
