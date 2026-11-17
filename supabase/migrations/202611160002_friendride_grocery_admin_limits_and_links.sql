-- FRIEND RIDE SMART GROCERY EMI: additive QA-only extension
-- This file is intentionally NOT applied to the connected production Supabase project.
-- Admin link management must be exposed only through an Edge Function that verifies
-- the authenticated user's server-controlled app_metadata/role or existing trusted
-- admin ACL. Never trust user_metadata or a browser-supplied role.

alter table public.fr_grocery_applications
  add column if not exists cibil_band text
    check (cibil_band is null or cibil_band in ('below_750','750_799','800_849','850_900')),
  add column if not exists suggested_grocery_limit numeric(12,2)
    check (suggested_grocery_limit is null or suggested_grocery_limit in (5000,6000,7000)),
  add column if not exists final_grocery_limit numeric(12,2)
    check (final_grocery_limit is null or final_grocery_limit >= 0),
  add column if not exists limit_approved_by uuid references auth.users(id),
  add column if not exists limit_approved_at timestamptz;

-- This is a configuration store, not a lending/card issuance facility.
-- The bank/issuer owns all FD, card, credit and EMI decisions.
create table if not exists public.fr_grocery_admin_links (
  id uuid primary key default gen_random_uuid(),
  config_key text not null unique check (config_key = 'active'),
  fd_secured_card_url text,
  new_credit_card_url text,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now(),
  constraint fd_card_url_https check (fd_secured_card_url is null or fd_secured_card_url ~ '^https://'),
  constraint new_card_url_https check (new_credit_card_url is null or new_credit_card_url ~ '^https://')
);

alter table public.fr_grocery_admin_links enable row level security;

-- No anon/authenticated policies by design: browser clients cannot read or write
-- this configuration directly. A verified Admin Edge Function reads/updates it.
-- The Edge Function must use the server-side secret key, never expose it to clients.

create index if not exists fr_grocery_applications_review_queue_idx
  on public.fr_grocery_applications (application_status, created_at desc);

comment on column public.fr_grocery_applications.suggested_grocery_limit is
  'Illustrative internal grocery membership spending suggestion only; not a credit facility or bank limit.';
comment on column public.fr_grocery_applications.final_grocery_limit is
  'FR admin-approved grocery programme cap only; not bank credit, FD value or EMI approval.';
comment on table public.fr_grocery_admin_links is
  'Admin-managed issuer application URLs; access only through an authenticated, server-verified Admin Edge Function.';
