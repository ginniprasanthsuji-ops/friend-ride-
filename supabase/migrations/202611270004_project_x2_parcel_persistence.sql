-- Project X2: authenticated parcel request persistence and customer tracking
create table if not exists public.fr_parcel_requests (
 id uuid primary key default gen_random_uuid(),
 tracking_id text not null unique,
 customer_id uuid not null references auth.users(id) on delete cascade,
 sender_name text not null,
 sender_phone text not null check(sender_phone ~ '^[0-9]{10}$'),
 pickup_address text not null,
 receiver_name text not null,
 receiver_phone text not null check(receiver_phone ~ '^[0-9]{10}$'),
 delivery_address text not null,
 description text not null,
 weight_kg numeric(7,2) not null check(weight_kg > 0 and weight_kg <= 100),
 status text not null default 'requested' check(status in ('requested','accepted','payment_collected','otp_issued','delivered','completed','cancelled','rejected')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists fr_parcel_requests_customer_created_idx on public.fr_parcel_requests(customer_id,created_at desc);
alter table public.fr_parcel_requests enable row level security;
drop policy if exists fr_parcel_customer_select on public.fr_parcel_requests;
create policy fr_parcel_customer_select on public.fr_parcel_requests for select to authenticated using(customer_id=auth.uid());
revoke all on public.fr_parcel_requests from anon,authenticated;

create or replace function public.fr_customer_create_parcel_request(
 p_sender_name text,p_sender_phone text,p_pickup_address text,
 p_receiver_name text,p_receiver_phone text,p_delivery_address text,
 p_description text,p_weight_kg numeric
) returns table(parcel_id uuid,tracking_id text,status text)
language plpgsql security definer set search_path='' as $$
declare v_id uuid; v_tracking text;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if not exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='customer') then raise exception 'Customer account required'; end if;
 if nullif(trim(p_sender_name),'') is null or nullif(trim(p_receiver_name),'') is null
 or nullif(trim(p_pickup_address),'') is null or nullif(trim(p_delivery_address),'') is null
 or nullif(trim(p_description),'') is null then raise exception 'Required parcel details missing'; end if;
 if p_sender_phone !~ '^[0-9]{10}$' or p_receiver_phone !~ '^[0-9]{10}$' then raise exception 'Invalid phone number'; end if;
 if p_weight_kg is null or p_weight_kg<=0 or p_weight_kg>100 then raise exception 'Weight must be between 0.1 and 100 kg'; end if;
 v_id:=gen_random_uuid();v_tracking:='FRP-'||upper(substr(replace(v_id::text,'-',''),1,12));
 insert into public.fr_parcel_requests(id,tracking_id,customer_id,sender_name,sender_phone,pickup_address,receiver_name,receiver_phone,delivery_address,description,weight_kg)
 values(v_id,v_tracking,auth.uid(),trim(p_sender_name),p_sender_phone,trim(p_pickup_address),trim(p_receiver_name),p_receiver_phone,trim(p_delivery_address),trim(p_description),p_weight_kg);
 return query select v_id,v_tracking,'requested'::text;
end $$;
create or replace function public.fr_customer_list_parcel_requests()
returns table(parcel_id uuid,tracking_id text,status text,pickup_address text,delivery_address text,description text,weight_kg numeric,created_at timestamptz)
language sql security definer set search_path='' as $$
 select id,tracking_id,status,pickup_address,delivery_address,description,weight_kg,created_at
 from public.fr_parcel_requests where auth.uid() is not null and customer_id=auth.uid() order by created_at desc
$$;
create or replace function public.fr_customer_cancel_parcel_request(p_parcel_id uuid)
returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 update public.fr_parcel_requests p set status='cancelled',updated_at=now()
 where p.id=p_parcel_id and p.customer_id=auth.uid() and p.status='requested';
 if not found then raise exception 'Parcel not found or no longer cancellable'; end if;
end $$;
revoke all on function public.fr_customer_create_parcel_request(text,text,text,text,text,text,text,numeric) from public,anon;
revoke all on function public.fr_customer_list_parcel_requests() from public,anon;
revoke all on function public.fr_customer_cancel_parcel_request(uuid) from public,anon;
grant execute on function public.fr_customer_create_parcel_request(text,text,text,text,text,text,text,numeric) to authenticated;
grant execute on function public.fr_customer_list_parcel_requests() to authenticated;
grant execute on function public.fr_customer_cancel_parcel_request(uuid) to authenticated;
notify pgrst,'reload schema';
