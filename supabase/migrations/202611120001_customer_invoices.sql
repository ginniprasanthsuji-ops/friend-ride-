-- FRIEND RIDE customer invoice records and private PDF storage (QA)
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete restrict,
  invoice_number text not null unique,
  document_type text not null default 'payment_receipt'
    check (document_type in ('payment_receipt','tax_invoice','credit_note')),
  source_type text not null,
  source_id text,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'INR',
  payment_status text not null default 'pending'
    check (payment_status in ('pending','paid','failed','refunded')),
  issued_at timestamptz,
  pdf_path text,
  email_status text not null default 'not_sent'
    check (email_status in ('not_sent','queued','sent','failed')),
  customer_name text,
  customer_email text,
  seller_name text,
  seller_gstin text,
  place_of_supply text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists invoices_source_unique_idx
  on public.invoices(source_type, source_id, document_type)
  where source_id is not null;
create index if not exists invoices_customer_issued_idx
  on public.invoices(customer_id, issued_at desc);
alter table public.invoices enable row level security;
drop policy if exists "Customers read own invoices" on public.invoices;
create policy "Customers read own invoices" on public.invoices
  for select to authenticated using ((select auth.uid()) = customer_id);
revoke insert, update, delete on public.invoices from anon, authenticated;
grant select on public.invoices to authenticated;

create table if not exists public.invoice_email_logs (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  recipient_email text not null,
  provider text not null default 'resend',
  provider_message_id text,
  status text not null check(status in ('queued','sent','failed')),
  error_message text,
  created_at timestamptz not null default now()
);
alter table public.invoice_email_logs enable row level security;
revoke all on public.invoice_email_logs from anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('friendride-invoices','friendride-invoices',false,10485760,array['application/pdf'])
on conflict (id) do update set public=false, file_size_limit=10485760, allowed_mime_types=array['application/pdf'];
drop policy if exists "Customers read own invoice PDFs" on storage.objects;
create policy "Customers read own invoice PDFs" on storage.objects
  for select to authenticated
  using (bucket_id='friendride-invoices' and (storage.foldername(name))[1]=(select auth.uid())::text);
