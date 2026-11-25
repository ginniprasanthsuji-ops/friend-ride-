-- Phase 12 QA-only earnings ledger history index
create index if not exists fr_earnings_ledger_owner_created_idx
  on public.fr_earnings_ledger (owner_id, created_at desc);
create index if not exists fr_earnings_ledger_owner_status_created_idx
  on public.fr_earnings_ledger (owner_id, status, created_at desc);