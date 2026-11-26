-- Project Arjuna QA-only public feedback and approved-store geography RPCs.
create or replace function public.fr_public_homepage_feedback()
returns table(id uuid,display_name text,rating smallint,message text,created_at timestamptz)
language sql stable security definer set search_path=''
as $$
 select f.id,coalesce(nullif(left(btrim(p.full_name),80),''),'FRIEND RIDE Customer')::text,f.rating,f.message,f.created_at
 from public.fr_support_feedback f left join public.profiles p on p.id=f.user_id
 where f.kind='feedback' and f.show_on_homepage=true and f.status='published'
 order by f.created_at desc limit 20;
$$;
create or replace function public.fr_customer_list_approved_stores_geo(p_category text default null)
returns table(id uuid,business_name text,partner_category text,address text,latitude double precision,longitude double precision)
language sql stable security definer set search_path=''
as $$
 select p.id,p.business_name,p.partner_category,p.address,p.business_latitude,p.business_longitude
 from public.profiles p where lower(coalesce(p.role,''))='partner' and lower(coalesce(p.partner_approval_status,'pending'))='approved'
 and (p_category is null or lower(coalesce(p.partner_category,'other'))=lower(p_category))
 order by lower(coalesce(p.business_name,''));
$$;
revoke all on function public.fr_public_homepage_feedback() from public;
revoke all on function public.fr_customer_list_approved_stores_geo(text) from public,anon;
grant execute on function public.fr_public_homepage_feedback() to anon,authenticated;
grant execute on function public.fr_customer_list_approved_stores_geo(text) to authenticated;
