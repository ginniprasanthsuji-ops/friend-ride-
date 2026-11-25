-- FRIEND RIDE Train Alternative Journey saved itinerary handoff (QA only)
create table if not exists public.fr_train_saved_itineraries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  from_station text not null,
  to_station text not null,
  journey_date date not null,
  travel_class text not null,
  route_summary text not null,
  itinerary_legs jsonb not null default '[]'::jsonb,
  copied_summary text not null,
  created_at timestamptz not null default now(),
  constraint fr_train_itinerary_legs_array check (jsonb_typeof(itinerary_legs) = 'array'),
  constraint fr_train_itinerary_summary_nonempty check (length(trim(copied_summary)) > 0),
  constraint fr_train_itinerary_route_nonempty check (length(trim(route_summary)) > 0)
);
alter table public.fr_train_saved_itineraries enable row level security;
drop policy if exists fr_train_saved_itineraries_select_own on public.fr_train_saved_itineraries;
create policy fr_train_saved_itineraries_select_own on public.fr_train_saved_itineraries for select to authenticated using (user_id = auth.uid());
drop policy if exists fr_train_saved_itineraries_insert_own on public.fr_train_saved_itineraries;
create policy fr_train_saved_itineraries_insert_own on public.fr_train_saved_itineraries for insert to authenticated with check (user_id = auth.uid());
drop policy if exists fr_train_saved_itineraries_delete_own on public.fr_train_saved_itineraries;
create policy fr_train_saved_itineraries_delete_own on public.fr_train_saved_itineraries for delete to authenticated using (user_id = auth.uid());
revoke all on public.fr_train_saved_itineraries from anon;
revoke all on public.fr_train_saved_itineraries from authenticated;
grant select, insert, delete on public.fr_train_saved_itineraries to authenticated;
