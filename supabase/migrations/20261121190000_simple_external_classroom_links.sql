-- Simplified external classroom link workflow: no Zoom OAuth/API secrets required.
alter table public.fr_learn_zoom_classrooms add column if not exists external_classroom_url text;
alter table public.fr_learn_sessions add column if not exists external_classroom_url text;
