-- Phase 13D QA: private payment QR storage bucket and participant-scoped read policy
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('provider-payment-qr','provider-payment-qr',false,5242880,array['image/png','image/jpeg','image/webp'])
on conflict(id) do update set public=false,file_size_limit=5242880,allowed_mime_types=array['image/png','image/jpeg','image/webp'];

drop policy if exists fr_provider_payment_qr_owner_upload on storage.objects;
create policy fr_provider_payment_qr_owner_upload on storage.objects for insert to authenticated
with check(bucket_id='provider-payment-qr' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists fr_provider_payment_qr_owner_update on storage.objects;
create policy fr_provider_payment_qr_owner_update on storage.objects for update to authenticated
using(bucket_id='provider-payment-qr' and (storage.foldername(name))[1]=auth.uid()::text)
with check(bucket_id='provider-payment-qr' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists fr_provider_payment_qr_participant_read on storage.objects;
create policy fr_provider_payment_qr_participant_read on storage.objects for select to authenticated
using(bucket_id='provider-payment-qr' and exists(
 select 1 from public.fr_ride_payment_sessions s where s.qr_path=storage.objects.name and (s.customer_id=auth.uid() or s.driver_id=auth.uid())
));
drop policy if exists fr_provider_payment_qr_owner_delete on storage.objects;
create policy fr_provider_payment_qr_owner_delete on storage.objects for delete to authenticated
using(bucket_id='provider-payment-qr' and (storage.foldername(name))[1]=auth.uid()::text);
