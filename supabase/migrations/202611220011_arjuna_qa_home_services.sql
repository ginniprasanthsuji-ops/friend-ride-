-- Project Arjuna QA-only Home Services marketplace schema and RPCs.
create table if not exists public.fr_service_categories(
 id uuid primary key default gen_random_uuid(),slug text not null unique,name text not null,is_active boolean not null default true,sort_order integer not null default 0,created_at timestamptz not null default now()
);
create table if not exists public.fr_service_providers(
 id uuid primary key default gen_random_uuid(),owner_id uuid not null references auth.users(id) on delete cascade,
 category_id uuid not null references public.fr_service_categories(id),display_name text not null,phone text not null,
 description text,city text,service_area text,price_note text,approval_status text not null default 'pending',
 availability text not null default 'offline',created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 business_name text,experience_years integer not null default 0,profile_photo_path text,upi_id text,phonepe_number text,qr_path text
);
create table if not exists public.fr_service_requests(
 id uuid primary key default gen_random_uuid(),request_number text not null unique,customer_id uuid not null references auth.users(id) on delete cascade,
 category_id uuid not null references public.fr_service_categories(id),provider_id uuid references public.fr_service_providers(id),
 service_name text not null,service_address text not null,work_details text not null,preferred_date date not null,preferred_time time not null,
 status text not null default 'requested',provider_quote numeric,customer_phone text,created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create index if not exists qa_service_requests_customer_idx on public.fr_service_requests(customer_id,created_at desc);
create index if not exists qa_service_requests_provider_idx on public.fr_service_requests(provider_id,status);
alter table public.fr_service_categories enable row level security;
alter table public.fr_service_providers enable row level security;
alter table public.fr_service_requests enable row level security;
drop policy if exists qa_service_categories_read_active on public.fr_service_categories;
create policy qa_service_categories_read_active on public.fr_service_categories for select to authenticated using(is_active or exists(select 1 from public.admin_users a where a.user_id=auth.uid()));
drop policy if exists qa_service_categories_admin_manage on public.fr_service_categories;
create policy qa_service_categories_admin_manage on public.fr_service_categories for all to authenticated using(exists(select 1 from public.admin_users a where a.user_id=auth.uid())) with check(exists(select 1 from public.admin_users a where a.user_id=auth.uid()));
drop policy if exists qa_service_providers_read_approved_or_owner on public.fr_service_providers;
create policy qa_service_providers_read_approved_or_owner on public.fr_service_providers for select to authenticated using(approval_status='approved' or owner_id=auth.uid() or exists(select 1 from public.admin_users a where a.user_id=auth.uid()));
drop policy if exists qa_service_providers_admin_manage on public.fr_service_providers;
create policy qa_service_providers_admin_manage on public.fr_service_providers for all to authenticated using(exists(select 1 from public.admin_users a where a.user_id=auth.uid())) with check(exists(select 1 from public.admin_users a where a.user_id=auth.uid()));
drop policy if exists qa_service_requests_read_parties on public.fr_service_requests;
create policy qa_service_requests_read_parties on public.fr_service_requests for select to authenticated using(customer_id=auth.uid() or exists(select 1 from public.fr_service_providers sp where sp.id=provider_id and sp.owner_id=auth.uid()) or exists(select 1 from public.admin_users a where a.user_id=auth.uid()));
drop policy if exists qa_service_requests_insert_customer on public.fr_service_requests;
create policy qa_service_requests_insert_customer on public.fr_service_requests for insert to authenticated with check(customer_id=auth.uid() and status='requested' and provider_id is null);
drop policy if exists qa_service_requests_admin_update on public.fr_service_requests;
create policy qa_service_requests_admin_update on public.fr_service_requests for update to authenticated using(exists(select 1 from public.admin_users a where a.user_id=auth.uid())) with check(exists(select 1 from public.admin_users a where a.user_id=auth.uid()));
insert into public.fr_service_categories(slug,name,sort_order) values
 ('electrician','Electrician',1),('plumber','Plumber',2),('ac-mechanic','AC Technician',3),('appliance-repair','Appliance Repair',4),
 ('house-cleaning','House Cleaning',5),('painting','Painting',6),('carpenter','Carpenter',7),('other','Other Services',8)
on conflict(slug) do update set name=excluded.name,is_active=true,sort_order=excluded.sort_order;
create or replace function public.fr_customer_list_approved_service_providers(p_category_slug text)
returns table(provider_id uuid,display_name text,phone text,service_area text,category_slug text)
language sql stable security definer set search_path=''
as $$
 select sp.id,sp.display_name,sp.phone,sp.service_area,sc.slug from public.fr_service_providers sp join public.fr_service_categories sc on sc.id=sp.category_id
 where sp.approval_status='approved' and sp.availability='online' and sc.is_active=true and (p_category_slug is null or sc.slug=p_category_slug) order by sp.display_name;
$$;
create or replace function public.fr_customer_create_service_request(p_category_slug text,p_provider_id uuid,p_service_address text,p_work_details text,p_preferred_date date,p_preferred_time time)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_uid uuid:=auth.uid();v_category public.fr_service_categories;v_provider public.fr_service_providers;v_id uuid;v_number text;v_phone text;
begin
 if v_uid is null or not exists(select 1 from public.profiles p where p.id=v_uid and p.role='customer') then raise exception 'Customer login required'; end if;
 select * into v_category from public.fr_service_categories where slug=lower(coalesce(p_category_slug,'')) and is_active=true;
 if not found then raise exception 'Select valid service category'; end if;
 if length(btrim(coalesce(p_service_address,'')))<8 or p_service_address is null or length(p_service_address)>1000 or length(btrim(coalesce(p_work_details,'')))<3 or length(p_work_details)>2000 or p_preferred_date is null or p_preferred_date<current_date or p_preferred_time is null then raise exception 'Invalid service booking details'; end if;
 if p_provider_id is not null then select * into v_provider from public.fr_service_providers where id=p_provider_id and category_id=v_category.id and approval_status='approved' and availability='online'; if not found then raise exception 'Selected technician unavailable'; end if; end if;
 select phone into v_phone from public.profiles where id=v_uid;
 v_number:='FRS-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,10));
 insert into public.fr_service_requests(request_number,customer_id,category_id,provider_id,service_name,service_address,work_details,preferred_date,preferred_time,customer_phone,status)
 values(v_number,v_uid,v_category.id,p_provider_id,v_category.name,btrim(p_service_address),btrim(p_work_details),p_preferred_date,p_preferred_time,v_phone,'requested') returning id into v_id;
 return jsonb_build_object('ok',true,'request_id',v_id,'request_number',v_number,'status','requested');
end $$;
create or replace function public.fr_admin_assign_service_provider(p_request_id uuid,p_provider_id uuid)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_category uuid;
begin
 if not exists(select 1 from public.admin_users a where a.user_id=auth.uid()) then raise exception 'Admin access required'; end if;
 select category_id into v_category from public.fr_service_requests where id=p_request_id and status in ('requested','assigned');
 if not found then raise exception 'Service request unavailable'; end if;
 if not exists(select 1 from public.fr_service_providers where id=p_provider_id and category_id=v_category and approval_status='approved' and availability='online') then raise exception 'Provider not approved/online or category mismatch'; end if;
 update public.fr_service_requests set provider_id=p_provider_id,status='assigned',updated_at=now() where id=p_request_id;
 return jsonb_build_object('ok',true,'request_id',p_request_id,'provider_id',p_provider_id,'status','assigned');
end $$;
create or replace function public.fr_service_provider_update_request(p_request_id uuid,p_status text)
returns boolean language plpgsql security definer set search_path=''
as $$
declare v_rows integer;
begin
 if auth.uid() is null or not exists(select 1 from public.fr_service_providers sp where sp.owner_id=auth.uid() and sp.approval_status='approved') then raise exception 'Approved service provider required'; end if;
 if p_status not in ('accepted','rejected','in_progress','completed') then raise exception 'Invalid status'; end if;
 update public.fr_service_requests r set status=p_status,updated_at=now() where r.id=p_request_id and exists(select 1 from public.fr_service_providers sp where sp.id=r.provider_id and sp.owner_id=auth.uid() and sp.approval_status='approved')
 and ((r.status='assigned' and p_status in ('accepted','rejected')) or (r.status='accepted' and p_status='in_progress') or (r.status='in_progress' and p_status='completed'));
 get diagnostics v_rows=row_count; return v_rows=1;
end $$;
revoke all on function public.fr_customer_list_approved_service_providers(text) from public,anon;
revoke all on function public.fr_customer_create_service_request(text,uuid,text,text,date,time) from public,anon;
revoke all on function public.fr_admin_assign_service_provider(uuid,uuid) from public,anon;
revoke all on function public.fr_service_provider_update_request(uuid,text) from public,anon;
grant execute on function public.fr_customer_list_approved_service_providers(text) to authenticated;
grant execute on function public.fr_customer_create_service_request(text,uuid,text,text,date,time) to authenticated;
grant execute on function public.fr_admin_assign_service_provider(uuid,uuid) to authenticated;
grant execute on function public.fr_service_provider_update_request(uuid,text) to authenticated;
