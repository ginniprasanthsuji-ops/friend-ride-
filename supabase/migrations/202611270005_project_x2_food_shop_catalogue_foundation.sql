-- Project X2 Food/Shop catalogue foundation
-- Target: yt-test-1-to-15 QA branch only. Review before applying to QA.
begin;

create table if not exists public.fr_partner_catalogue_items (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.profiles(id) on delete cascade,
  master_sku text not null,
  item_name text not null,
  category text not null,
  unit text,
  description text,
  price_paise integer,
  offer_price_paise integer,
  image_url text,
  available boolean not null default true,
  prescription_required boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fr_partner_catalogue_sku_nonempty check (length(trim(master_sku)) > 0),
  constraint fr_partner_catalogue_name_nonempty check (length(trim(item_name)) > 0),
  constraint fr_partner_catalogue_category_nonempty check (length(trim(category)) > 0),
  constraint fr_partner_catalogue_price_nonnegative check (price_paise is null or price_paise >= 0),
  constraint fr_partner_catalogue_offer_nonnegative check (offer_price_paise is null or offer_price_paise >= 0),
  constraint fr_partner_catalogue_offer_le_price check (offer_price_paise is null or price_paise is null or offer_price_paise <= price_paise)
);

create unique index if not exists fr_partner_catalogue_owner_sku_uq
  on public.fr_partner_catalogue_items(partner_id, master_sku);
create index if not exists fr_partner_catalogue_customer_lookup_idx
  on public.fr_partner_catalogue_items(partner_id, available, category);

alter table public.fr_partner_catalogue_items enable row level security;
-- Catalogue access is RPC-only; authenticated clients receive no direct table grants.
revoke all on public.fr_partner_catalogue_items from anon, authenticated;

create or replace function public.fr_partner_save_catalogue_item(
  p_master_sku text,
  p_item_name text,
  p_category text,
  p_unit text default null,
  p_description text default null,
  p_price_paise integer default null,
  p_offer_price_paise integer default null,
  p_image_url text default null,
  p_available boolean default true,
  p_prescription_required boolean default false
)
returns table(id uuid, master_sku text, item_name text, category text, unit text, description text, price_paise integer, offer_price_paise integer, image_url text, available boolean, prescription_required boolean)
language plpgsql security definer set search_path=''
as $$
declare v_partner uuid := auth.uid();
begin
 if v_partner is null then raise exception 'Authentication required'; end if;
 if not exists(select 1 from public.profiles p where p.id=v_partner and lower(coalesce(p.role,''))='partner' and lower(coalesce(p.partner_approval_status,'pending'))='approved') then
   raise exception 'Approved partner account required';
 end if;
 if p_master_sku is null or length(trim(p_master_sku))=0 or length(p_master_sku)>120 then raise exception 'Invalid SKU'; end if;
 if p_item_name is null or length(trim(p_item_name))=0 or length(p_item_name)>200 then raise exception 'Invalid item name'; end if;
 if p_category is null or length(trim(p_category))=0 or length(p_category)>100 then raise exception 'Invalid category'; end if;
 if p_price_paise is not null and p_price_paise<0 then raise exception 'Price cannot be negative'; end if;
 if p_offer_price_paise is not null and (p_offer_price_paise<0 or p_price_paise is null or p_offer_price_paise>p_price_paise) then raise exception 'Offer price must be non-negative and not exceed base price'; end if;
 return query
 insert into public.fr_partner_catalogue_items as c(partner_id,master_sku,item_name,category,unit,description,price_paise,offer_price_paise,image_url,available,prescription_required,updated_at)
 values(v_partner,trim(p_master_sku),trim(p_item_name),trim(p_category),nullif(trim(coalesce(p_unit,'')),''),nullif(trim(coalesce(p_description,'')),''),p_price_paise,p_offer_price_paise,nullif(trim(coalesce(p_image_url,'')),''),coalesce(p_available,true),coalesce(p_prescription_required,false),now())
 on conflict(partner_id,master_sku) do update set item_name=excluded.item_name,category=excluded.category,unit=excluded.unit,description=excluded.description,price_paise=excluded.price_paise,offer_price_paise=excluded.offer_price_paise,image_url=excluded.image_url,available=excluded.available,prescription_required=excluded.prescription_required,updated_at=now()
 returning c.id,c.master_sku,c.item_name,c.category,c.unit,c.description,c.price_paise,c.offer_price_paise,c.image_url,c.available,c.prescription_required;
end; $$;

create or replace function public.fr_partner_list_catalogue()
returns table(id uuid, master_sku text, item_name text, category text, unit text, description text, price_paise integer, offer_price_paise integer, image_url text, available boolean, prescription_required boolean)
language sql stable security definer set search_path=''
as $$
 select c.id,c.master_sku,c.item_name,c.category,c.unit,c.description,c.price_paise,c.offer_price_paise,c.image_url,c.available,c.prescription_required
 from public.fr_partner_catalogue_items c
 where c.partner_id=auth.uid()
 order by c.category,c.item_name;
$$;

create or replace function public.fr_customer_list_partner_catalogue(p_store_id uuid)
returns table(id uuid, master_sku text, item_name text, category text, unit text, description text, price_paise integer, offer_price_paise integer, image_url text, available boolean, prescription_required boolean)
language sql stable security definer set search_path=''
as $$
 select c.id,c.master_sku,c.item_name,c.category,c.unit,c.description,c.price_paise,c.offer_price_paise,c.image_url,c.available,c.prescription_required
 from public.fr_partner_catalogue_items c
 join public.profiles p on p.id=c.partner_id
 where c.partner_id=p_store_id
   and lower(coalesce(p.role,''))='partner'
   and lower(coalesce(p.partner_approval_status,'pending'))='approved'
   and c.available=true
 order by c.category,c.item_name;
$$;

revoke all on function public.fr_partner_save_catalogue_item(text,text,text,text,text,integer,integer,text,boolean,boolean) from public, anon;
revoke all on function public.fr_partner_list_catalogue() from public, anon;
revoke all on function public.fr_customer_list_partner_catalogue(uuid) from public, anon;
grant execute on function public.fr_partner_save_catalogue_item(text,text,text,text,text,integer,integer,text,boolean,boolean) to authenticated;
grant execute on function public.fr_partner_list_catalogue() to authenticated;
grant execute on function public.fr_customer_list_partner_catalogue(uuid) to authenticated;

commit;
