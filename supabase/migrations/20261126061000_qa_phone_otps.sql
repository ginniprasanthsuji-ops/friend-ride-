-- QA-only SMS OTP storage. No client-facing policies; Edge Function uses service role.
create table if not exists public.phone_otps (
  mobile text primary key,
  otp_hash text not null,
  expires_at timestamptz not null,
  attempts integer not null default 0,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.phone_otps enable row level security;
revoke all on public.phone_otps from anon, authenticated;
grant all on public.phone_otps to service_role;
