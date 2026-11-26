-- Project Arjuna QA-only TASKO and Laundry provider transitions.
create or replace function public.fr_laundry_provider_transition(p_booking_id uuid,p_action text)
returns public.fr_service_bookings language plpgsql security definer set search_path=''
as $$
declare v_row public.fr_service_bookings; v_next text;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if p_action not in ('accept','start','complete') then raise exception 'Invalid action'; end if;
 select * into v_row from public.fr_service_bookings where id=p_booking_id and service_type='laundry' and assigned_provider_id=auth.uid() for update;
 if not found then raise exception 'Assigned Laundry booking not found'; end if;
 if p_action='accept' and v_row.status='assigned' then v_next:='accepted';
 elsif p_action='start' and v_row.status='accepted' then v_next:='in_progress';
 elsif p_action='complete' and v_row.status='in_progress' then v_next:='completed';
 else raise exception 'Invalid Laundry status transition'; end if;
 update public.fr_service_bookings set status=v_next,updated_at=now() where id=p_booking_id returning * into v_row; return v_row;
end $$;
create or replace function public.fr_tasko_provider_transition(p_booking_id uuid,p_action text,p_actual_hours numeric default null)
returns public.fr_service_bookings language plpgsql security definer set search_path=''
as $$
declare v_row public.fr_service_bookings; v_amount numeric(10,2);
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if p_action not in ('accept','start','complete') then raise exception 'Invalid action'; end if;
 select * into v_row from public.fr_service_bookings where id=p_booking_id and service_type='tasko' and assigned_provider_id=auth.uid() for update;
 if not found then raise exception 'Assigned TASKO booking not found'; end if;
 if p_action='accept' then
  if v_row.status<>'assigned' then raise exception 'Booking is not awaiting acceptance'; end if;
  update public.fr_service_bookings set status='accepted',updated_at=now() where id=p_booking_id returning * into v_row;
 elsif p_action='start' then
  if v_row.status<>'accepted' then raise exception 'Booking must be accepted first'; end if;
  update public.fr_service_bookings set status='in_progress',updated_at=now() where id=p_booking_id returning * into v_row;
 else
  if v_row.status<>'in_progress' then raise exception 'Work must be in progress before completion'; end if;
  if p_actual_hours is null or p_actual_hours<=0 or p_actual_hours>24 then raise exception 'Enter actual work hours between 0 and 24'; end if;
  if p_actual_hours<=6 then
   if v_row.quoted_amount is null or v_row.quoted_amount<150 or v_row.quoted_amount>400 then raise exception 'Admin must set approved base quote between 150 and 400'; end if;
   v_amount:=v_row.quoted_amount;
  else v_amount:=400+((p_actual_hours-6)*50); end if;
  update public.fr_service_bookings set status='completed',actual_hours=p_actual_hours,final_amount=v_amount,payment_status='pending',updated_at=now() where id=p_booking_id returning * into v_row;
 end if;
 return v_row;
end $$;
revoke all on function public.fr_laundry_provider_transition(uuid,text) from public,anon;
revoke all on function public.fr_tasko_provider_transition(uuid,text,numeric) from public,anon;
grant execute on function public.fr_laundry_provider_transition(uuid,text) to authenticated;
grant execute on function public.fr_tasko_provider_transition(uuid,text,numeric) to authenticated;
