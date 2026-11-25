-- FRIEND RIDE Ticket Helper saved-itinerary indexes (QA only)
create index if not exists fr_train_saved_itineraries_user_created_idx
  on public.fr_train_saved_itineraries (user_id, created_at desc);
create index if not exists fr_train_saved_itineraries_user_journey_date_idx
  on public.fr_train_saved_itineraries (user_id, journey_date);