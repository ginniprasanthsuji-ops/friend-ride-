-- Project Arjuna QA hardening: prevent KYC applicants from forging reviewer metadata.
-- QA branch only; production apply requires separate review.
drop policy if exists qa_driver_documents_insert_own_pending on public.fr_driver_documents;
create policy qa_driver_documents_insert_own_pending on public.fr_driver_documents
for insert to authenticated
with check (
  owner_id = auth.uid()
  and driver_id = auth.uid()
  and verification_status = 'pending'
  and review_note is null
  and reviewed_by is null
  and reviewed_at is null
);

drop policy if exists qa_driver_documents_update_own_pending on public.fr_driver_documents;
create policy qa_driver_documents_update_own_pending on public.fr_driver_documents
for update to authenticated
using (
  owner_id = auth.uid()
  and driver_id = auth.uid()
  and verification_status = 'pending'
  and review_note is null
  and reviewed_by is null
  and reviewed_at is null
)
with check (
  owner_id = auth.uid()
  and driver_id = auth.uid()
  and verification_status = 'pending'
  and review_note is null
  and reviewed_by is null
  and reviewed_at is null
);
