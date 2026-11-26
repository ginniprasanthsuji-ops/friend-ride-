-- Phase 13D QA: private service-provider KYC bucket
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('fr-service-provider-kyc','fr-service-provider-kyc',false,5242880,array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict(id) do update set public=false,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp','application/pdf'];
drop policy if exists fr_service_provider_kyc_upload_own on storage.objects;
create policy fr_service_provider_kyc_upload_own on storage.objects for insert to authenticated
with check(bucket_id='fr-service-provider-kyc' and (storage.foldername(name))[1]=(select auth.uid())::text);
drop policy if exists fr_service_provider_kyc_read_own_admin on storage.objects;
create policy fr_service_provider_kyc_read_own_admin on storage.objects for select to authenticated
using(bucket_id='fr-service-provider-kyc' and ((storage.foldername(name))[1]=(select auth.uid())::text or exists(select 1 from public.admin_users a where a.user_id=(select auth.uid()))));
drop policy if exists fr_service_provider_kyc_update_own on storage.objects;
create policy fr_service_provider_kyc_update_own on storage.objects for update to authenticated
using(bucket_id='fr-service-provider-kyc' and (storage.foldername(name))[1]=(select auth.uid())::text)
with check(bucket_id='fr-service-provider-kyc' and (storage.foldername(name))[1]=(select auth.uid())::text);
drop policy if exists fr_service_provider_kyc_delete_own on storage.objects;
create policy fr_service_provider_kyc_delete_own on storage.objects for delete to authenticated
using(bucket_id='fr-service-provider-kyc' and (storage.foldername(name))[1]=(select auth.uid())::text);
